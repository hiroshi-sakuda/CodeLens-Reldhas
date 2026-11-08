# Skill Map

Shows a student where to practise next, using this browser's attempts plus
made-up sample history. It adds no backend. Open it from the Skill Map link in
the top bar.

## What it shows

- **By lens:** Correctness, Appropriateness, Efficiency and Maintainability, from
  every answer that trains that lens.
- **By function:** Dry Run, Concept Match and Lens Review.
- **Scores:** a percentage with points earned out of answers counted. Right lines
  with the wrong lens count as 0.5, and a half-credit Dry Run counts as 0.
- **By topic:** each lens and each function opens into its topics, weakest first.
- **Weakest lens:** with a short explanation and a Practise button for its weakest
  topic. It also appears on the Practice page under Recommended for you.
- **Improvement trend:** the average score of each of the last four weeks.
- **All results:** every attempt from the last 30 days. Real attempts can be reopened: a Lens Review opens on that attempt's feedback.

## Rules

Only the last 30 days count. A lens needs at least 3 answers to compete for
weakest, and at least two lenses must qualify. Correctness comes first on a tie.

The Practise button opens Dry Run for Correctness and Concept Match for
Appropriateness, at the student's last difficulty and in the weakest topic when
that topic has exercises. Efficiency and Maintainability open Lens Review with
that lens already chosen, because they have no exercise of their own.

A Lens Review issue counts as found (1) with the right lens and an issue keyword
in the annotation, the same test as `assess()`. This holds even when live AI gave
the review its score. Comments on the right lines with
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

## Navigation

Students have a top bar with Practice and Skill map, and TAs have Review Queue,
Content Studio and Class Insights. Exercise screens have no top bar, only a back
button and a slim title bar. Unfinished work is listed under *Continue where you
left off* on the Practice page, one row per kind of exercise, and opens straight
into the review.
