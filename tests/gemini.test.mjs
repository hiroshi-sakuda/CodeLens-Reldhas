import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/index.mjs';
import { providerConfig, providerRequest, providerFeedback } from '../server/provider.mjs';
import { validateSubmission } from '../server/review.mjs';
const input = { exerciseId: 'seats', focus: ['Efficiency'], comments: [{ start: 6, end: 9, lenses: ['Efficiency'], text: 'Nested scanning Every request scans all booked seats.', fix: 'Use a set.' }], noIssues: false, justification: '' };
const feedback = { rubric: { issue: 2.5, lines: 2.5, explanation: 2.5, fix: 2.5 }, found: 1, summary: 'Good review.', improvements: [] };
const response = { candidates: [{ finishReason: 'STOP', content: { parts: [{ thought: true, text: 'private reasoning' }, { text: JSON.stringify(feedback) }] } }] };
test('Gemini request keeps key in header, uses structured schema, rejects blocked/incomplete output', () => {
  const config = providerConfig({ AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'private-key' });
  const review = validateSubmission(input), request = providerRequest(review, config);
  assert.equal(request.headers['x-goog-api-key'], 'private-key');
  assert.doesNotMatch(request.url, /private-key/); assert.doesNotMatch(JSON.stringify(request.body), /private-key/);
  assert.equal(request.body.generationConfig.responseMimeType, 'application/json');
  assert.match(request.body.systemInstruction.parts[0].text, /untrusted/);
  assert.equal(providerFeedback(response, review.exercise, config).total, 10);
  assert.throws(() => providerFeedback({ candidates: [{ finishReason: 'MAX_TOKENS' }] }, review.exercise, config));
  assert.throws(() => providerFeedback({ ...response, promptFeedback: { blockReason: 'SAFETY' } }, review.exercise, config));
  assert.throws(() => providerRequest(review, { ...config, model: '../other?key=oops' }));
  assert.throws(() => providerConfig({ AI_PROVIDER: 'unknown' }));
});
test('authenticated HTTP review uses Gemini and tells the interface its provider', async t => {
  let calls = 0;
  const app = createApp({ env: { AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'private-key', REVIEW_PASSWORD: 'test-password' }, fetchImpl: async (url, options) => {
    calls++; assert.match(url, /^https:\/\/generativelanguage.googleapis.com\/v1beta\/models\/gemini-3.5-flash:generateContent$/);
    assert.equal(options.headers['x-goog-api-key'], 'private-key');
    assert.equal(JSON.parse(options.body).contents[0].role, 'user');
    return { ok: true, json: async () => response };
  } });
  await new Promise(r => app.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => { app.close(r); app.closeAllConnections(); }));
  const base = `http://127.0.0.1:${app.address().port}`;
  const status = await (await fetch(base + '/api/status')).json(); assert.equal(status.provider, 'Google Gemini'); assert.equal(status.configured, true);
  const headers = { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:5173' };
  const login = await fetch(base + '/api/session', { method: 'POST', headers, body: JSON.stringify({ password: 'test-password' }) });
  headers.Cookie = login.headers.get('set-cookie').split(';')[0];
  const result = await fetch(base + '/api/review', { method: 'POST', headers, body: JSON.stringify(input) });
  assert.equal(result.status, 200); assert.equal((await result.json()).result.total, 10); assert.equal(calls, 1);
});
test('provider errors return safe actionable messages without leaking provider content', async t => {
  let providerStatus = 503;
  const app = createApp({ env: { AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'private-key', REVIEW_PASSWORD: 'test-password' }, fetchImpl: async () => {
    if (providerStatus === 504) throw Object.assign(new Error('secret raw timeout'), { name: 'TimeoutError' });
    return { ok: false, status: providerStatus, json: async () => ({ error: 'private-key' }) };
  } });
  await new Promise(r => app.listen(0, '127.0.0.1', r));
  t.after(() => new Promise(r => { app.close(r); app.closeAllConnections(); }));
  const base = `http://127.0.0.1:${app.address().port}`;
  const headers = { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:5173' };
  const login = await fetch(base + '/api/session', { method: 'POST', headers, body: JSON.stringify({ password: 'test-password' }) });
  headers.Cookie = login.headers.get('set-cookie').split(';')[0];
  for (const [upstream, expected, code] of [[503,503,'provider_unavailable'],[429,429,'provider_quota'],[403,503,'provider_access'],[404,503,'provider_model'],[504,504,'provider_timeout']]) {
    providerStatus = upstream;
    const result = await fetch(base + '/api/review', { method: 'POST', headers, body: JSON.stringify(input) });
    assert.equal(result.status, expected);
    const value = await result.json(); assert.equal(value.code, code); assert.doesNotMatch(JSON.stringify(value), /private-key|secret raw/);
  }
});
