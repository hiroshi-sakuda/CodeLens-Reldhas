import { dimensions } from '../../model.js';
import { functionNames, practiceFunctions, topics as courseTopics } from '../../course.js';
import { lastDifficulty } from '../../practice-log.js';
export const windowDays = 30;
export const minItems = 3;
const sum = values => values.reduce((a, b) => a + b, 0);
// points: what was earned out of items, so a score can be shown as 3 / 7.
const mean = values => ({ value: values.length ? sum(values) / values.length : null, items: values.length, points: sum(values) });
// Weakest topic first.
function byTopic(entries) {
  const names = [...new Set(entries.map(e => e.topic).filter(Boolean))];
  return names.map(topic => ({ topic, ...mean(entries.filter(e => e.topic === topic).map(e => e.value)) })).sort((a, b) => a.value - b.value);
}
export const trendWeeks = 4;
// The average score of each of the last four weeks, oldest first. A week with no practice has no value.
export function improvementTrend(summaries, now = new Date()) {
  const week = 7 * 86400000;
  const weeks = Array.from({ length: trendWeeks }, (_, i) => {
    const to = now.getTime() - (trendWeeks - 1 - i) * week;
    const scores = summaries.filter(s => { const t = new Date(s.date).getTime(); return t > to - week && t <= to; }).map(s => s.score);
    return { label: `Week ${i + 1}`, ...mean(scores) };
  });
  const seen = weeks.filter(w => w.value != null);
  return { weeks, change: seen.length >= 2 ? seen.at(-1).value - seen[0].value : null, first: seen[0] || null, last: seen.at(-1) || null };
}
export function computeSkillMap(summaries, now = new Date()) {
  const recent = summaries.filter(s => now.getTime() - new Date(s.date).getTime() <= windowDays * 86400000);
  const items = recent.flatMap(s => s.items);
  const byLens = Object.fromEntries(dimensions.map(lens => {
    const mine = items.filter(i => i.lens === lens);
    const values = source => mine.filter(i => i.source === source).map(i => i.value);
    return [lens, { ...mean(mine.map(i => i.value)), topics: byTopic(mine), exam: mean(values('exam')), review: mean(values('review')) }];
  }));
  const byFunction = Object.fromEntries(practiceFunctions.map(fn => {
    const mine = recent.filter(s => s.function === fn);
    const entries = fn === 'lens-review' ? mine.map(s => ({ topic: s.topic, value: s.score })) : mine.flatMap(s => s.items);
    return [fn, { ...mean(entries.map(e => e.value)), topics: byTopic(entries), attempts: mine.length }];
  }));
  // Lenses with enough answers compete; the first in the list wins a tie.
  const ready = dimensions.filter(lens => byLens[lens].items >= minItems);
  const weakest = ready.length >= 2 ? ready.reduce((low, lens) => byLens[lens].value < byLens[low].value ? lens : low) : null;
  return { recent, byLens, byFunction, weakest, trend: improvementTrend(summaries, now) };
}
const examFunction = { Correctness: 'dry-run', Appropriateness: 'concept-match' };
export function practiseTarget(lens, has) {
  const fn = examFunction[lens];
  return fn && has(fn) ? fn : 'lens-review';
}
// Where a Practise button goes: the exam-style exercise for a course topic, otherwise Lens Review with that lens chosen.
export function practiseParams(lens, topic, has) {
  const id = practiseTarget(lens, has);
  if (id !== 'lens-review') {
    const course = courseTopics.find(t => t.name === topic);
    if (course || !topic) return { id, params: { fromSuggestion: true, difficulty: lastDifficulty(id), ...(course ? { topicId: course.id } : {}) } };
  }
  return { id: 'lens-review', params: { setup: true, focus: [lens], topic } };
}
export function usualSlip(map, lens) {
  const { exam, review } = map.byLens[lens];
  const fn = examFunction[lens];
  if (fn && exam.value !== null && (review.value === null || exam.value <= review.value)) {
    return lens === 'Correctness'
      ? `In ${functionNames[fn]}, your trace often goes wrong: check each condition again at the last iteration.`
      : `In ${functionNames[fn]}, you often pick an approach that works but isn't the best fit for what the story asks.`;
  }
  return `In Lens Review, you often miss the ${lens.toLowerCase()} issues in the code.`;
}
