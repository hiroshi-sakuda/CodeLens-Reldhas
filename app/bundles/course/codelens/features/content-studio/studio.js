import { practiceFunctions } from '../../course.js';
// A sample is pending, approved, rejected or replaced. Without a status it hasn't been generated yet.
const seededApproved = 3, seededPending = 2;
export function seedStatuses(library) {
  const statuses = {};
  for (const fn of practiceFunctions) {
    library.filter(s => s.function === fn).slice(0, seededApproved + seededPending).forEach((s, i) => { statuses[s.id] = i < seededApproved ? 'approved' : 'pending'; });
  }
  return statuses;
}
// The IDs students get: Lens Review samples point at their exercise.
export const approvedIds = (library, statuses) => Object.fromEntries(practiceFunctions.map(fn => [fn, library.filter(s => s.function === fn && statuses[s.id] === 'approved').map(s => s.exerciseId ?? s.id)]));
export const approvedCounts = (library, statuses) => Object.fromEntries(practiceFunctions.map(fn => [fn, library.filter(s => s.function === fn && statuses[s.id] === 'approved').length]));
// Generate reveals samples nobody has seen yet for this function and topic.
export function nextSamples(library, statuses, fn, topicId, count = 2) {
  return library.filter(s => s.function === fn && !statuses[s.id] && (!s.topicId || s.topicId === topicId)).slice(0, count).map(s => s.id);
}
export function regenerate(library, statuses, sample) {
  const [replacement] = nextSamples(library, statuses, sample.function, sample.topicId, 1);
  if (!replacement) return null;
  return { ...statuses, [sample.id]: 'replaced', [replacement]: 'pending' };
}
export const validRequired = value => Number.isInteger(value) && value >= 1 && value <= 20;
