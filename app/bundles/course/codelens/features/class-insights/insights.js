import { dimensions } from '../../model.js';
import { practiceFunctions } from '../../course.js';
const day = 86400000;
export const supportBelow = 0.5;
export const fewAttempts = 3;
export const gapCount = 5;
const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
function byLensOf(attempts) {
  const items = attempts.flatMap(a => a.items);
  return Object.fromEntries(dimensions.map(lens => [lens, mean(items.filter(i => i.lens === lens).map(i => i.value))]));
}
function byFunctionOf(attempts) {
  return Object.fromEntries(practiceFunctions.map(fn => {
    const mine = attempts.filter(a => a.function === fn);
    return [fn, mean(fn === 'lens-review' ? mine.map(a => a.score) : mine.flatMap(a => a.items.map(i => i.value)))];
  }));
}
function supportFor(student, attempts) {
  const lenses = byLensOf(attempts);
  const low = dimensions.filter(lens => lenses[lens] !== null && lenses[lens] < supportBelow);
  if (!low.length) return null;
  const weakest = low.reduce((a, b) => lenses[b] < lenses[a] ? b : a);
  const patterns = [];
  if (attempts.some(a => a.confidentWrong)) patterns.push('Confident but often wrong');
  if (attempts.length < fewAttempts) patterns.push('Low scores, few attempts');
  if (!patterns.length) patterns.push('Low scores');
  return { student, weakest, score: lenses[weakest], patterns, attempts: attempts.length, lastActive: attempts.map(a => a.date).sort().at(-1) };
}
// Most-missed issues and most-chosen wrong answers.
export function commonGaps(attempts) {
  const gaps = new Map();
  for (const item of attempts.flatMap(a => a.items).filter(i => i.claim)) {
    const key = `${item.title}|${item.claim}`;
    const gap = gaps.get(key) || { key, title: item.title, detail: item.claim, lens: item.lens, count: 0, of: 0 };
    gap.of += 1;
    if (item.value === 0) gap.count += 1;
    gaps.set(key, gap);
  }
  return [...gaps.values()].filter(g => g.count > 0).sort((a, b) => b.count - a.count || b.count / b.of - a.count / a.of).slice(0, gapCount);
}
// 👍 ÷ (👍 + 👎) per function, separately for students and TAs.
export function feedbackQuality(votes) {
  return Object.fromEntries(practiceFunctions.map(fn => {
    const of = role => {
      const mine = votes.filter(v => v.function === fn && v.role === role);
      const up = mine.filter(v => v.vote === 'up').length;
      return { up, down: mine.length - up, share: mine.length ? up / mine.length : null };
    };
    return [fn, { student: of('student'), ta: of('ta') }];
  }));
}
export function computeInsights(all, votes, now = new Date()) {
  const attempts = all.filter(a => now.getTime() - new Date(a.date).getTime() <= 30 * day);
  const students = [...new Set(attempts.map(a => a.student))];
  return {
    activeStudents: students.length,
    attempts: attempts.length,
    fromSuggestionShare: attempts.length ? attempts.filter(a => a.fromSuggestion).length / attempts.length : null,
    byFunction: byFunctionOf(attempts),
    byLens: byLensOf(attempts),
    gaps: commonGaps(attempts),
    toSupport: students.map(s => supportFor(s, attempts.filter(a => a.student === s))).filter(Boolean).sort((a, b) => a.score - b.score),
    quality: feedbackQuality(votes),
  };
}
