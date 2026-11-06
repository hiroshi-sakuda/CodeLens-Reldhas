import { additionalSamples } from './samples.js';
export const dimensions = ['Correctness', 'Appropriateness', 'Efficiency', 'Maintainability'];
export const exercises = [
  { id: 'seats', title: 'Cinema seat checker', file: 'seat_checker.py', topic: 'Lists & membership', brief: 'A cinema needs to find which requested seats are still available. Review the generated solution before it becomes part of the booking flow.', requirements: ['Return available requested seats in their original order.', 'Never return a seat that is already booked.', 'Handle large bookings without repeatedly scanning booked seats.'], code: ['def available_seats(booked, requested):', '    """Return requested seats that are not booked."""', '    available = []', '', '    for seat in requested:', '        is_booked = False', '        for taken in booked:', '            if seat == taken:', '                is_booked = True', '        if not is_booked:', '            available.append(seat)', '', '    return available'], findings: [{ dimension: 'Efficiency', start: 6, end: 9, keywords: ['loop', 'scan', 'lookup', 'membership', 'nested', 'linear'], fixes: ['set', 'hash'], claim: 'Each requested seat scans the entire booked list.', reasoning: 'For r requests and b booked seats, the nested loops take O(r × b) time. Converting booked to a set once gives average O(b + r) time.', fix: 'Create booked_set = set(booked) before the loop and use seat not in booked_set.' }], reference: 'def available_seats(booked, requested):\n    booked_set = set(booked)\n    return [seat for seat in requested\n            if seat not in booked_set]' },
  { id: 'discount', title: 'Shopping discount calculator', file: 'discount.py', topic: 'Conditions & boundaries', brief: 'An online store offers 10% off when the basket total is at least $100. Check the proposed implementation against the requirements.', requirements: ['Apply a 10% discount to totals of $100 or more.', 'Leave smaller totals unchanged.', 'Reject negative totals with a ValueError.'], code: ['def discounted_total(total):', '    """Calculate the final basket total."""', '    if total > 100:', '        return total * 0.9', '    return total'], findings: [{ dimension: 'Correctness', start: 3, end: 3, keywords: ['100', 'boundary', 'equal', 'threshold'], fixes: ['>=', 'equal', 'inclusive'], claim: 'A basket of exactly $100 incorrectly receives no discount.', reasoning: 'The requirement includes the threshold. With total = 100, the strict comparison is false and returns 100 instead of 90.', fix: 'Use total >= 100.' }, { dimension: 'Correctness', start: 1, end: 5, keywords: ['negative', 'validation', 'reject'], fixes: ['raise', 'valueerror'], claim: 'Negative basket totals are accepted.', reasoning: 'A total of -1 passes through unchanged, violating the input requirement.', fix: 'Before calculating the discount, raise ValueError if total < 0.' }], reference: 'def discounted_total(total):\n    if total < 0:\n        raise ValueError("Total must be non-negative")\n    if total >= 100:\n        return total * 0.9\n    return total' }
];
exercises.push(...additionalSamples(exercises));

export function consoleExample(exercise) {
  return exercise.file === 'seat_checker.py'
    ? "print(available_seats(['A1', 'A2'], ['A2', 'A3', 'B1']))"
    : 'print(discounted_total(100))';
}

// An annotation: the lines, one or more lenses, "What's wrong, and why?" (text) and a proposed fix.
// Older saved annotations had one lens (dimension) and a separate claim and reasoning; read them the same way.
export function normalizeComment(c) {
  const lenses = c.lenses?.length ? c.lenses : c.dimension ? [c.dimension] : [];
  const text = c.text ?? [c.claim, c.reasoning].filter(s => s && s.trim()).map(s => s.trim()).join(' ');
  return { ...c, lenses, text, fix: c.fix || '' };
}
const overlaps = (c, f) => c.start <= f.end && c.end >= f.start;
const words = text => text.trim().split(/\s+/).filter(Boolean).length;
// "Why" is answered when the text goes beyond naming the issue: at least this many words.
export const explainWords = 12;
export const namesIssue = (c, f) => c.lenses.includes(f.dimension) && f.keywords.some(k => c.text.toLowerCase().includes(k));
// Share of the chosen lenses that really apply to these lines. Ticking every lens can't earn full credit.
export function lensPrecision(exercise, c) {
  const here = new Set(exercise.findings.filter(f => overlaps(c, f)).map(f => f.dimension));
  return c.lenses.length ? c.lenses.filter(l => here.has(l)).length / c.lenses.length : 0;
}

// Transparent demo heuristic, not AI assessment or semantic validation.
// Four criteria per planted issue, 2.5 each: issue (named, with the right lens), lines, explanation (why), fix.
export function assess(exercise, rawComments, conclusion = { noIssues: false, justification: '' }) {
  const comments = rawComments.map(normalizeComment);
  if (!exercise.findings.length || conclusion.noIssues) {
    const correct = exercise.findings.length === 0 && conclusion.noIssues
      && comments.length === 0 && Boolean(conclusion.justification?.trim());
    // No fix is necessary for clean code. Keep the rubric empty rather than
    // pretending the four critique criteria were evaluated.
    return { rubric: {}, total: correct ? 10 : 0, found: 0, conclusionCorrect: correct };
  }
  const keys = ['issue', 'lines', 'explanation', 'fix'];
  const matches = exercise.findings.map(f => {
    let best = { issue: 0, lines: 0, explanation: 0, fix: 0 };
    for (const c of comments) {
      const relevant = namesIssue(c, f);
      const score = { issue: relevant ? 2.5 * Math.max(lensPrecision(exercise, c), overlaps(c, f) ? 0 : 1 / c.lenses.length) : 0, lines: relevant && overlaps(c, f) ? 2.5 : 0, explanation: relevant && words(c.text) >= explainWords ? 2.5 : 0, fix: relevant && f.fixes.some(k => c.fix.toLowerCase().includes(k)) ? 2.5 : 0 };
      if (keys.reduce((s, k) => s + score[k], 0) > keys.reduce((s, k) => s + best[k], 0)) best = score;
    }
    return best;
  });
  const rubric = Object.fromEntries(keys.map(k => [k, matches.reduce((s, m) => s + m[k], 0) / matches.length]));
  return { rubric, total: Object.values(rubric).reduce((a, b) => a + b, 0), found: matches.filter(m => m.issue > 0).length };
}

// Which planted issues a review found: the same test as assess() (the right lens and an issue keyword).
export function findingFound(finding, comments) {
  return comments.map(normalizeComment).some(c => namesIssue(c, finding));
}
