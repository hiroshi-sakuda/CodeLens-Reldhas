# Skill Map

Shows a student where to practise next, using this browser's attempts plus
made-up sample history. It adds no backend. Open it from the Skill Map link in
the header, on every student screen including Lens Review.

## What it shows

- **By lens:** Correctness, Appropriateness, Efficiency and Maintainability, from
  every answer that trains that lens.
- **By function:** Dry Run, Concept Match and Lens Review.
- **Weakest lens:** with a short explanation and a Practise this button. It also
  appears on the home screen as Suggested for you.
- **Recent feedback:** the last 8 attempts. Real attempts can be reopened.

## Rules

Only the last 30 days count. A lens needs at least 3 answers to compete for
weakest, and at least two lenses must qualify. Correctness comes first on a tie.

Practise this opens Dry Run for Correctness and Concept Match for
Appropriateness, at the student's last difficulty. Efficiency and Maintainability
open Lens Review, which has no exercise of their own.

A Lens Review issue counts as found (1) with the right lens and an issue keyword
in the claim, the same test as `assess()`. Comments on the right lines with
another lens count 0.5, and missed issues count 0.

## Sample data

`features/skill-map/sample-history.js` holds a made-up history so the map isn't
empty in a demo. Because of it, the home screen shows scores before anyone has
practised, and the Skill Map is labelled "Includes sample history". Remove the
entries in that file to show real attempts only.

## Files

| File | Purpose |
| --- | --- |
| `features/skill-map/skills.js` | Score calculations |
| `features/skill-map/SkillMap.tsx` | The screen and the home suggestion |
| `features/skill-map/sample-history.js` | Made-up history |
| `tests/skill-map.test.mjs` | Tests |

Outside the folder, it adds `scoreFor` to `features.ts` and uses it for the card
scores in `StudentHome.tsx`.

## Header navigation

This pull request also changes the header, for students and TAs:

- **Students:** the breadcrumb stays (Practice › Dry Run), and student pages such
  as the Skill Map appear as links on the right. `App.tsx` gets an optional
  `extraLink` so Lens Review shows the same link.
- **TAs:** the TA screens appear as tabs next to CodeLens instead of a
  breadcrumb, since they aren't steps of one path.

It also makes the Skill Map the only progress view, and puts every unfinished
exercise in one place:

- **My progress:** the Lens Review feedback link now opens the Skill Map instead.
  The My progress page code is still in `App.tsx` but no longer reachable in the
  practice shell.
- **Saved reviews:** unfinished Lens Reviews are listed with the other unfinished
  exercises under *Continue where you left off* on the home screen, and open
  straight into the review (`openReview` in `App.tsx`). The list is hidden from
  the Lens Review setup inside the shell. `App` used on its own, without
  `onHome`, keeps both as before.
