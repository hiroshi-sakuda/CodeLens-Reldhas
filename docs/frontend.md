# CodeLens frontend demo

Standalone React + TypeScript practice prototype. This guide covers Lens Review;
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

1. Open Lens Review from the practice menu. Choose one or more training criteria (or Random criteria), then start practice. The scenario is chosen automatically from matching samples. Random focus stays hidden until submission. Returning users can resume a saved draft or start another review. The workspace provides a Back to review setup link. Read the brief before reviewing the code.
2. Click line 6, then line 9, to select the nested lookup. This opens the Annotations tab beside Review guide.
3. Choose Efficiency. Example claim: "The nested loop scans every booked seat."
4. Explain that each request scans the whole list, resulting in O(r*b) time.
5. Propose building a set of booked seats before the loop. Save the annotation.
6. Edit or delete annotations before submission. Alternatively, select No issues found beside Submit review and give a justification (this is mutually exclusive with annotations). Submit to lock the review.
7. Read the model answer and corrected code directly below the score. Expand Scoring details for the rubric breakdown.
8. Visit My progress from the feedback panel, or try the shopping discount exercise for boundary cases.

Saved annotations, submitted reviews, and history persist in browser localStorage
under `codelens-demo-v1`. Open annotation form text, selected lines, and review setup are saved with each draft. Back to review setup opens the separate training-criteria screen while preserving previous drafts and submitted history. Analytics show the last
30 days; records remain until browser storage is cleared. Storage failure falls
back to session memory and displays a notice.

Feedback is explicitly simulated. A deterministic heuristic checks focus,
issue keywords, line overlap, reasoning length, and fix keywords. Duplicate
annotations cannot increase an issue's score. This is not semantic assessment,
actual AI generation, or approved course material. Model answers
ship in the frontend for demo use. Real TA feedback and real authentication are
outside this prototype's scope.

## Training criteria and sample bank

Eight curated samples cover Correctness, Appropriateness, Efficiency, and
Maintainability across the cinema and shopping scenarios. Two samples have no
issues. Variants share their scenario titles so the title does not reveal the
answer. The selected focus filters out samples with issues outside those areas;
some topic/focus combinations currently have only an issue-free example.
Random focus is selected once and saved with the attempt. Its selected areas
are hidden until submission; annotations may use any of the four areas.

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
