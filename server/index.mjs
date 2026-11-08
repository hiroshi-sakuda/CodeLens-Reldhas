import http from 'node:http';
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSubmission } from './review.mjs';
import { providerConfig, providerRequest, providerFeedback } from './provider.mjs';

export function createApp({ env = process.env, fetchImpl = fetch, now = Date.now } = {}) {
  const production = env.NODE_ENV === 'production';
  const origin = env.APP_ORIGIN || 'http://127.0.0.1:5173';
  const localSessionEnabled = !production && env.LOCAL_AUTO_LOGIN === 'true' && ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname);
  const canAutoLogin = req => localSessionEnabled && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress) && !req.headers.forwarded && !req.headers['x-forwarded-for'];
  if (production && (!origin.startsWith('https://') || !env.REVIEW_PASSWORD || env.REVIEW_PASSWORD.length < 16)) throw new Error('Production requires HTTPS APP_ORIGIN and REVIEW_PASSWORD of at least 16 characters.');
  const sessions = new Map(), loginAttempts = new Map();
  let active = 0, dailyCount = 0, day = '';
  const provider = providerConfig(env);
  const configured = !!(provider.key && provider.model && env.REVIEW_PASSWORD);
  const secure = production ? '; Secure' : '';
  const json = (res, status, body, extra = {}) => { res.writeHead(status, { 'Content-Type': 'application/json', ...extra }); res.end(JSON.stringify(body)); };
  const hash = s => createHash('sha256').update(s).digest();
  async function body(req) {
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) throw { status: 415, message: 'Send JSON.' };
    // Vercel may have already parsed the incoming request body.
    if (req.body !== undefined) {
      const raw = Buffer.isBuffer(req.body) ? req.body.toString() : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (Buffer.byteLength(raw) > 32768) throw { status: 413, message: 'Review is too large (32 KB maximum).' };
      try { return JSON.parse(raw); } catch { throw { status: 400, message: 'Invalid JSON.' }; }
    }
    let bytes = 0, chunks = [];
    for await (const chunk of req) { bytes += chunk.length; if (bytes > 32768) throw { status: 413, message: 'Review is too large (32 KB maximum).' }; chunks.push(chunk); }
    try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw { status: 400, message: 'Invalid JSON.' }; }
  }
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    if (production) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
    try {
      const time = now();
      for (const [id, s] of sessions) if (s.expires <= time) sessions.delete(id);
      for (const [ip, a] of loginAttempts) if (a.until <= time) loginAttempts.delete(ip);
      const token = /(?:^|;\s*)codelens_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
      const session = sessions.get(token);
      if (path === '/api/status' && req.method === 'GET') return json(res, 200, { configured, authenticated: !!session, provider: provider.label, localAutoLogin: !!canAutoLogin(req) });
      if (path.startsWith('/api/')) {
        if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
        if (req.headers.origin !== origin) return json(res, 403, { error: 'Request origin is not allowed.' });
        if (!configured) return json(res, 503, { error: 'Live review is not configured on this server.' });
        if (path === '/api/session') {
          const ip = req.socket.remoteAddress;
          const attempt = loginAttempts.get(ip) || { count: 0, until: time + 900000 };
          if (attempt.count >= 5 || loginAttempts.size >= 10000) return json(res, 429, { error: 'Too many sign-in attempts. Try again in 15 minutes.' });
          attempt.count++; loginAttempts.set(ip, attempt);
          const input = await body(req);
          if (!canAutoLogin(req) && (typeof input?.password !== 'string' || !timingSafeEqual(hash(input.password), hash(env.REVIEW_PASSWORD)))) return json(res, 401, { error: 'Incorrect review password.' });
          if (sessions.size >= 1000) return json(res, 503, { error: 'Server is busy. Try again later.' });
          const id = randomBytes(32).toString('hex');
          sessions.set(id, { expires: time + 3600000, count: 0, window: time });
          return json(res, 200, { authenticated: true }, { 'Set-Cookie': `codelens_session=${id}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=3600${secure}` });
        }
        if (!session) return json(res, 401, { error: 'Sign in to use live review.' });
        if (path === '/api/logout') { sessions.delete(token); return json(res, 200, {}, { 'Set-Cookie': `codelens_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${secure}` }); }
        if (path !== '/api/review') return json(res, 404, { error: 'Not found.' });
        if (time - session.window >= 60000) { session.count = 0; session.window = time; }
        if (session.count >= 5 || active >= 3) return json(res, 429, { error: 'Review limit reached. Please try again in a minute.' });
        const today = new Date(time).toISOString().slice(0, 10);
        if (today !== day) { day = today; dailyCount = 0; }
        const limit = Number(env.REVIEW_DAILY_LIMIT || 100);
        if (!Number.isInteger(limit) || limit < 1 || dailyCount >= limit) return json(res, 429, { error: 'The server daily review limit has been reached.' });
        let review;
        const input = await body(req);
        try { review = validateSubmission(input); } catch (e) { return json(res, 400, { error: e.message }); }
        session.count++; dailyCount++; active++;
        try {
          const request = providerRequest(review, provider);
          const upstream = await fetchImpl(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(request.body), signal: AbortSignal.timeout(45000) });
          if (!upstream.ok) {
            const errors = {
              400: [502, 'The AI provider rejected the request. Check the server model configuration.', 'provider_request'],
              401: [503, 'The AI provider rejected the server API key. Check the backend configuration.', 'provider_auth'],
              403: [503, 'AI access is denied. Check the API key permissions and project access.', 'provider_access'],
              404: [503, 'The configured AI model is unavailable. Check the backend model setting.', 'provider_model'],
              429: [429, 'The AI provider quota is exhausted. Check AI Studio usage and try again after the quota resets.', 'provider_quota'],
              503: [503, 'The AI provider is temporarily overloaded or unavailable. Your draft is safe; try again later.', 'provider_unavailable']
            };
            const [status, error, code] = errors[upstream.status] || [502, 'The AI provider could not complete the review. Your draft is safe; try again later.', 'provider_failure'];
            return json(res, status, { error, code });
          }
          const result = providerFeedback(await upstream.json(), review.exercise, provider);
          return json(res, 200, { result });
        } catch (e) {
          if (e.name === 'TimeoutError' || e.name === 'AbortError') return json(res, 504, { error: 'The AI review timed out. Your draft is safe; try again later.', code: 'provider_timeout' });
          return json(res, 502, { error: 'AI feedback could not be received or validated. Your draft is safe; try again later.', code: 'provider_response' });
        }
        finally { active--; }
      }
      if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Method not allowed.' });
      const root = fileURLToPath(new URL('../dist/', import.meta.url));
      const relative = decodeURIComponent(path).replace(/^\/+/, '');
      const file = resolve(root, relative || 'index.html');
      if (!file.startsWith(resolve(root) + '/') && !file.startsWith(resolve(root) + '\\')) return json(res, 404, { error: 'Not found.' });
      if (relative.split('/').some(p => p.startsWith('.'))) return json(res, 404, { error: 'Not found.' });
      let content, target = file;
      try { content = await readFile(target); } catch { if (extname(relative)) return json(res, 404, { error: 'Not found.' }); target = resolve(root, 'index.html'); content = await readFile(target); }
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
      res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream' }); res.end(req.method === 'HEAD' ? undefined : content);
    } catch (e) { json(res, e.status || 500, { error: e.status ? e.message : 'Request failed.' }); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApp();
  server.requestTimeout = 60000; server.headersTimeout = 10000;
  server.listen(Number(process.env.PORT || 3001), process.env.HOST || '127.0.0.1', () => console.log('CodeLens backend ready.'));
}
