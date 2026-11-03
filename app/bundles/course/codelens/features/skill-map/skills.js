import { dimensions } from '../../model.js';
import { functionNames, practiceFunctions } from '../../course.js';
export const windowDays = 30;
export const minItems = 3;
const mean = values => ({ value: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null, items: values.length });
export function computeSkillMap(summaries, now = new Date()) {
  const recent = summaries.filter(s => now.getTime() - new Date(s.date).getTime() <= windowDays * 86400000);
  const items = recent.flatMap(s => s.items);
  const byLens = Object.fromEntries(dimensions.map(lens => {
    const mine = items.filter(i => i.lens === lens);
    const values = source => mine.filter(i => i.source === source).map(i => i.value);
    return [lens, { ...mean(mine.map(i => i.value)), exam: mean(values('exam')), review: mean(values('review')) }];
  }));
  const byFunction = Object.fromEntries(practiceFunctions.map(fn => {
    const mine = recent.filter(s => s.function === fn);
    const values = fn === 'lens-review' ? mine.map(s => s.score) : mine.flatMap(s => s.items.map(i => i.value));
    return [fn, { ...mean(values), attempts: mine.length }];
  }));
  // Lenses with enough answers compete; the first in the list wins a tie.
  const ready = dimensions.filter(lens => byLens[lens].items >= minItems);
  const weakest = ready.length >= 2 ? ready.reduce((low, lens) => byLens[lens].value < byLens[low].value ? lens : low) : null;
  return { recent, byLens, byFunction, weakest };
}
const examFunction = { Correctness: 'dry-run', Appropriateness: 'concept-match' };
export function practiseTarget(lens, has) {
  const fn = examFunction[lens];
  return fn && has(fn) ? fn : 'lens-review';
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
