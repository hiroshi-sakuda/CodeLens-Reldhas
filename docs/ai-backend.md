# Live AI review architecture

Gemini is now the default in `.env.example`. Follow [Gemini setup](gemini-setup.md). OpenAI instructions below apply only when `AI_PROVIDER=openai`; both providers use the same secured endpoints.

Browser → same-origin Node backend → selected AI provider (Gemini or OpenAI) → validated feedback → existing Lens Review panel.

Only Lens Review uses the API. Dry Run, Concept Match, curated exercises and model answers remain unchanged. Demo scoring is still available without credentials.

## Local automatic sessions

With `LOCAL_AUTO_LOGIN=true`, local development creates an HttpOnly session when a live review is submitted. This does not send the `.env` password to the browser. It is disabled in production, for non-loopback app origins, non-loopback connections, and forwarded requests. Without this option, the compact password field remains required. Selecting live AI feedback names the receiving provider beside Submit review.

## Run locally

Requires Node.js 22 or newer. Create `.env` before running the backend commands.

1. Copy `.env.example` to `.env`.
2. Set `OPENAI_API_KEY`, `OPENAI_MODEL` and a strong `REVIEW_PASSWORD`. These are server-only values. Never add a `VITE_` prefix.
3. Run `npm run dev:api` and `npm run dev` in separate terminals.
4. Open `http://127.0.0.1:5173`. Choose Lens Review, write annotations, select **Use live AI feedback**, sign in, inspect **Preview review request**, and agree to send the review.

No live API call occurs until submission. Passwords are kept in component memory only, cleared after login, and never saved with drafts. The browser only receives an HttpOnly session cookie. AI results and student drafts are saved locally. Sign out revokes the session.

## Endpoints

| Method / path | Purpose |
| --- | --- |
| GET /api/status | Availability and current session status; no secrets |
| POST /api/session | `{ "password": "…" }`; creates one-hour session |
| POST /api/logout | Revokes session and clears cookie |
| POST /api/review | Authenticated review; returns `{ "result": { "rubric", "total", "found", "summary", "improvements", "source": "ai" } }` |

Review input: `exerciseId`, `focus` (array of known criteria), `comments` (line range, `lenses` array, `text` for what is wrong and why, `fix`), `noIssues`, `justification`. The backend resolves code and reference findings from its own exercise bank; client-supplied reference material is ignored. Students can inspect the same sample answers in the frontend, so this is a practice tool, not a secure examination system.

## Request message

The exact developer instructions are exported as `instructions` in `server/review.mjs`. An example complete provider request is in `docs/review-request.example.json`, generated with the same `prepareRequest` function used by the endpoint.

Instructions ask a supportive tutor to treat student text as untrusted data, assess meaning against requirements and curated findings, grade issue/lines/explanation/fix from 0–2.5 each, and explain strengths and improvements. The user input is JSON containing numbered exercise code, requirements, reference findings/code and the student review. Strict structured output specifies the response shape; server validation checks bounds and computes the total. No tools or code execution are enabled. See [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

`store: false` is sent to the provider. This does not promise zero provider retention; apply your institution's data policy and provider account settings. The application does not log submitted code, passwords, provider responses or keys.

## Security and deployment

- Same-origin JSON POSTs, exact Origin validation, no CORS, HttpOnly SameSite=Strict cookies (Secure in production), one-hour expiry and explicit logout.
- Five login attempts per socket IP per 15 minutes; five reviews per session per minute; three simultaneous provider requests; a global daily allowance (100 by default). Failed provider calls count against the allowance to bound retries.
- 32 KB bodies, at most 20 annotations, bounded text and line ranges; fixed provider URL and server-selected model; 45-second provider timeout; no automatic retries; sanitized errors; no silent fallback to demo scores.
- Production requires an HTTPS `APP_ORIGIN` and password of at least 16 characters. Terminate TLS at a trusted reverse proxy. Set `HOST=0.0.0.0` only where your hosting platform requires it; otherwise bind loopback. Forward the public host and Origin unchanged. Do not expose the development server.
- Build with `npm run build`, set `NODE_ENV=production`, `APP_ORIGIN=https://your-host` and server secrets, then `npm start`. Node serves `dist/` and `/api` from the same origin. Keep `.env` outside `dist/` and source control.
- This is a small single-process deployment with a shared access password. Session and rate-limit state are memory-only, reset on restart, and are not shared across replicas. Behind a proxy, login throttling deliberately uses the socket address rather than trusting spoofable forwarded headers; clients may share a login limit. Use one instance and provider project spending controls. Before a broad institutional rollout, replace shared access with institutional identity and use a shared session/limit store and gateway throttling.
- Prompt isolation reduces injection risk but cannot guarantee AI grading correctness. Render output as React text, never HTML; do not execute model output. Keep human review for consequential assessment.

## Verification

`npm test` includes HTTP integration tests with a mocked provider for authentication, origin rejection, payload limits, trusted exercise resolution, structured feedback, provider failure, daily quota and logout. `npm run build` checks the frontend. A real paid provider round trip still requires configured credentials.
