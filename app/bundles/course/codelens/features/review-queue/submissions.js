import { assess, exercises } from '../../model.js';
import { lensReviewData, readTa } from '../../practice-log.js';
export const demoStudent = 'Demo student';
// Made-up students. Scores come from the same assess() as real submissions.
const hoursAgo = hours => new Date(Date.now() - hours * 3600000).toISOString();
const comment = (lens, start, end, claim, reasoning, fix) => ({ id: `${lens}-${start}-${claim.length}`, lenses: [lens], start, end, text: `${claim} ${reasoning}`, fix });
const sample = (id, student, exercise, hours, comments, extra = {}) => {
  const noIssues = !!extra.noIssues;
  const result = assess(exercises.find(e => e.id === exercise), comments, { noIssues, justification: extra.justification || '' });
  return { id, student, exercise, date: hoursAgo(hours), comments, result, noIssues, justification: extra.justification || '', studentVote: extra.studentVote || null };
};
const boundary = comment('Correctness', 3, 3, 'A total of exactly 100 misses the discount at this boundary.', 'The requirement says $100 or more, but the strict comparison is false for 100, so it returns 100 instead of 90.', 'Use total >= 100 so the threshold is inclusive.');
export const sampleSubmissions = [
  sample('sub-demo', demoStudent, 'discount', 72, [boundary]),
  sample('sub-demo-2', demoStudent, 'seats', 216, [comment('Efficiency', 6, 9, 'The nested loop is slow.', '', 'Use a set for the booked seats.')]),
  sample('sub-arjun', 'Arjun Nair', 'seats', 3, [], { noIssues: true, justification: 'It returns the right seats in the right order, so it meets the requirements.', studentVote: 'down' }),
  sample('sub-wei', 'Wei Jie Tan', 'discount', 5, [comment('Maintainability', 3, 3, 'A magic number is hard-coded here and should be a named constant.', 'If the shop changes its offer someone must find this value by hand, and the same goes for 0.9 on the next line of the function too.', 'Add a constant called DISCOUNT_THRESHOLD.')]),
  sample('sub-priya', 'Priya Raman', 'seats', 8, [comment('Efficiency', 6, 9, 'The nested loop scans the whole booked list for every request.', 'With r requests and b booked seats it takes O(r × b) time, which gets slow for large bookings.', 'Build a set of booked seats before the loop.')]),
  sample('sub-mei', 'Mei Ling Goh', 'discount', 22, [boundary, comment('Correctness', 1, 5, 'Negative totals are accepted without any validation.', 'A total of -1 passes through unchanged, but the requirements say to reject it.', 'Raise ValueError when total is below zero.')]),
  sample('sub-tom', 'Tom Lim', 'seats-clean', 26, [comment('Correctness', 3, 4, 'The list comprehension could lose the order of the seats.', 'I think a set is unordered, so the seats may come back shuffled, which breaks the first requirement about keeping their original order for the booking flow.', 'Use a plain loop instead.')], { studentVote: 'down' }),
];
// TA feedback already sent on some sample submissions: a comment, and sometimes the TA's own score.
const sent = (id, attemptId, hours, comment, adjustedScore = null) => ({ id, attemptId, action: adjustedScore == null ? 'approved' : 'edited', editedSummary: null, adjustedScore, comment, sentAt: hoursAgo(hours), createdAt: hoursAgo(hours) });
export const sampleReviews = [
  { id: 'review-demo', attemptId: 'sub-demo', action: 'approved', editedSummary: null, adjustedScore: null, comment: 'Your boundary comment is exam-ready. Now check every requirement in turn: which one has no line of code behind it?', sentAt: hoursAgo(2), createdAt: hoursAgo(2) },
  sent('review-demo-2', 'sub-demo-2', 200, "You spotted the nested loop. Now say why it matters: with 1,000 requests and 1,000 booked seats that is a million comparisons. That explanation is what earns the last part of the mark.", 8),
  sent('review-priya', 'sub-priya', 6, "Clear and exam-ready: you named the cost, O(r × b), and the fix. Next time, say what the set changes: each lookup becomes constant time on average."),
  sent('review-mei', 'sub-mei', 20, "You found both issues. For the negative total, name the input that shows the bug, for example discounted_total(-1), so the claim can be checked."),
];
// Example feedback a TA might write, for the demo shortcut on the review screen.
export const exampleTaFeedback = { 'sub-tom': "Good instinct to check the order. A list comprehension keeps the order of requested, so this code is fine. Run available_seats(['A1'], ['B2', 'A1', 'C3']) in the terminal to see it." };
function realSubmissions() {
  const { attempts, drafts } = lensReviewData();
  return attempts.map(a => {
    // Drafts record their attempt; older ones without it fall back to the same exercise.
    const draft = Object.values(drafts).find(d => d.submitted && d.attemptId === a.id) || Object.values(drafts).find(d => d.submitted && !d.attemptId && d.exerciseId === a.exercise);
    return { id: a.id, student: demoStudent, exercise: a.exercise, date: a.date, comments: a.comments, result: a.result, noIssues: !!a.noIssues, justification: a.justification || '', studentVote: draft?.ratings?.feedback?.vote || null };
  });
}
export const allSubmissions = () => [...realSubmissions(), ...sampleSubmissions];
export const allReviews = () => [...sampleReviews, ...readTa().reviews];
