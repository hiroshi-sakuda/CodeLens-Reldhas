# CodeLens frontend demo

React + TypeScript practice prototype. Optional live AI feedback is now available through the Node backend; see [setup, security and endpoints](ai-backend.md). This guide describes demo mode and covers Lens Review;
Dry Run and Concept Match are in [the new features guide](new-features.md). No Rails, authentication,
API keys, database, or backend is needed. The Ruby backend has been removed.

## Run

From the repository root, with Node.js 22 or newer:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. The development server only serves frontend assets.

```sh
npm run build
npm test
npm run preview
```

`dist/` is the static production site and can be served by a static host.
Google Fonts is optional; system fonts work if offline.

## Demo walkthrough

1. On the Practice page, optionally choose a topic on the Lens Review card (the default is Any topic), then choose Start Lens Review. Choose one or more lenses, or tick Random to include all four. A lens with no issue to find in the chosen topic is unavailable. Lens Review has no levels yet, because the sample exercises are not graded by level. The exercise is chosen automatically from matching samples. Drafts with saved work can be resumed under Continue where you left off.
2. Click line 6 and drag to line 9 to select the nested lookup. The annotation form opens beside the code.
3. Under 1, choose Efficiency. Under 2, What's wrong, and why?, write: "The nested loop scans every booked seat, so each request checks the whole list, which takes O(r*b) time."
4. Under 3, Proposed fix, suggest building a set of booked seats before the loop. Save the annotation.
5. Edit or delete annotations before submission. Alternatively, tick I found no issues in this code and say what you checked (this cannot be combined with annotations). Submit to lock the review.
6. Read the result: each planted issue is marked You found this or You missed this, with its explanation and fix, and the code is marked to match. Expand How this was scored for the breakdown.
7. Open the Skill map from the top bar, or try the shopping discount exercise for boundary cases.

Saved annotations, submitted reviews, and history persist in browser localStorage
under `codelens-demo-v1`. Open annotation form text, selected lines, and review setup are saved with each draft. Analytics show the last
30 days; records remain until browser storage is cleared. Storage failure falls
back to session memory and displays a notice.

In demo mode feedback is explicitly simulated. A deterministic heuristic checks focus,
issue keywords, line overlap, reasoning length, and fix keywords. Duplicate
annotations cannot increase an issue's score. This is not semantic assessment,
actual AI generation, or approved course material. Model answers
ship in the frontend for demo use. Real TA feedback and real authentication are
outside this prototype's scope.

## Training criteria and sample bank

Sixteen curated samples cover Correctness, Appropriateness, Efficiency, and
Maintainability across the cinema and shopping scenarios. Appropriateness and
Maintainability have three samples with issues per scenario. Two samples have no
issues. Variants share their scenario titles so the title does not reveal the
answer. The selected focus filters out samples with issues outside those areas. A lens
with no issue to find in the chosen topic is unavailable on the lens screen.
Random includes all four lenses, so annotations may use any of them. Which
lenses have planted issues is shown only after submission.

A correct **No issues found** conclusion earns 10/10 only when a nonblank
justification is supplied and no annotations are present. Incorrect conclusions
or annotations on issue-free code earn zero. This is an explicit demo rule, not
semantic grading of the justification. No artificial critique-rubric scores
are assigned for this path. The model review explains that no change is needed.

## Python console

The command area below the code executes real Python using Pyodide 0.28.3,
loaded on demand from jsDelivr. No Python server or API key is required.
The first run requires internet access to download the runtime.

Type at the `>>>` prompt. Enter runs the command and opens the next prompt. Shift+Enter inserts a line within a command.
The displayed exercise code is loaded once per terminal session. Variables persist between commands until Stop, an execution timeout, or leaving the workspace resets the worker.
The cinema example prints `['A3', 'B1']`; the discount example prints `100`,
revealing the existing boundary bug. Commands and output remain in a scrollable terminal history (up to 100 commands). The prompt also accepts multiline commands with Shift+Enter.

Execution happens in a dedicated Web Worker. **Stop** terminates that worker;
execution also stops after 10 seconds, while runtime loading has a separate
120-second timeout. Switching exercises or leaving the workspace terminates the
worker. Output is limited to 20,000 characters. Interactive `input()` is not
supported. Console output does not affect review grading or saved annotations.

The new console passes the production build and TypeScript checks. Live browser
execution verification is pending because browser approval was blocked by a
usage limit during implementation.

## Structure

- `app/bundles/course/codelens/App.tsx`: review workspace and progress UI
- `app/bundles/course/codelens/PythonConsole.tsx`: command input, output, and execution lifecycle
- `app/bundles/course/codelens/python.worker.js`: browser Python runtime
- `app/bundles/course/codelens/model.js`: sample exercises and demo rubric
- `app/bundles/course/codelens/styles.css`: responsive editor-style theme
- `tests/assessment.test.mjs`: scoring, evidence, duplicate, and partial-credit tests

Verified: production build, 18 assessment/setup tests, and local Python checks of all eight samples. Earlier browser checks covered annotation submission, locked state, and persistence; the new setup/conclusion flow has not yet been browser-verified.
