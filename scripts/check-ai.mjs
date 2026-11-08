// Loads .env via the npm script. Never prints credentials or raw provider errors.
import { providerConfig, providerRequest, providerFeedback } from '../server/provider.mjs';
import { validateSubmission } from '../server/review.mjs';
const config = providerConfig(process.env);
if (!config.key) { console.error(`Set ${config.name === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY'} in your local .env first.`); process.exitCode = 1; }
else {
  const review = validateSubmission({ exerciseId: 'seats', focus: ['Efficiency'], comments: [{ start: 6, end: 9, lenses: ['Efficiency'], text: 'Nested scanning repeats work. Each requested seat scans every booked seat, costing O(r*b).', fix: 'Build a set of booked seats once for membership lookup.' }], noIssues: false, justification: '' });
  const request = providerRequest(review, config);
  try {
    const response = await fetch(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(request.body), signal: AbortSignal.timeout(45000) });
    if (!response.ok) {
      const hints = { 400: 'Check the configured model and request compatibility.', 401: 'Check your API key.', 403: 'Check key permissions, project access and region eligibility.', 404: 'Choose an available model in AI Studio.', 429: 'Your project quota or free-tier allowance is exhausted. Check AI Studio usage.' };
      throw new Error(`HTTP ${response.status}. ${hints[response.status] || 'The provider is unavailable.'}`);
    }
    const result = providerFeedback(await response.json(), review.exercise, config);
    console.log(`${config.label} connection works. Structured feedback validated; sample score ${result.total}/10.`);
  } catch(e) { console.error(e.message.startsWith('HTTP ') ? e.message : 'Connection or feedback validation failed. Check model access and network, then try again.'); process.exitCode = 1; }
}
