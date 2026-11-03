// A made-up class of eight, so Class Insights has something to show in a demo.
const daysAgo = days => new Date(Date.now() - days * 86400000).toISOString();
const gaps = {
  boundary: { title: 'Shopping discount calculator', claim: 'A basket of exactly $100 incorrectly receives no discount.', lens: 'Correctness', source: 'review' },
  negative: { title: 'Shopping discount calculator', claim: 'Negative basket totals are accepted.', lens: 'Correctness', source: 'review' },
  scan: { title: 'Cinema seat checker', claim: 'Each requested seat scans the entire booked list.', lens: 'Efficiency', source: 'review' },
  whileLoop: { title: 'Dry Run: while loops', claim: 'Stopped the trace one iteration early.', lens: 'Correctness', source: 'exam' },
  mutate: { title: 'Dry Run: lists', claim: 'Missed that removing an item shifts the rest of the list.', lens: 'Correctness', source: 'exam' },
  setVsList: { title: 'Concept Match: lists & sets', claim: 'Chose a list where a set fits a membership check.', lens: 'Appropriateness', source: 'exam' },
  forVsWhile: { title: 'Concept Match: loops', claim: 'Chose a while loop when the number of repeats is known.', lens: 'Appropriateness', source: 'exam' },
};
const item = (gap, value) => ({ ...gaps[gap], value });
const dry = (student, days, gap, right, extra = {}) => ({ student, function: 'dry-run', date: daysAgo(days), score: right ? 1 : 0, items: [item(gap, right ? 1 : 0)], ...extra });
const concept = (student, days, gap, right, extra = {}) => ({ student, function: 'concept-match', date: daysAgo(days), score: right / 5, items: [0, 1, 2, 3, 4].map(i => item(gap, i < right ? 1 : 0)), ...extra });
const review = (student, days, total, found, extra = {}) => ({ student, function: 'lens-review', date: daysAgo(days), score: total / 10, items: found.map(([gap, value]) => item(gap, value)), ...extra });
export const sampleClass = [
  dry('Mei Ling Goh', 1, 'whileLoop', true, { fromSuggestion: true }), dry('Mei Ling Goh', 3, 'mutate', true), concept('Mei Ling Goh', 2, 'setVsList', 5), review('Mei Ling Goh', 4, 8, [['boundary', 1], ['negative', 1]]), concept('Mei Ling Goh', 7, 'forVsWhile', 4),
  dry('Priya Raman', 2, 'whileLoop', true), dry('Priya Raman', 5, 'mutate', false), concept('Priya Raman', 3, 'setVsList', 4, { fromSuggestion: true }), review('Priya Raman', 1, 7.5, [['scan', 1]]),
  dry('Arjun Nair', 1, 'whileLoop', false, { confidentWrong: true }), dry('Arjun Nair', 2, 'mutate', false, { confidentWrong: true }), dry('Arjun Nair', 6, 'whileLoop', false), concept('Arjun Nair', 4, 'forVsWhile', 2), review('Arjun Nair', 1, 0, [['scan', 0]], { confidentWrong: true }),
  concept('Tom Lim', 9, 'setVsList', 1), review('Tom Lim', 2, 2.5, [['scan', 0]]),
  dry('Wei Jie Tan', 3, 'whileLoop', true), dry('Wei Jie Tan', 4, 'mutate', false), concept('Wei Jie Tan', 2, 'forVsWhile', 2, { fromSuggestion: true }), concept('Wei Jie Tan', 6, 'setVsList', 1), review('Wei Jie Tan', 1, 2.5, [['boundary', 0.5], ['negative', 0]]),
  dry('Hana Sato', 2, 'whileLoop', true), dry('Hana Sato', 8, 'mutate', true), concept('Hana Sato', 3, 'setVsList', 4), concept('Hana Sato', 10, 'forVsWhile', 3), review('Hana Sato', 5, 5, [['boundary', 1], ['negative', 0]]),
  dry('Daniel Koh', 4, 'whileLoop', false), dry('Daniel Koh', 5, 'whileLoop', true, { fromSuggestion: true }), concept('Daniel Koh', 6, 'setVsList', 3), review('Daniel Koh', 7, 5, [['boundary', 1], ['negative', 0]]),
  concept('Siti Aisyah', 3, 'forVsWhile', 5), dry('Siti Aisyah', 11, 'mutate', true), review('Siti Aisyah', 12, 10, [['scan', 1]]),
];
const votes = (fn, role, up, down) => [...Array(up).fill({ function: fn, role, vote: 'up' }), ...Array(down).fill({ function: fn, role, vote: 'down' })];
export const sampleVotes = [...votes('dry-run', 'student', 14, 2), ...votes('concept-match', 'student', 11, 4), ...votes('lens-review', 'student', 6, 3), ...votes('lens-review', 'ta', 7, 2)];
