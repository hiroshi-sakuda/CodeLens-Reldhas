// Pure rules: the output comes from really running the code, never from the sample data.
export function normalizeOutput(text) {
  return text.replace(/\r\n/g, '\n').split('\n').map(line => line.trim()).join('\n').replace(/\n+$/, '').replace(/^\n+/, '');
}
export function displayOutput(output, error) {
  const shown = normalizeOutput(output);
  return error ? `${shown}${shown ? '\n' : ''}Error: ${error}` : shown;
}
export function dryRunFeedback(question, prediction, actualOutput, trace) {
  const predicted = normalizeOutput(prediction);
  const actual = normalizeOutput(actualOutput);
  const correct = predicted === actual;
  const mistake = correct ? undefined : question.commonMistakes.find(m => normalizeOutput(m.output) === predicted);
  return { correct, actualOutput: actual, mistake: mistake?.explanation ?? null, explanation: question.explanation, tip: question.tip, concept: question.concept,
    ...(trace && question.traceColumns ? { trace: compareTrace(question.traceColumns, trace.student, trace.expected) } : {}) };
}
export const dryRunScore = feedback => feedback.correct ? 1 : feedback.trace?.mostlyRight ? 0.5 : 0;
// What the student did well and what to improve, from the prediction, the real output and the trace.
export function dryRunPoints(prediction, feedback) {
  const good = [], improve = [];
  const said = normalizeOutput(prediction).split('\n');
  const real = feedback.actualOutput.split('\n');
  if (feedback.correct) good.push('Your prediction matches the real output exactly.');
  else {
    const right = real.filter((line, i) => line === said[i]).length;
    if (right) good.push(`${right} of ${real.length} ${real.length === 1 ? 'line is' : 'lines are'} right.`);
    const i = real.findIndex((line, k) => line !== said[k]);
    if (i === -1) improve.push(`The code prints ${real.length} ${real.length === 1 ? 'line' : 'lines'}, but you wrote ${said.length}. When does it stop printing?`);
    else if (said[i] === undefined) improve.push(`Line ${i + 1} is missing: it printed “${real[i]}”. Does the loop run once more than you traced?`);
    else improve.push(`Line ${i + 1}: you wrote “${said[i]}”, but it printed “${real[i]}”. What value does each variable have at that point?`);
  }
  const trace = feedback.trace;
  if (trace) {
    const fitting = trace.firstWrongRow ?? trace.student.length;
    if (fitting) good.push(fitting === trace.student.length ? 'Every step of your trace table is right.' : `The first ${fitting} ${fitting === 1 ? 'step' : 'steps'} of your trace table are right.`);
    if (trace.firstWrongRow !== null) improve.push(`Your trace goes wrong at step ${trace.firstWrongRow + 1}. Check that step again.`);
  } else if (!feedback.correct) improve.push('Try the trace table next time: writing each value down shows exactly where the trace slips.');
  return { good, improve };
}
function sameCell(student, expected) {
  const clean = value => value.toLowerCase().replace(/[\s'"]/g, '');
  const a = clean(student), b = clean(expected);
  if (a !== '' && b !== '' && !Number.isNaN(Number(a)) && !Number.isNaN(Number(b))) return Number(a) === Number(b);
  return a === b;
}
// The student's rows must appear in order among the real states. Rows may skip
// states (one per loop iteration is fine) and a blank cell matches anything.
export function compareTrace(columns, rows, expected) {
  const student = rows.filter(row => row.some(cell => cell.trim() !== ''));
  let at = 0, firstWrongRow = null;
  for (let i = 0; i < student.length; i++) {
    const fits = state => student[i].every((cell, c) => cell.trim() === '' || sameCell(cell, state[c] ?? ''));
    let k = at;
    while (k < expected.length && !fits(expected[k])) k++;
    if (k === expected.length) { firstWrongRow = i; break; }
    at = k + 1;
  }
  const fitting = firstWrongRow ?? student.length;
  return { columns, expected, student, firstWrongRow, expectedAt: firstWrongRow === null ? null : Math.min(at, expected.length - 1), mostlyRight: student.length >= 2 && fitting / student.length >= 0.75 };
}
