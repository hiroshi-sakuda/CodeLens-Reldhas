# Dry Run and Concept Match

This guide covers what was added on top of the Lens Review prototype, how to
try it, and what needs a decision. Everything stays frontend-only: no backend,
no database, saved in localStorage.

## Try it

```sh
git checkout exercises
npm install
npm run dev
```

Open http://127.0.0.1:5173/. On Windows PowerShell, use `npm.cmd` if script
execution is disabled.

## What was added

**Dry Run (Correctness)**

1. Choose a difficulty. The topic is picked at random.
2. Read the code and type the predicted output. A trace table is optional.
3. Submit. The answer locks and the code really runs in `python.worker.js`.
4. See the real output, where the trace went wrong, an explanation and a tip,
   then rate the feedback.

The first submit takes a few seconds and needs internet, because Pyodide is
downloaded at that point. There are 18 sample questions.

**Concept Match (Appropriateness)**

1. Choose a difficulty and get a set of 5 stories.
2. Pick one of 4 concepts and give a one-line reason.
3. Check the answer. It locks, and the feedback explains the options and
   comments on the reason. Rate it.
4. See a summary at the end of the set. Any question can be reopened.

There are 30 sample questions. Feedback is rule-based and labelled Simulated,
like Lens Review. Both exercises can be left and resumed.

## Changes to the existing prototype

These affect screens you already built, so please check them:

- **Opening screen:** the app now opens on a practice menu (`StudentHome.tsx`)
  instead of the Lens Review setup. It is needed to reach the new exercises and
  is provisional, since the home screen is still to be decided.
- **Lens Review header:** adds a Practice link and removes the My progress link.
  The page is still reachable from the Lens Review feedback panel.
- **Lens Review setup:** removes the "8–15 min" text.
- **Code colouring:** `highlight` moved from `App.tsx` to `CodeBlock.tsx` and
  recognises more Python words.
- **Tests:** `npm test` now runs every `tests/*.test.mjs` file.

Lens Review scoring and the Python console are unchanged.

## How the code is organised

Each feature is a folder in `app/bundles/course/codelens/features/` with an
`index.tsx`. `features.ts` finds these folders automatically, and `Shell.tsx`
adds them to the menu, so a feature can be added or removed without changing
the shell. Logic stays in `.js` files and screens in `.tsx` files, as in the
rest of the project.

| File | Purpose |
| --- | --- |
| `Shell.tsx` | Header, navigation and help window; opens `App.tsx` for Lens Review |
| `StudentHome.tsx` | The practice menu |
| `DifficultySetup.tsx` | Choosing a difficulty |
| `CodeBlock.tsx` | Read-only code with line numbers |
| `course.js` | Topics, difficulties, picking exercises |
| `practice-log.js` | Saved attempts |
| `features/dry-run/` | Dry Run screens, marking and Python runner |
| `features/concept-match/` | Concept Match screens and marking |

`attempt-summary.js` and `readTa` / `writeTa` in `practice-log.js` are not used
by these exercises yet. They support the optional screens below.

## Decisions for you

1. Keep, change or replace the practice menu?
2. Keep or revert the two Lens Review changes (My progress link, time text)?
3. Does the `features/` structure suit you, or would you organise it differently?
4. Does the first-run wait in Dry Run bother you? It could preload Python when
   Dry Run opens, or use outputs calculated in advance instead of running live.

## Optional: Skill Map and TA screens

These were not requested and are **not part of this pull request**. They are on
the `all-features` branch, in case they are useful:

- **Skill Map:** scores by lens and by function, the weakest lens and a
  Practise this button.
- **TA screens:** Content Studio, Review Queue and Class Insights, plus a TA
  feedback notice for students.

They use made-up sample data. To see them, run `git checkout all-features` and
start the app as above; a Student / TA switch appears on the home screen. The
`skill-map` and `ta-screens` branches hold each part separately.

## Tested

- `npm test` (48 tests) and the production build pass.
- In the browser: both exercises end to end, including the trace table result.
- At phone width: the menu, both exercises and Lens Review setup and annotation
  all fit the screen.

Not tested: real users, or browsers other than the one built into the
development tool used for these checks.
