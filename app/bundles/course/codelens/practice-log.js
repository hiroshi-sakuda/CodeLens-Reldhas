// Attempts saved in this browser. Lens Review keeps its own history under codelens-demo-v1.
const key = 'codelens-practice-v1';
let memory = null;
function read() {
  if (memory) return memory;
  try { const saved = JSON.parse(localStorage.getItem(key) || '{}'); return Array.isArray(saved.attempts) ? saved.attempts : []; }
  catch { return []; }
}
function write(attempts) {
  try { localStorage.setItem(key, JSON.stringify({ attempts })); memory = null; }
  catch { memory = attempts; }
}
export const listAttempts = fn => read().filter(attempt => attempt.status !== 'archived' && (!fn || attempt.function === fn));
export const getAttempt = id => read().find(attempt => attempt.id === id);
export function createAttempt(fields) {
  const attempt = { id: crypto.randomUUID(), status: 'in_progress', answers: {}, feedback: null, score: null, ratings: {}, fromSuggestion: false, createdAt: new Date().toISOString(), submittedAt: null, ...fields };
  write([...read(), attempt]);
  return attempt;
}
export function updateAttempt(id, patch) {
  const updated = read().map(attempt => attempt.id === id ? { ...attempt, ...patch } : attempt);
  write(updated);
  return updated.find(attempt => attempt.id === id);
}
export function lastDifficulty(fn) {
  return listAttempts(fn).at(-1)?.difficulty || 'easy';
}
export function lensReviewData() {
  try {
    const saved = JSON.parse(localStorage.getItem('codelens-demo-v1') || '{}');
    return { attempts: Array.isArray(saved.attempts) ? saved.attempts : [], drafts: saved.drafts || {} };
  } catch { return { attempts: [], drafts: {} }; }
}
// Keep deleted drafts recoverable; submitted history is never removed here.
export function setDraftArchived(kind, id, archived) {
  if (kind === 'practice') {
    const attempt = read().find(a => a.id === id);
    if (!attempt || !['in_progress', 'archived'].includes(attempt.status)) return false;
    write(read().map(a => a.id === id ? { ...a, status: archived ? 'archived' : 'in_progress' } : a));
    return true;
  }
  try {
    const saved = JSON.parse(localStorage.getItem('codelens-demo-v1') || '{}');
    if (!saved.drafts?.[id] || saved.drafts[id].submitted) return false;
    saved.drafts[id] = { ...saved.drafts[id], archived };
    localStorage.setItem('codelens-demo-v1', JSON.stringify(saved));
    return true;
  } catch { return false; }
}
// TA decisions, shared by the Review Queue and what students see.
const taKey = 'codelens-ta-v1';
export function readTa() {
  const empty = { reviews: [], watching: [], ratings: {}, seen: [] };
  try { return { ...empty, ...JSON.parse(localStorage.getItem(taKey) || '{}') }; }
  catch { return empty; }
}
export function writeTa(state) {
  try { localStorage.setItem(taKey, JSON.stringify(state)); } catch { /* Lasts until this screen reloads. */ }
}
export function percent(values) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) + '%' : null;
}
