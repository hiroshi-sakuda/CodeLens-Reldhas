import { explainWords, lensPrecision, namesIssue, normalizeComment } from './model.js';
// Lens Review feedback for each of the student's annotations. Follows the same rules as
// assess() and never changes the score. Hints are questions, not corrected code.
const overlaps = (comment, finding) => comment.start <= finding.end && comment.end >= finding.start;
const mentions = (text, words) => words.some(word => text.toLowerCase().includes(word));
const lines = item => item.start === item.end ? `L${item.start}` : `L${item.start}–${item.end}`;
const quote = text => { const clean = text.trim().replace(/[.!?]+$/, ''); return clean.length > 90 ? clean.slice(0, 90).trimEnd() + '…' : clean; };
const wordCount = text => text.trim().split(/\s+/).filter(Boolean).length;

export function commentFeedback(exercise, raw) {
  const comment = normalizeComment(raw);
  const lens = comment.lenses.join(' + ') || 'No lens';
  const points = [];
  const named = exercise.findings.find(f => namesIssue(comment, f));
  const hit = exercise.findings.filter(f => overlaps(comment, f));
  let result;
  if (named) {
    result = 'found';
    points.push(`You named the issue: “${quote(comment.text)}”.`);
    points.push(overlaps(comment, named) ? `You pointed at the right lines (${lines(comment)}).` : 'Which lines cause it? Select the lines where the problem happens.');
    points.push(wordCount(comment.text) >= explainWords ? 'You explained why it matters.' : 'Why does it matter here? Link it to one of the requirements, with an example input.');
    points.push(mentions(comment.fix, named.fixes) ? 'Your proposed fix would solve it.' : 'How would you change the code? Name the fix in one sentence.');
    const extra = comment.lenses.filter(l => !hit.some(f => f.dimension === l));
    if (overlaps(comment, named) && lensPrecision(exercise, comment) < 1) points.push(`You also chose ${extra.join(' and ')}. Does that lens really fail on these lines?`);
  } else if (!hit.length) {
    result = 'not-an-issue';
    points.push(`${lines(comment)} meets the requirements. What made you think there was a problem here?`);
  } else if (!hit.some(f => comment.lenses.includes(f.dimension))) {
    result = 'wrong-lens';
    points.push(`You found the right place in the code (${lines(comment)}). Is this really about ${lens}? Which lens describes the problem better?`);
  } else {
    result = 'unclear';
    points.push(`Right lines and the right lens (${lens}). What exactly goes wrong in these lines? Name the problem in one clear sentence.`);
  }
  return { id: comment.id, label: `${lens} · ${lines(comment)}`, result, points };
}
