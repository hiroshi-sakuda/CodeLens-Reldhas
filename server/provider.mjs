import { prepareRequest, parseFeedback } from './review.mjs';

export function providerConfig(env) {
  const name = env.AI_PROVIDER || 'openai';
  if (!['gemini', 'openai'].includes(name)) throw new Error('AI_PROVIDER must be gemini or openai.');
  return name === 'gemini'
    ? { name, label: 'Google Gemini', key: env.GEMINI_API_KEY, model: env.GEMINI_MODEL || 'gemini-3.5-flash' }
    : { name, label: 'OpenAI', key: env.OPENAI_API_KEY, model: env.OPENAI_MODEL };
}

export function providerRequest(review, config) {
  const request = prepareRequest(review, config.model);
  if (config.name === 'openai') return { url: 'https://api.openai.com/v1/responses', headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' }, body: request };
  if (!/^[a-zA-Z0-9._-]+$/.test(config.model)) throw new Error('Invalid Gemini model identifier.');
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
    headers: { 'x-goog-api-key': config.key, 'Content-Type': 'application/json' },
    body: {
      systemInstruction: { parts: [{ text: request.instructions }] },
      contents: [{ role: 'user', parts: [{ text: request.input }] }],
      generationConfig: { maxOutputTokens: 4096, responseMimeType: 'application/json', responseJsonSchema: request.text.format.schema }
    }
  };
}

export function providerFeedback(response, exercise, config) {
  if (config.name === 'openai') return parseFeedback(response, exercise);
  const candidate = response.candidates?.[0];
  if (response.promptFeedback?.blockReason || candidate?.finishReason !== 'STOP') throw new Error('Incomplete or blocked Gemini response');
  const text = candidate.content?.parts?.filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('');
  return parseFeedback({ status: 'completed', output: [{ content: [{ type: 'output_text', text }] }] }, exercise);
}
