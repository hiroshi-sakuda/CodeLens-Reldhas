import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

test('Vercel entry point serves status and accepts parsed JSON with auth and size checks', async t => {
  const previous = { ...process.env };
  Object.assign(process.env, { NODE_ENV: 'production', APP_ORIGIN: 'https://codelens-nus-dev.vercel.app', AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'test-only-key', REVIEW_PASSWORD: 'test-only-review-password' });
  const { default: handler } = await import('../api/index.mjs');
  process.env = previous;
  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      req.body = JSON.parse(Buffer.concat(chunks).toString());
    }
    handler(req, res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const status = await (await fetch(base + '/api/status')).json();
  assert.equal(status.configured, true);
  assert.equal(status.authenticated, false);
  let cookie = '';
  const post = (path, data, origin = 'https://codelens-nus-dev.vercel.app') => fetch(base + path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(data) });
  assert.equal((await post('/api/session', { password: 'test-only-review-password' }, 'https://evil.example')).status, 403);
  assert.equal((await post('/api/session', { password: 'wrong' })).status, 401);
  const login = await post('/api/session', { password: 'test-only-review-password' });
  assert.equal(login.status, 200);
  cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await (await fetch(base + '/api/status', { headers: { Cookie: cookie } })).json()).authenticated, true);
  assert.equal((await post('/api/review', {})).status, 400);
  assert.equal((await post('/api/review', { text: 'x'.repeat(40000) })).status, 413);
  assert.equal((await post('/api/logout', {})).status, 200);
  assert.equal((await post('/api/review', {})).status, 401);
});
