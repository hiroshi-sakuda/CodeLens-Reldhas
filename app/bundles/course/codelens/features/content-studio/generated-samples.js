// Pre-made samples standing in for AI generation in Content Studio.
export const generatedSamples = [
 {
  "id": "dr-fc-easy-1",
  "function": "dry-run",
  "topicId": "functions-conditionals",
  "difficulty": "easy",
  "title": "Cinema ticket price",
  "code": "def ticket_price(age):\n    if age < 12:\n        return 5\n    elif age < 65:\n        return 12\n    else:\n        return 7\n\nprint(ticket_price(12))",
  "explanation": "age is 12. `12 < 12` is False, so the first branch is skipped. `12 < 65` is True, so the function returns 12 and prints it."
 },
 {
  "id": "dr-fc-easy-2",
  "function": "dry-run",
  "topicId": "functions-conditionals",
  "difficulty": "easy",
  "title": "Grade letters",
  "code": "def grade(score):\n    if score >= 80:\n        return \"A\"\n    if score >= 70:\n        return \"B\"\n    return \"C\"\n\nprint(grade(80), grade(79))",
  "explanation": "grade(80): 80 >= 80 is True → \"A\". grade(79): 79 >= 80 is False, 79 >= 70 is True → \"B\". print shows both, separated by a space: A B."
 },
 {
  "id": "dr-loops-easy-1",
  "function": "dry-run",
  "topicId": "loops",
  "difficulty": "easy",
  "title": "Running total",
  "code": "total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)",
  "explanation": "range(1, 5) gives 1, 2, 3, 4. total goes 0 → 1 → 3 → 6 → 10, and 10 is printed once, after the loop."
 },
 {
  "id": "dr-fc-medium-1",
  "function": "dry-run",
  "topicId": "functions-conditionals",
  "difficulty": "medium",
  "title": "Shipping cost",
  "code": "def shipping(weight, express):\n    cost = 5\n    if weight > 2:\n        cost = cost + 3\n    if express:\n        cost = cost * 2\n    elif weight > 10:\n        cost = cost + 10\n    return cost\n\nprint(shipping(12, False))\nprint(shipping(3, True))",
  "explanation": "shipping(12, False): cost 5 → 12 > 2 adds 3 → 8. express is False, so the elif runs: 12 > 10 adds 10 → 18. shipping(3, True): 5 → 8 → express doubles it → 16."
 },
 {
  "id": "dr-fc-medium-2",
  "function": "dry-run",
  "topicId": "functions-conditionals",
  "difficulty": "medium",
  "title": "Weather label",
  "code": "def label(temp, raining):\n    if temp > 30:\n        if raining:\n            return \"humid\"\n        return \"hot\"\n    elif temp > 20 and not raining:\n        return \"nice\"\n    return \"stay in\"\n\nprint(label(25, True))\nprint(label(31, False))\nprint(label(20, False))",
  "explanation": "label(25, True): 25 > 30 False; 25 > 20 is True but `not True` is False → \"stay in\". label(31, False): 31 > 30, not raining → \"hot\". label(20, False): 20 > 30 False, 20 > 20 False → \"stay in\"."
 },
 {
  "id": "dr-loops-medium-1",
  "function": "dry-run",
  "topicId": "loops",
  "difficulty": "medium",
  "title": "Counting steps",
  "code": "def count_steps(n):\n    steps = 0\n    while n > 1:\n        if n % 2 == 0:\n            n = n // 2\n        else:\n            n = 3 * n + 1\n        steps += 1\n    return steps\n\nprint(count_steps(6))",
  "explanation": "n goes 6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1, one step each: 8 steps. At 1 the loop stops."
 },
 {
  "id": "dr-fc-hard-1",
  "function": "dry-run",
  "topicId": "functions-conditionals",
  "difficulty": "hard",
  "title": "Two discounts",
  "code": "def total(amount):\n    if amount >= 100:\n        amount = amount * 0.9\n    if amount > 90:\n        amount = amount - 5\n    return round(amount, 2)\n\nprint(total(100))\nprint(total(95))\nprint(total(99))",
  "explanation": "total(100): 100 >= 100 → amount = 90.0; 90.0 > 90 is False → 90.0. total(95): first if skipped; 95 > 90 → 90. total(99): first if skipped; 99 > 90 → 94."
 },
 {
  "id": "dr-fc-hard-2",
  "function": "dry-run",
  "topicId": "functions-conditionals",
  "difficulty": "hard",
  "title": "Number classifier",
  "code": "def classify(n, strict=False):\n    if n % 2 == 0:\n        if strict and n == 0:\n            return \"zero\"\n        return \"even\"\n    if n < 0:\n        return \"negative odd\"\n    return \"odd\"\n\nprint(classify(0))\nprint(classify(0, True))\nprint(classify(-3))\nprint(classify(-4, True))",
  "explanation": "classify(0): even, strict is False → \"even\". classify(0, True): even, strict and n == 0 → \"zero\". classify(-3): -3 % 2 is 1, so not even; -3 < 0 → \"negative odd\". classify(-4, True): even, but n is not 0 → \"even\"."
 },
 {
  "id": "dr-loops-hard-1",
  "function": "dry-run",
  "topicId": "loops",
  "difficulty": "hard",
  "title": "Skip and stop",
  "code": "total = 0\nfor n in [4, 7, 2, 9, 6, 1]:\n    if n % 2 == 1:\n        continue\n    if total > 5:\n        break\n    total += n\nprint(total)",
  "explanation": "4: even, total 0 → 4. 7: odd, continue. 2: even, 4 > 5 is False → 6. 9: odd, continue. 6: even, 6 > 5 is True → break. Prints 6."
 },
 {
  "id": "cm-easy-1",
  "function": "concept-match",
  "topicId": "loops",
  "difficulty": "easy",
  "title": "A gym app counts down from 10 to 1 before a workout starts, showing…",
  "story": "A gym app counts down from 10 to 1 before a workout starts, showing each number on screen.",
  "explanation": "The number of repetitions is known (10) and each value is used once, which is exactly what a for loop over a range does."
 },
 {
  "id": "cm-easy-2",
  "function": "concept-match",
  "topicId": "functions-conditionals",
  "difficulty": "easy",
  "title": "A cinema charges $8 for children under 12, $14 for adults and $10 fo…",
  "story": "A cinema charges $8 for children under 12, $14 for adults and $10 for seniors aged 65 and over. Given a customer's age, the system must find the price.",
  "explanation": "Each age falls into exactly one band, and if / elif / else picks exactly one branch."
 },
 {
  "id": "cm-easy-3",
  "function": "concept-match",
  "topicId": "lists-strings",
  "difficulty": "easy",
  "title": "A sign-up form must check that an email address contains an \"@\" befo…",
  "story": "A sign-up form must check that an email address contains an \"@\" before the user can continue.",
  "explanation": "`in` checks directly whether a string contains another string: one clear line."
 },
 {
  "id": "cm-medium-1",
  "function": "concept-match",
  "topicId": "loops",
  "difficulty": "medium",
  "title": "A list holds today's temperature-sensor readings. A negative reading…",
  "story": "A list holds today's temperature-sensor readings. A negative reading means the sensor failed: the system must report the position of the first one and ignore the rest.",
  "explanation": "You only need the first match, so stopping as soon as you find it is both correct and does no extra work."
 },
 {
  "id": "cm-medium-2",
  "function": "concept-match",
  "topicId": "lists-strings",
  "difficulty": "medium",
  "title": "A music app shows how many times each word appears in a song's lyrics.",
  "story": "A music app shows how many times each word appears in a song's lyrics.",
  "explanation": "One pass over the words, adding 1 to that word's count each time, gives every count at once."
 },
 {
  "id": "cm-medium-3",
  "function": "concept-match",
  "topicId": "functions-conditionals",
  "difficulty": "medium",
  "title": "A car park charges by duration: the first hour is free, then $2 per…",
  "story": "A car park charges by duration: the first hour is free, then $2 per hour up to 4 hours, and a flat $10 beyond 4 hours. A stay falls into exactly one band.",
  "explanation": "Exactly one band applies, and an if / elif / else chain guarantees that only one branch runs."
 },
 {
  "id": "cm-hard-1",
  "function": "concept-match",
  "topicId": "lists-strings",
  "difficulty": "hard",
  "title": "A cinema's booking system receives up to 10,000 bookings a day. Befo…",
  "story": "A cinema's booking system receives up to 10,000 bookings a day. Before confirming each new booking, it must check whether that seat has already been taken.",
  "explanation": "A set checks whether an item is present in about the same time however many bookings there are."
 },
 {
  "id": "cm-hard-2",
  "function": "concept-match",
  "topicId": "lists-strings",
  "difficulty": "hard",
  "title": "A search box shows the user's 5 most recent searches, newest first,…",
  "story": "A search box shows the user's 5 most recent searches, newest first, with no duplicates: searching something again moves it to the front.",
  "explanation": "A list keeps the order; removing and re-inserting moves a repeated search to the front."
 },
 {
  "id": "cm-hard-3",
  "function": "concept-match",
  "topicId": "loops",
  "difficulty": "hard",
  "title": "A print server handles a queue of jobs. Handling a job can add follo…",
  "story": "A print server handles a queue of jobs. Handling a job can add follow-up jobs to the end of the queue. It must stop only when no jobs are left.",
  "explanation": "The loop condition is exactly \"jobs are left\", and new jobs are picked up because the list is checked every time."
 }
];
