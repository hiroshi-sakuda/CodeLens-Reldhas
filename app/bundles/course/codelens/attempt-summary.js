import { exercises, findingFound, normalizeComment } from './model.js';
import { functionNames } from './course.js';
// One shape for every kind of attempt, so the Skill Map and TA screens read them the same way.
// items: what each answer scored per lens, value 0 to 1. source: 'exam' or 'review'.
// A sent review decides a value when it changed it, or put it back to the AI's (setsScore/setsSummary with null).
export const decides = (review, field) => !!review.sentAt && (review[field] != null || !!review[field === 'adjustedScore' ? 'setsScore' : 'setsSummary']);
export const reviewedScore = (reviews, id) => reviews.filter(r => r.attemptId === id && decides(r, 'adjustedScore')).at(-1)?.adjustedScore;

export function lensReviewItems(attempt, bank = exercises) {
  const exercise = bank.find(e => e.id === attempt.exercise);
  if (!exercise) return [];
  // The same test as assess(): the right lens and an issue keyword.
  const comments = attempt.comments.map(normalizeComment);
  return exercise.findings.map(f => {
    const relevant = findingFound(f, comments);
    const otherLens = comments.some(c => !c.lenses.includes(f.dimension) && c.start <= f.end && c.end >= f.start);
    return { lens: f.dimension, value: relevant ? 1 : otherLens ? 0.5 : 0, source: 'review', claim: f.claim, title: exercise.title };
  });
}
export function summarizeLensReview(attempt, reviews = [], bank = exercises) {
  const adjusted = reviewedScore(reviews, attempt.id);
  const total = adjusted ?? attempt.result.total;
  return { id: attempt.id, function: 'lens-review', title: bank.find(e => e.id === attempt.exercise)?.title || 'Lens Review', date: attempt.date, score: total / 10, shown: `${+total.toFixed(1)} / 10`, items: lensReviewItems(attempt, bank), real: true };
}
export function summarizePractice(attempt) {
  const title = attempt.title || functionNames[attempt.function];
  if (attempt.function === 'dry-run') {
    const value = attempt.feedback.correct ? 1 : 0;
    return { id: attempt.id, function: 'dry-run', title, date: attempt.submittedAt, score: attempt.score, shown: attempt.feedback.correct ? 'Correct' : attempt.score ? 'Half credit' : 'Not quite', items: [{ lens: 'Correctness', value, source: 'exam' }], note: attempt.feedback.mistake || attempt.feedback.tip, fromSuggestion: attempt.fromSuggestion, real: true };
  }
  const questions = attempt.feedback.questions;
  return { id: attempt.id, function: 'concept-match', title, date: attempt.submittedAt, score: attempt.score, shown: `${attempt.feedback.correctCount} / ${questions.length}`, items: questions.map(q => ({ lens: 'Appropriateness', value: q.correct ? 1 : 0, source: 'exam' })), note: questions.find(q => !q.correct)?.comment || questions[0]?.comment, fromSuggestion: attempt.fromSuggestion, real: true };
}
