import { taFeedbackFor } from './features/review-queue/queue.js';

export function feedbackForAttempt(attemptId, reviews, samples = []) {
  const feedback = taFeedbackFor(reviews.filter(review => review.attemptId === attemptId));
  const sample = samples.find(item => item.id === attemptId && item.taComment);
  if (!feedback.sent.length && sample) return { ...feedback, available: true, sample: true, comments: [sample.taComment] };
  return { ...feedback, available: feedback.sent.length > 0, sample: false };
}
