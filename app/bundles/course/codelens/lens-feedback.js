// Lens Review feedback for each of the student's comments. Follows the same rules as
// assess() and never changes the score. Hints are questions, not corrected code.
const overlaps = (comment, finding) => comment.start <= finding.end && comment.end >= finding.start;
const mentions = (text, words) => words.some(word => text.toLowerCase().includes(word));
const lines = item => item.start === item.end ? `L${item.start}` : `L${item.start}–${item.end}`;
const quote = text => { const clean = text.trim().replace(/[.!?]+$/, ''); return clean.length > 90 ? clean.slice(0, 90).trimEnd() + '…' : clean; };

export function commentFeedback(exercise, comment) {
  const points = [];
  // Like assess(), a claim counts when it uses the right focus area and names the issue.
  const named = exercise.findings.find(f => f.dimension === comment.dimension && mentions(comment.claim, f.keywords));
  const hit = exercise.findings.filter(f => overlaps(comment, f));
  let result;
  if (named) {
    result = 'found';
    points.push(`Your claim names the issue: “${quote(comment.claim)}”.`);
    points.push(overlaps(comment, named) ? `You pointed at the right lines (${lines(comment)}).` : 'Which lines cause it? Select the lines where the problem happens.');
    points.push(comment.reasoning.trim().length >= 30 ? 'Your reasoning explains why it matters.' : 'Why does it matter here? Link it to one of the requirements, with an example input.');
    points.push(mentions(comment.fix, named.fixes) ? 'Your proposed fix would solve it.' : 'How would you change the code? Name the fix in one sentence.');
  } else if (!hit.length) {
    result = 'not-an-issue';
    points.push(`${lines(comment)} meets the requirements. What made you think there was a problem here?`);
  } else if (!hit.some(f => f.dimension === comment.dimension)) {
    result = 'wrong-lens';
    points.push(`You found the right place in the code (${lines(comment)}). Is this really about ${comment.dimension}? Which focus area describes the problem better?`);
  } else {
    result = 'unclear';
    points.push(`Right lines and the right focus area (${comment.dimension}). What exactly goes wrong in these lines? Name the problem in one clear sentence.`);
  }
  return { id: comment.id, label: `${comment.dimension} · ${lines(comment)}`, result, points };
}
