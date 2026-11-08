import { dimensions, exercises } from './model.js';
import { approvedItems } from './course.js';
const studentExercises = () => approvedItems('lens-review', exercises);

export function eligibleExercises(topic, focus, bank = exercises) {
  if (!focus.length || focus.some(area => !dimensions.includes(area))) return [];
  return bank.filter(exercise => (topic === 'Random' || exercise.topic === topic)
    && exercise.findings.every(finding => focus.includes(finding.dimension)));
}

// Choose once at the start of an attempt; never re-roll during rendering or reload.
export function choosePractice(topic, focus, randomFocus, rng = Math.random, bank = studentExercises()) {
  const available = bank.filter(exercise => topic === 'Random' || exercise.topic === topic);
  const candidates = randomFocus ? available : eligibleExercises(topic, focus, bank);
  if (!candidates.length) throw new Error('No sample exercises match this topic and focus. Choose another combination.');
  const exercise = candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))];
  const required = [...new Set(exercise.findings.map(finding => finding.dimension))];
  const chosenFocus = randomFocus
    ? dimensions.filter(area => required.includes(area) || rng() < 0.35)
    : [...focus];
  if (!chosenFocus.length) chosenFocus.push(dimensions[Math.min(dimensions.length - 1, Math.floor(rng() * dimensions.length))]);
  return { exerciseId: exercise.id, topic: exercise.topic, focus: chosenFocus, randomFocus };
}

// The topics offered on the Practice card: those with at least one exercise that has an issue.
export function reviewTopics(bank = studentExercises()) {
  return [...new Set(bank.filter(exercise => exercise.findings.length).map(exercise => exercise.topic))];
}

// The lenses with a real issue to find in this topic (no topic: in any topic).
// Without this, a lens missing from the topic would only ever match the issue-free exercise.
export function lensesWithIssues(topic, bank = studentExercises()) {
  const areas = new Set(bank.filter(exercise => !topic || exercise.topic === topic).flatMap(exercise => exercise.findings.map(finding => finding.dimension)));
  return dimensions.filter(area => areas.has(area));
}

export function submissionError(draft, hasOpenAnnotation = false) {
  if (draft.submitted) return 'This review has already been submitted.';
  if (hasOpenAnnotation) return 'Save or cancel your open annotation before submitting.';
  if (draft.noIssues) {
    if (draft.comments.length) return 'Remove your annotations before selecting No issues found.';
    if (!draft.justification?.trim()) return 'Explain why the code meets the requirements before submitting.';
  } else if (!draft.comments.length) return 'Add an annotation or select No issues found.';
  return '';
}

export function nextPractice(currentId, focus, randomFocus, rng = Math.random) {
  const remaining = studentExercises().filter(exercise => exercise.id !== currentId);
  return choosePractice('Random', focus, randomFocus, rng, remaining);
}

// A submitted attempt is saved with its own ID, apart from the draft it came from.
// New attempts record their draft (reviewId); older ones are matched on exercise and answers.
export function draftForAttempt(attempt, drafts) {
  if (attempt.reviewId && drafts[attempt.reviewId]?.submitted) return attempt.reviewId;
  const answers = review => JSON.stringify([review.comments, !!review.noIssues, review.justification || '']);
  return Object.keys(drafts).find(id => drafts[id].submitted && (drafts[id].exerciseId || id) === attempt.exercise && answers(drafts[id]) === answers(attempt)) ?? null;
}

// When the draft is gone, the attempt itself has everything the feedback needs.
export const attemptAsDraft = attempt => ({ ...(attempt.result?.source === 'ai' ? { liveResult: attempt.result } : {}), ...(attempt.result ? { savedResult: attempt.result } : {}), ...(attempt.sample ? { sample: true, sampleNote: attempt.sampleNote } : {}), exerciseId: attempt.exercise, focus: attempt.focus, randomFocus: attempt.randomFocus, comments: attempt.comments, noIssues: !!attempt.noIssues, justification: attempt.justification || '', submitted: true });
