// Pure rules standing in for AI evaluation. The option is marked exactly; the
// one-line reason by signal words anchored at the start of a word.
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matches = (text, word) => new RegExp((/^[a-z0-9]/i.test(word) ? '(?<![a-z0-9])' : '') + escapeRegex(word), 'i').test(text);
export const hasAny = (text, words) => words.some(word => matches(text, word));
const sentences = text => text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
function shorten(sentence) {
  const clean = sentence.replace(/[.!?]+$/, '');
  return clean.length > 110 ? clean.slice(0, 110).trimEnd() + '…' : clean;
}
export function questionFeedback(question, choice, reason) {
  const correct = choice === question.correct;
  const text = (reason || '').trim();
  const hit = sentences(text).find(s => hasAny(s, question.reasonSignals));
  const quote = text ? shorten(hit || sentences(text)[0] || text) : null;
  const reasonRating = !text ? 'missing' : hit ? 'good' : 'partly';
  let comment;
  if (reasonRating === 'missing') comment = 'Add a one-line reason next time: in the exam, explaining why a concept fits earns as much as picking it.';
  else if (reasonRating === 'good' && correct) comment = `You wrote “${quote}”: that's exactly what makes this the right fit.`;
  else if (reasonRating === 'good') comment = `You wrote “${quote}”: that's the right idea. Which option actually does that?`;
  else if (correct) comment = `Right choice. Your reason, “${quote}”, could say more: what in the story makes this concept the best fit?`;
  else comment = `You wrote “${quote}”. What does the story need most, and which option gives it?`;
  return { questionId: question.id, correct, correctOption: question.correct, chosen: choice, reasonRating, comment };
}
// Demo answers: the right option with a reason that names what the story needs, or a wrong option with a vague reason.
export function demoAnswer(question, kind) {
  if (kind === 'wrong') return { choice: question.options.find(o => o.id !== question.correct).id, reason: 'I just guessed.' };
  const first = sentences(question.options.find(o => o.id === question.correct).why)[0];
  return { choice: question.correct, reason: hasAny(first, question.reasonSignals) ? first : `It needs a ${question.reasonSignals[0]}.` };
}
export function setFeedback(questions, choices, reasons) {
  const items = questions.map(q => questionFeedback(q, choices[q.id] ?? null, reasons[q.id] ?? ''));
  return { questions: items, correctCount: items.filter(item => item.correct).length };
}
