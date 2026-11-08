import { createApp } from '../server/index.mjs';

// Keep all API routes in one function so they share the backend's session state.
const app = createApp();

export default function handler(req, res) {
  return app.emit('request', req, res);
}
