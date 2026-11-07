// Course setup shared by every practice function. Sample data in the browser, no backend.
export const topics = [
  { id: 'functions-conditionals', name: 'Functions & conditionals' },
  { id: 'loops', name: 'Loops' },
  { id: 'lists-strings', name: 'Lists & strings' },
];
export const difficulties = ['easy', 'medium', 'hard'];
export const practiceFunctions = ['dry-run', 'concept-match', 'lens-review'];
export const functionNames = { 'dry-run': 'Dry Run', 'concept-match': 'Concept Match', 'lens-review': 'Lens Review' };
export const topicName = id => topics.find(topic => topic.id === id)?.name || 'Mixed topics';
export const label = text => text[0].toUpperCase() + text.slice(1);

const key = 'codelens-course-v1';
export const defaultCourse = () => ({ publishedTopics: topics.map(topic => topic.id), examplesRequired: 3, approved: null });
export function readCourse() {
  try { return { ...defaultCourse(), ...JSON.parse(localStorage.getItem(key) || '{}') }; }
  catch { return defaultCourse(); }
}
export function writeCourse(course) {
  try { localStorage.setItem(key, JSON.stringify(course)); } catch { /* The setting lasts for this session's screen only. */ }
}
// `approved` is only set once a TA has used Content Studio; before that nothing is gated.
export function isUnlocked(fn, course = readCourse()) {
  return !course.approved || (course.approved[fn] || 0) >= course.examplesRequired;
}

// Once a TA has used Content Studio, students only get the exercises approved there.
export function approvedItems(fn, items, course = readCourse()) {
  if (!course.approvedIds) return items;
  const ids = course.approvedIds[fn] || [];
  return items.filter(item => ids.includes(item.id));
}

// Choose among published topics at this difficulty, preferring what this student hasn't done.
export function eligibleItems(items, difficulty, published) {
  return items.filter(item => item.difficulty === difficulty && published.includes(item.topicId));
}
export function pickItems(items, count, doneIds = [], rng = Math.random) {
  const shuffled = [...items].map(item => [rng(), item]).sort((a, b) => a[0] - b[0]).map(pair => pair[1]);
  const fresh = shuffled.filter(item => !doneIds.includes(item.id));
  return [...fresh, ...shuffled.filter(item => doneIds.includes(item.id))].slice(0, count);
}
