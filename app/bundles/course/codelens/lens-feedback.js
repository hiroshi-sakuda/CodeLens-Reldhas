// Lens Review feedback per comment: what is right and what to improve. Follows the same
// rules as assess() and never changes the score. Hints are questions, not corrected code.
const overlaps = (comment, finding) => comment.start <= finding.end && comment.end >= finding.start;
const mentions = (text, words) => words.some(word => text.toLowerCase().includes(word));
const lines = item => item.start === item.end ? `L${item.start}` : `L${item.start}–${item.end}`;
const quote = text => { const clean = text.trim().replace(/[.!?]+$/, ''); return clean.length > 90 ? clean.slice(0, 90).trimEnd() + '…' : clean; };

export function commentFeedback(exercise, comment) {
  const good = [], improve = [];
  // Like assess(), a claim counts when it uses the right focus area and names the issue.
  const named = exercise.findings.find(f => f.dimension === comment.dimension && mentions(comment.claim, f.keywords));
  const hit = exercise.findings.filter(f => overlaps(comment, f));
  let result;
  if (named) {
    result = 'found';
    good.push(`Your claim names the issue: “${quote(comment.claim)}”.`);
    if (overlaps(comment, named)) good.push(`You pointed at the right lines (${lines(comment)}).`);
    else improve.push('Which lines cause it? Select the lines where the problem happens.');
    if (comment.reasoning.trim().length >= 30) good.push('Your reasoning explains why it matters.');
    else improve.push('Why does it matter here? Link it to one of the requirements, with an example input.');
    if (mentions(comment.fix, named.fixes)) good.push('Your proposed fix would solve it.');
    else improve.push('How would you change the code? Name the fix in one sentence.');
  } else if (!hit.length) {
    result = 'not-an-issue';
    improve.push(`${lines(comment)} meets the requirements. What made you think there was a problem here?`);
  } else if (!hit.some(f => f.dimension === comment.dimension)) {
    result = 'wrong-lens';
    good.push(`You found the right place in the code (${lines(comment)}).`);
    improve.push(`Is this really about ${comment.dimension}? Which focus area describes the problem better?`);
  } else {
    result = 'unclear';
    good.push(`Right lines and the right focus area (${comment.dimension}).`);
    improve.push('What exactly goes wrong in these lines? Name the problem in one clear sentence.');
  }
  return { id: comment.id, label: `${comment.dimension} · ${lines(comment)}`, result, good, improve };
}

// `found` is assess().found, so this matches the summary and the score.
export function overallFeedback(exercise, found, conclusion = { noIssues: false, justification: '' }) {
  const good = [], improve = [];
  const total = exercise.findings.length;
  if (conclusion.noIssues) {
    if (!total) good.push(`Right conclusion: the code meets the requirements. You explained “${quote(conclusion.justification)}”.`);
    else improve.push(`This code has ${total === 1 ? 'an issue' : total + ' issues'}. Go through each requirement: which one isn't met?`);
    return { good, improve };
  }
  if (found) good.push(`You found ${found} of ${total} ${total === 1 ? 'issue' : 'issues'}.`);
  if (total && found < total) improve.push(`You missed ${total - found} ${total - found === 1 ? 'issue' : 'issues'}. Read each requirement again: which ones aren't checked in the code?`);
  if (!total) improve.push('This code has no issues. When the code meets every requirement, choose “No issues found” and explain how you checked.');
  return { good, improve };
}
