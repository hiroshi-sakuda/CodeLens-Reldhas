# Demo script (about 5 minutes)

The goal is to show the whole product once: students practise judging AI code and
get feedback, and TAs stay in control. Show each part briefly; don't open every
screen.

## Before you start

- Open the app with `?demo` at the end of the address, for example
  `https://code-lens-20.vercel.app/?demo`. This adds **Fill a good answer** and
  **Fill a wrong answer** to every exercise, so you don't type during the demo.
- Use one browser for the whole demo. With no database, TA feedback only reaches a
  student in the same browser.
- Run one Dry Run beforehand, so Python is already downloaded.

The steps for the Skill Map and the TA screens need those features merged
(`add-skill-map` and `add-ta-screens`).

## 1. The idea (30 s)

On the home screen: "Students use AI code every day. CodeLens trains the judgement
to decide whether that code is right. Three short practices, each for one kind of
judgement."

## 2. Concept Match: is it the right approach? (1 min)

1. Start Concept Match on Easy.
2. **Fill a wrong answer**, then **Check answer**. Point at *What to improve*.
3. **Next question**, **Fill a good answer**, **Check answer**. Point at *What you
   did well*, which quotes the student's own reason.

## 3. Dry Run: does it do what it should? (45 s)

1. Start Dry Run, **Fill a wrong answer**, **Submit and run**.
2. "The code really runs." Point at the line where the prediction went wrong.

## 4. Lens Review: judge it without hints (1 min)

1. Start Lens Review with Random criteria.
2. **Fill a good answer** and **Submit review**.
3. Point at the feedback for each comment: claim, lines, reasoning and fix.

## 5. Skill Map (30 s)

Open **Skill Map** in the header: "It shows the weakest area and one click to
practise it."

## 6. The TA side (1 min)

1. Switch to **TA** on the home screen. In **Content Studio**, walk the four steps
   in one sentence: "The TA uploads course material, the AI generates exercises
   from it, and students only get what the TA approves and publishes."
2. **Review Queue:** open the Lens Review from step 4, add a comment and **Approve
   and send**.
3. Mention **Class Insights** in one sentence without opening it: "Class averages,
   common gaps and students who need support."

## 7. Back to the student (15 s)

Switch to **Student**: the home screen shows **New TA feedback**. Open it to show
the TA's comment.
