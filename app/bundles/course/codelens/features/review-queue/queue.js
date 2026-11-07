import { normalizeComment } from '../../model.js';
import { decides } from '../../attempt-summary.js';
export const flagLabels = { 'low-confidence': 'Low AI confidence', 'student-down': 'Student disagreed' };
export const statusLabels = { waiting: 'Waiting', sent: 'Sent', skipped: 'Skipped' };
// Sent wins over skipped: once anything was sent, the student has TA feedback.
export function statusOf(reviews) {
  if (reviews.some(r => r.sentAt)) return 'sent';
  if (reviews.some(r => r.action === 'skipped')) return 'skipped';
  return 'waiting';
}
const overlaps = (comment, finding) => comment.start <= finding.end && comment.end >= finding.start;
const hasKeyword = (comment, finding) => finding.keywords.some(k => comment.text.toLowerCase().includes(k));
const words = comment => comment.text.trim().split(/\s+/).length;
// Low when a comment is on the right lines but says something else, speaks to two
// issues, or is a long comment off the answer key (it may be a valid extra point).
export function confidenceOf(exercise, comments) {
  const low = comments.map(normalizeComment).some(comment => {
    const hit = exercise.findings.filter(f => overlaps(comment, f));
    const matched = hit.filter(f => hasKeyword(comment, f));
    return matched.length > 1 || (hit.length > 0 && matched.length === 0) || (hit.length === 0 && words(comment) > 25);
  });
  return low ? 'low' : 'high';
}
export function buildQueue(submissions, reviews, exercises) {
  const items = submissions.map(submission => {
    const mine = reviews.filter(r => r.attemptId === submission.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const exercise = exercises.find(e => e.id === submission.exercise);
    const flags = [];
    if (exercise && confidenceOf(exercise, submission.comments) === 'low') flags.push('low-confidence');
    if (submission.studentVote === 'down') flags.push('student-down');
    return { submission, exercise, flags, status: statusOf(mine), reviews: mine };
  });
  const rank = item => item.status === 'waiting' ? 0 : item.status === 'skipped' ? 1 : 2;
  return items.sort((a, b) => rank(a) - rank(b) || b.flags.length - a.flags.length || b.submission.date.localeCompare(a.submission.date));
}
export function queueCounts(items) {
  const waiting = items.filter(item => item.status === 'waiting');
  return { waiting: waiting.length, flagged: waiting.filter(item => item.flags.length).length };
}
// What the student sees: the latest edits and score, and every sent comment.
export function taFeedbackFor(reviews) {
  const sent = reviews.filter(r => r.sentAt).sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const latest = [...sent].reverse();
  return { sent, editedSummary: latest.find(r => decides(r, 'editedSummary'))?.editedSummary ?? null, adjustedScore: latest.find(r => decides(r, 'adjustedScore'))?.adjustedScore ?? null, comments: sent.filter(r => r.comment).map(r => r.comment) };
}
// summary and score are null when the TA left them alone. A value equal to the AI's is
// still a decision (setsSummary/setsScore): it puts back the AI's version after an earlier edit.
export function makeReview({ attemptId, action, summary, originalSummary, score, originalScore, comment, now = new Date().toISOString() }) {
  const editedSummary = action === 'send' && summary?.trim() && summary.trim() !== originalSummary ? summary.trim() : null;
  const adjustedScore = action === 'send' && score != null && score !== originalScore ? score : null;
  const setsSummary = action === 'send' && !!summary?.trim(), setsScore = action === 'send' && score != null;
  return { id: crypto.randomUUID(), attemptId, action: action === 'skip' ? 'skipped' : editedSummary || adjustedScore != null ? 'edited' : 'approved', editedSummary, adjustedScore, setsSummary, setsScore, comment: action === 'send' && comment?.trim() ? comment.trim() : null, sentAt: action === 'send' ? now : null, createdAt: now };
}
export function aiSummary(exercise, result, noIssues) {
  if (!exercise.findings.length) return noIssues ? 'Correct conclusion: this code has no issues.' : 'This code has no issues, so the comments were not needed.';
  return `${result.found} of ${exercise.findings.length} issues identified.`;
}
