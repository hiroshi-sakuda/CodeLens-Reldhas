# CodeLens

A Python code review practice app for CS students, built with
React, TypeScript, and Vite. Demo mode needs no backend. Optional live AI feedback uses the included Node backend.

## Start the demo

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/.

## Features

- Three practice functions: Lens Review, Dry Run, and Concept Match ([guide](docs/new-features.md))
- Exercise brief and requirements above the code
- Light and dark themes with a saved preference
- Line annotations organized beside the review guide
- Real Python execution in a browser worker, with output and a stop button
- Optional live AI review feedback, simulated review scoring, and curated model reviews
- Browser-local drafts and review history

Python loads on demand from a CDN on the first run. Review scoring is simulated;
the exercises are sample material for demonstration.

## Validate and build

From the repository root:

```sh
npm test
npm run build
npm run preview
```

Deploy `dist/` to a static host. Source code, dependencies, tests, and
configuration live at the repository root. See [the frontend guide](docs/frontend.md)
for the walkthrough, execution limits, and implementation details.

## Live AI feedback

See [backend setup, endpoints, request message and security](docs/ai-backend.md). The API key stays on the server. Run `npm run dev:api` alongside `npm run dev` after configuring `.env`.

For the default Gemini provider, follow [Gemini API setup](docs/gemini-setup.md), then run `npm run check:ai` to verify your key with a synthetic review.
