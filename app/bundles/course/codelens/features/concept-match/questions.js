// Sample questions standing in for AI generation.
export const questions = [
 {
  "id": "cm-easy-1",
  "topicId": "loops",
  "difficulty": "easy",
  "story": "A gym app counts down from 10 to 1 before a workout starts, showing each number on screen.",
  "options": [
   {
    "id": "A",
    "text": "A for loop over range(10, 0, -1)",
    "why": "The number of repetitions is known (10) and each value is used once, which is exactly what a for loop over a range does."
   },
   {
    "id": "B",
    "text": "An if / elif chain with one branch per number",
    "why": "Ten branches that each print one number repeat the same code ten times; a loop does it in two lines."
   },
   {
    "id": "C",
    "text": "A dictionary from each number to its word",
    "why": "A dictionary stores look-ups; nothing needs to be looked up here."
   },
   {
    "id": "D",
    "text": "Sort a list of the numbers 1 to 10",
    "why": "Sorting puts values in order, but the app still needs to go through them and show each one."
   }
  ],
  "correct": "A",
  "reasonSignals": [
   "repeat",
   "each",
   "range",
   "loop",
   "count",
   "known",
   "fixed",
   "times"
  ],
  "concept": "for loops and range (Week 4)"
 },
 {
  "id": "cm-easy-2",
  "topicId": "functions-conditionals",
  "difficulty": "easy",
  "story": "A cinema charges $8 for children under 12, $14 for adults and $10 for seniors aged 65 and over. Given a customer's age, the system must find the price.",
  "options": [
   {
    "id": "A",
    "text": "A while loop that counts up to the age",
    "why": "Nothing needs repeating: one age gives one price."
   },
   {
    "id": "B",
    "text": "An if / elif / else on the age",
    "why": "Each age falls into exactly one band, and if / elif / else picks exactly one branch."
   },
   {
    "id": "C",
    "text": "Sort the list of all ages",
    "why": "Sorting orders many values; here there is a single age to classify."
   },
   {
    "id": "D",
    "text": "A set of all valid ages",
    "why": "A set answers \"is it in there?\", not \"which price band?\"."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "band",
   "range",
   "categor",
   "group",
   "condition",
   "if",
   "elif",
   "one of",
   "only one"
  ],
  "concept": "if / elif / else (Week 3)"
 },
 {
  "id": "cm-easy-3",
  "topicId": "lists-strings",
  "difficulty": "easy",
  "story": "A sign-up form must check that an email address contains an \"@\" before the user can continue.",
  "options": [
   {
    "id": "A",
    "text": "Sort the characters of the email",
    "why": "Sorting scrambles the address and still needs a check afterwards."
   },
   {
    "id": "B",
    "text": "A dictionary of known email addresses",
    "why": "A dictionary of existing emails can't validate a new one."
   },
   {
    "id": "C",
    "text": "Check `\"@\" in email`",
    "why": "`in` checks directly whether a string contains another string: one clear line."
   },
   {
    "id": "D",
    "text": "A while loop that keeps asking forever",
    "why": "The question is whether this email has an @, which needs a check, not repetition."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "contain",
   "in ",
   "membership",
   "substring",
   "check",
   "built-in",
   "directly"
  ],
  "concept": "String membership with in (Week 6)"
 },
 {
  "id": "cm-easy-4",
  "topicId": "loops",
  "difficulty": "easy",
  "story": "A teacher wants the average of 30 quiz marks stored in a list.",
  "options": [
   {
    "id": "A",
    "text": "Binary search for the middle mark",
    "why": "That finds a median-like value in sorted data, not the average."
   },
   {
    "id": "B",
    "text": "An if / elif chain on each mark",
    "why": "Classifying marks doesn't add them up."
   },
   {
    "id": "C",
    "text": "Put the marks in a set",
    "why": "A set drops repeated marks, so two students with the same mark would count once and the average would be wrong."
   },
   {
    "id": "D",
    "text": "Add up the marks in a loop (or with sum), then divide by how many there are",
    "why": "An average is the total divided by the count: an accumulator over the list gives the total."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "sum",
   "total",
   "add",
   "accumulat",
   "divide",
   "count",
   "len"
  ],
  "concept": "Accumulators (Week 4)"
 },
 {
  "id": "cm-easy-5",
  "topicId": "lists-strings",
  "difficulty": "easy",
  "story": "A shop needs the price of a product whenever a customer types its name.",
  "options": [
   {
    "id": "A",
    "text": "A list of prices",
    "why": "A list is indexed by position, so you'd need to know where each product sits."
   },
   {
    "id": "B",
    "text": "A dictionary from product name to price",
    "why": "A dictionary looks a value up by its key, here the product name, directly."
   },
   {
    "id": "C",
    "text": "One long string with all names and prices",
    "why": "Every lookup would need to search and cut up the string."
   },
   {
    "id": "D",
    "text": "A while loop over the product names",
    "why": "Looping to find a name works but is what a dictionary does for you in one step."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "key",
   "look",
   "name",
   "map",
   "pair",
   "dict"
  ],
  "concept": "Dictionaries (Week 7)"
 },
 {
  "id": "cm-easy-6",
  "topicId": "functions-conditionals",
  "difficulty": "easy",
  "story": "A thermostat turns the heater on when the temperature drops below 18°C, and off otherwise.",
  "options": [
   {
    "id": "A",
    "text": "Recursion on the temperature",
    "why": "Recursion solves problems made of smaller copies of themselves; this is one comparison."
   },
   {
    "id": "B",
    "text": "A for loop over range(18)",
    "why": "Nothing repeats; one reading gives one decision."
   },
   {
    "id": "C",
    "text": "A list of past temperatures",
    "why": "History isn't needed to decide on the current reading."
   },
   {
    "id": "D",
    "text": "A single if / else",
    "why": "There are exactly two outcomes decided by one condition: that's an if / else."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "if",
   "else",
   "condition",
   "two",
   "either",
   "below",
   "otherwise"
  ],
  "concept": "if / else (Week 2)"
 },
 {
  "id": "cm-easy-7",
  "topicId": "loops",
  "difficulty": "easy",
  "story": "A guessing game keeps asking the player for a number until they guess the secret number.",
  "options": [
   {
    "id": "A",
    "text": "A while loop that runs until the guess is right",
    "why": "The number of repetitions is unknown and depends on a condition: that's what a while loop is for."
   },
   {
    "id": "B",
    "text": "A for loop over range(10)",
    "why": "That allows exactly 10 guesses, but nobody knows in advance how many guesses a player needs."
   },
   {
    "id": "C",
    "text": "One if statement",
    "why": "An if checks once; the game must keep asking."
   },
   {
    "id": "D",
    "text": "Sort the guesses",
    "why": "Order doesn't matter; repeating until a condition holds does."
   }
  ],
  "correct": "A",
  "reasonSignals": [
   "until",
   "unknown",
   "while",
   "how many",
   "keep",
   "condition",
   "don't know",
   "not know"
  ],
  "concept": "while loops (Week 4)"
 },
 {
  "id": "cm-easy-8",
  "topicId": "lists-strings",
  "difficulty": "easy",
  "story": "A chat room lists who joined today. Some people joined several times; the app should show each username once (order doesn't matter).",
  "options": [
   {
    "id": "A",
    "text": "Join all usernames into one string",
    "why": "Joining keeps the duplicates, just in one string."
   },
   {
    "id": "B",
    "text": "Nested if statements per user",
    "why": "You can't write an if for each user you don't know yet."
   },
   {
    "id": "C",
    "text": "Put the usernames in a set",
    "why": "A set keeps each value only once, which removes the duplicates for you."
   },
   {
    "id": "D",
    "text": "A while loop that counts the users",
    "why": "Counting gives a number, not the list of unique names."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "set",
   "duplicate",
   "unique",
   "once",
   "repeat"
  ],
  "concept": "Sets (Week 7)"
 },
 {
  "id": "cm-easy-9",
  "topicId": "functions-conditionals",
  "difficulty": "easy",
  "story": "Five pages of a website compute the same tax on a price. The tax rule may change next year.",
  "options": [
   {
    "id": "A",
    "text": "Copy the tax formula into each page",
    "why": "When the rule changes, all five copies must be found and changed, and one is easily missed."
   },
   {
    "id": "B",
    "text": "One function that every page calls",
    "why": "A function keeps the rule in one place: reuse it everywhere, change it once."
   },
   {
    "id": "C",
    "text": "A loop over the five pages",
    "why": "The pages compute tax at different times; a loop doesn't make the rule reusable."
   },
   {
    "id": "D",
    "text": "A dictionary from page name to tax",
    "why": "The tax depends on the price, not on the page."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "reuse",
   "function",
   "one place",
   "once",
   "change",
   "copy",
   "duplicat"
  ],
  "concept": "Functions (Week 2)"
 },
 {
  "id": "cm-easy-10",
  "topicId": "lists-strings",
  "difficulty": "easy",
  "story": "A library app must show book titles in alphabetical order.",
  "options": [
   {
    "id": "A",
    "text": "A countdown while loop",
    "why": "Repetition alone doesn't put anything in order."
   },
   {
    "id": "B",
    "text": "Put the titles in a set",
    "why": "Sets have no order, so the titles would come out in any order."
   },
   {
    "id": "C",
    "text": "An if / elif chain comparing titles",
    "why": "Comparing every pair by hand is what sort already does correctly."
   },
   {
    "id": "D",
    "text": "Sort the list of titles",
    "why": "Sorting strings puts them in alphabetical order, which is exactly what's needed."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "sort",
   "order",
   "alphabet"
  ],
  "concept": "Sorting lists (Week 6)"
 },
 {
  "id": "cm-medium-1",
  "topicId": "loops",
  "difficulty": "medium",
  "story": "A list holds today's temperature-sensor readings. A negative reading means the sensor failed: the system must report the position of the first one and ignore the rest.",
  "options": [
   {
    "id": "A",
    "text": "Sort the readings and take the first",
    "why": "Sorting loses the original positions, which is what must be reported."
   },
   {
    "id": "B",
    "text": "Collect the positions of all negative readings, then take the first",
    "why": "It gives the right answer, but it keeps scanning after the answer is known."
   },
   {
    "id": "C",
    "text": "Loop through the readings and stop (break or return) at the first negative one",
    "why": "You only need the first match, so stopping as soon as you find it is both correct and does no extra work."
   },
   {
    "id": "D",
    "text": "Put the readings in a set",
    "why": "A set has no positions at all."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "stop",
   "first",
   "break",
   "early",
   "return",
   "as soon"
  ],
  "concept": "Loops with break / early return (Week 5)"
 },
 {
  "id": "cm-medium-2",
  "topicId": "lists-strings",
  "difficulty": "medium",
  "story": "A music app shows how many times each word appears in a song's lyrics.",
  "options": [
   {
    "id": "A",
    "text": "For each word, call lyrics.count(word)",
    "why": "It works, but it scans all the lyrics again for every word."
   },
   {
    "id": "B",
    "text": "A dictionary from each word to its count, updated in one pass",
    "why": "One pass over the words, adding 1 to that word's count each time, gives every count at once."
   },
   {
    "id": "C",
    "text": "Put the words in a set",
    "why": "A set keeps each word once and loses the counts."
   },
   {
    "id": "D",
    "text": "Sort the words",
    "why": "Sorting groups equal words but still leaves the counting to do."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "dict",
   "key",
   "count",
   "each word",
   "frequenc",
   "tally",
   "one pass",
   "once"
  ],
  "concept": "Counting with dictionaries (Week 7)"
 },
 {
  "id": "cm-medium-3",
  "topicId": "functions-conditionals",
  "difficulty": "medium",
  "story": "A car park charges by duration: the first hour is free, then $2 per hour up to 4 hours, and a flat $10 beyond 4 hours. A stay falls into exactly one band.",
  "options": [
   {
    "id": "A",
    "text": "A while loop over the hours",
    "why": "The price follows directly from the band; no repetition is needed."
   },
   {
    "id": "B",
    "text": "Three separate if statements",
    "why": "Separate ifs can each run, so a long stay could be charged by two bands unless every condition is written very carefully."
   },
   {
    "id": "C",
    "text": "A dictionary from hours to price",
    "why": "Durations aren't a fixed set of keys (2.5 hours? 30 hours?)."
   },
   {
    "id": "D",
    "text": "One if / elif / else chain, checking the bands in order",
    "why": "Exactly one band applies, and an if / elif / else chain guarantees that only one branch runs."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "elif",
   "exclusive",
   "only one",
   "exactly one",
   "band",
   "order",
   "one branch"
  ],
  "concept": "if / elif / else for exclusive cases (Week 3)"
 },
 {
  "id": "cm-medium-4",
  "topicId": "lists-strings",
  "difficulty": "medium",
  "story": "A map app stores a location as latitude and longitude. Once created, a location should never change by accident.",
  "options": [
   {
    "id": "A",
    "text": "A tuple (lat, lon)",
    "why": "A tuple groups the two values and can't be changed after it is created."
   },
   {
    "id": "B",
    "text": "A list [lat, lon]",
    "why": "It groups the values, but any part of the program can change them."
   },
   {
    "id": "C",
    "text": "A dictionary {\"lat\": …, \"lon\": …}",
    "why": "Clear names, but a dictionary can also be changed at any time."
   },
   {
    "id": "D",
    "text": "A string \"1.30,103.80\"",
    "why": "Every use would need splitting and converting back to numbers."
   }
  ],
  "correct": "A",
  "reasonSignals": [
   "tuple",
   "immutable",
   "fixed",
   "not change",
   "can't change",
   "cannot change",
   "never change",
   "pair"
  ],
  "concept": "Tuples (Week 7)"
 },
 {
  "id": "cm-medium-5",
  "topicId": "loops",
  "difficulty": "medium",
  "story": "A maths app prints a 9 × 9 multiplication table: every row number times every column number.",
  "options": [
   {
    "id": "A",
    "text": "Recursion",
    "why": "Nothing here is a smaller copy of the same problem."
   },
   {
    "id": "B",
    "text": "One for loop over 81 numbers, working out the row and column from each",
    "why": "Possible with // and %, but harder to read and easy to get wrong."
   },
   {
    "id": "C",
    "text": "Two nested for loops, one for rows and one for columns",
    "why": "Every combination of row and column is needed, which is exactly what nested loops produce."
   },
   {
    "id": "D",
    "text": "A while loop with only a row counter",
    "why": "That covers the rows but not the columns in each row."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "nested",
   "row",
   "column",
   "inside",
   "two loops",
   "every combination",
   "each"
  ],
  "concept": "Nested loops (Week 5)"
 },
 {
  "id": "cm-medium-6",
  "topicId": "lists-strings",
  "difficulty": "medium",
  "story": "A door lock accepts a 6-character code. The system must check that every character is a digit.",
  "options": [
   {
    "id": "A",
    "text": "Sort the characters",
    "why": "Sorting doesn't tell you whether they are digits."
   },
   {
    "id": "B",
    "text": "Try int(code) and see if it fails",
    "why": "int also accepts \"+12345\", \"-12345\" and \" 1234 \", which are not 6 digits."
   },
   {
    "id": "C",
    "text": "Loop over each character and check it is in \"0123456789\"",
    "why": "Correct, but it rewrites by hand what isdigit already does."
   },
   {
    "id": "D",
    "text": "code.isdigit()",
    "why": "A built-in string method that says exactly whether every character is a digit."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "isdigit",
   "built-in",
   "method",
   "every character",
   "digit"
  ],
  "concept": "String methods (Week 6)"
 },
 {
  "id": "cm-medium-7",
  "topicId": "functions-conditionals",
  "difficulty": "medium",
  "story": "A banking app validates a transfer: the amount must be positive and below the daily limit. If not, it must tell the user which rule failed.",
  "options": [
   {
    "id": "A",
    "text": "One combined condition: if amount > 0 and amount < limit",
    "why": "It accepts and rejects correctly, but can't say which rule failed."
   },
   {
    "id": "B",
    "text": "A separate if for each rule, each returning its own message",
    "why": "Each rule is checked on its own, so the user learns exactly which rule failed."
   },
   {
    "id": "C",
    "text": "A loop over the amount",
    "why": "Validation is a few checks, not repetition."
   },
   {
    "id": "D",
    "text": "A dictionary of valid amounts",
    "why": "Valid amounts can't be listed one by one."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "separate",
   "each rule",
   "which",
   "message",
   "guard",
   "early",
   "own"
  ],
  "concept": "Validation with if (Week 3)"
 },
 {
  "id": "cm-medium-8",
  "topicId": "loops",
  "difficulty": "medium",
  "story": "Find the highest score in a list of game scores, without using max().",
  "options": [
   {
    "id": "A",
    "text": "Loop once, keeping the highest score seen so far",
    "why": "One pass, comparing each score with the best so far, finds the highest without changing the list."
   },
   {
    "id": "B",
    "text": "Sort the list and take the last item",
    "why": "It works, but it reorders the whole list (or makes a copy) just to find one value."
   },
   {
    "id": "C",
    "text": "Put the scores in a set",
    "why": "A set removes duplicates; it doesn't find the highest."
   },
   {
    "id": "D",
    "text": "Compare the first three scores with if / elif",
    "why": "The list can have any length."
   }
  ],
  "correct": "A",
  "reasonSignals": [
   "so far",
   "compare",
   "keep",
   "track",
   "one pass",
   "best",
   "current",
   "highest"
  ],
  "concept": "Tracking a running value in a loop (Week 4)"
 },
 {
  "id": "cm-medium-9",
  "topicId": "lists-strings",
  "difficulty": "medium",
  "story": "A name badge printer turns \"Ada Lovelace\" into \"Lovelace, Ada\". Names always have exactly two words.",
  "options": [
   {
    "id": "A",
    "text": "Sort the two words",
    "why": "Sorting gives alphabetical order, which only sometimes puts the surname first."
   },
   {
    "id": "B",
    "text": "Loop over the characters, building the first and last name until the space",
    "why": "It works, but it rebuilds by hand what split does."
   },
   {
    "id": "C",
    "text": "name.replace(\" \", \", \")",
    "why": "That gives \"Ada, Lovelace\": the words stay in the same order."
   },
   {
    "id": "D",
    "text": "Split the name on the space and join the parts in the new order",
    "why": "split gives the two words directly; rearranging them is one line."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "split",
   "join",
   "parts",
   "words",
   "index",
   "swap"
  ],
  "concept": "split and join (Week 6)"
 },
 {
  "id": "cm-medium-10",
  "topicId": "loops",
  "difficulty": "medium",
  "story": "A savings account grows 3% a year. How many years until the balance doubles?",
  "options": [
   {
    "id": "A",
    "text": "An if statement on the balance",
    "why": "One check can't add years repeatedly."
   },
   {
    "id": "B",
    "text": "A for loop over range(100) that breaks when the balance doubles",
    "why": "It works, but 100 is an arbitrary limit that hides the real stopping condition."
   },
   {
    "id": "C",
    "text": "A while loop that adds a year until the balance is at least double",
    "why": "The number of years isn't known in advance; the loop runs until a condition is met."
   },
   {
    "id": "D",
    "text": "A list of balances for every year",
    "why": "Storing every year isn't needed to count them."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "while",
   "until",
   "unknown",
   "condition",
   "don't know",
   "not known",
   "how many"
  ],
  "concept": "while loops with a condition (Week 4)"
 },
 {
  "id": "cm-hard-1",
  "topicId": "lists-strings",
  "difficulty": "hard",
  "story": "A cinema's booking system receives up to 10,000 bookings a day. Before confirming each new booking, it must check whether that seat has already been taken.",
  "options": [
   {
    "id": "A",
    "text": "Keep the booked seats in a list and check with `in`",
    "why": "It works, but each check scans every booking, so it slows down as bookings grow."
   },
   {
    "id": "B",
    "text": "Keep the booked seats in a set and check membership",
    "why": "A set checks whether an item is present in about the same time however many bookings there are."
   },
   {
    "id": "C",
    "text": "Sort the bookings after each new one, then binary search",
    "why": "Sorting after every booking is extra work the problem doesn't need."
   },
   {
    "id": "D",
    "text": "A dictionary from seat to True",
    "why": "Fast too, but it stores values that are never used; a set says what you mean."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "set",
   "fast",
   "quick",
   "constant",
   "membership",
   "many",
   "scale",
   "grow",
   "same time",
   "hash"
  ],
  "concept": "Sets and membership checks (Week 7)"
 },
 {
  "id": "cm-hard-2",
  "topicId": "lists-strings",
  "difficulty": "hard",
  "story": "A search box shows the user's 5 most recent searches, newest first, with no duplicates: searching something again moves it to the front.",
  "options": [
   {
    "id": "A",
    "text": "A set of searches",
    "why": "No duplicates, but a set has no order, so \"newest first\" is impossible."
   },
   {
    "id": "B",
    "text": "A dictionary counting how often each search was made",
    "why": "Counts show popularity, not recency."
   },
   {
    "id": "C",
    "text": "A list: remove the search if present, insert it at the front, keep the first 5",
    "why": "A list keeps the order; removing and re-inserting moves a repeated search to the front."
   },
   {
    "id": "D",
    "text": "A list sorted alphabetically",
    "why": "Alphabetical order isn't \"most recent first\"."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "order",
   "list",
   "front",
   "insert",
   "remove",
   "recent",
   "newest",
   "position"
  ],
  "concept": "Lists that keep order (Week 6)"
 },
 {
  "id": "cm-hard-3",
  "topicId": "loops",
  "difficulty": "hard",
  "story": "A print server handles a queue of jobs. Handling a job can add follow-up jobs to the end of the queue. It must stop only when no jobs are left.",
  "options": [
   {
    "id": "A",
    "text": "for job in jobs: … (appending follow-ups to jobs)",
    "why": "Changing a list while a for loop walks over it is fragile and hard to reason about."
   },
   {
    "id": "B",
    "text": "Recursion: handle one job, then call yourself on the rest",
    "why": "Works for small queues, but a long queue makes the recursion too deep."
   },
   {
    "id": "C",
    "text": "for i in range(len(jobs)): …",
    "why": "range(len(jobs)) is computed once, so jobs added later are never handled."
   },
   {
    "id": "D",
    "text": "while jobs: take the first job out and handle it",
    "why": "The loop condition is exactly \"jobs are left\", and new jobs are picked up because the list is checked every time."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "while",
   "until",
   "empty",
   "left",
   "added",
   "grow",
   "pop",
   "remain",
   "condition"
  ],
  "concept": "while loops over a changing collection (Week 5)"
 },
 {
  "id": "cm-hard-4",
  "topicId": "functions-conditionals",
  "difficulty": "hard",
  "story": "A calendar app decides leap years: divisible by 4, except years divisible by 100, unless they are also divisible by 400.",
  "options": [
   {
    "id": "A",
    "text": "if / elif / else checking 400 first, then 100, then 4",
    "why": "Checking the most specific rule first means each exception is handled before the general rule."
   },
   {
    "id": "B",
    "text": "if / elif / else checking 4 first, then 100, then 400",
    "why": "Every year divisible by 4 takes the first branch, so 1900 would wrongly be a leap year."
   },
   {
    "id": "C",
    "text": "A list of all leap years",
    "why": "The rule works for any year; a list only covers the years someone typed in."
   },
   {
    "id": "D",
    "text": "if year % 4 == 0",
    "why": "It ignores the century exceptions, so 1900 and 2100 come out wrong."
   }
  ],
  "correct": "A",
  "reasonSignals": [
   "order",
   "specific",
   "400 first",
   "exception",
   "first",
   "elif",
   "1900"
  ],
  "concept": "Order of conditions in if / elif (Week 3)"
 },
 {
  "id": "cm-hard-5",
  "topicId": "loops",
  "difficulty": "hard",
  "story": "A payment app checks whether any two transactions in a list of up to 100,000 add up to exactly a target amount.",
  "options": [
   {
    "id": "A",
    "text": "Two nested loops checking every pair",
    "why": "Correct, but 100,000 items means about 5 billion pairs, far too slow."
   },
   {
    "id": "B",
    "text": "Sort and compare neighbouring amounts only",
    "why": "The two amounts that add up to the target are rarely next to each other."
   },
   {
    "id": "C",
    "text": "One loop with a set of amounts seen so far, checking for target − amount",
    "why": "One pass: for each amount you check in about constant time whether its partner was already seen."
   },
   {
    "id": "D",
    "text": "Recursion over all subsets",
    "why": "That explores far more combinations than pairs and is extremely slow."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "set",
   "seen",
   "complement",
   "partner",
   "one pass",
   "target -",
   "target −",
   "fast",
   "large",
   "100,000"
  ],
  "concept": "Sets and membership checks (Week 7)"
 },
 {
  "id": "cm-hard-6",
  "topicId": "lists-strings",
  "difficulty": "hard",
  "story": "A tutor app stores each student's grade for several modules, then looks up one student's grade in one module, and lists all modules of a student.",
  "options": [
   {
    "id": "A",
    "text": "A list of lists, using positions for students and modules",
    "why": "You'd have to remember which position is which student and module."
   },
   {
    "id": "B",
    "text": "A dictionary from student to a dictionary from module to grade",
    "why": "Both look-ups are direct, and a student's inner dictionary lists their modules."
   },
   {
    "id": "C",
    "text": "One dictionary keyed by \"name-module\" strings",
    "why": "Single look-ups work, but listing one student's modules means scanning and splitting every key."
   },
   {
    "id": "D",
    "text": "A set of (student, module, grade) tuples",
    "why": "Finding a grade means scanning the whole set."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "nested",
   "dict",
   "key",
   "student",
   "module",
   "look up",
   "lookup",
   "inner",
   "list all"
  ],
  "concept": "Nested dictionaries (Week 7)"
 },
 {
  "id": "cm-hard-7",
  "topicId": "functions-conditionals",
  "difficulty": "hard",
  "story": "An online shop's shipping: free for members or orders of $50 and over, otherwise $5. Express delivery adds $8 in every case.",
  "options": [
   {
    "id": "A",
    "text": "One if / elif / else where express is one of the branches",
    "why": "Express then replaces the base fee instead of adding to it, so an express member order is charged wrongly."
   },
   {
    "id": "B",
    "text": "A dictionary of every combination of member, amount and express",
    "why": "Order amounts can't all be listed as keys."
   },
   {
    "id": "C",
    "text": "Nested ifs for all four combinations",
    "why": "Correct, but it repeats the same amounts in several branches."
   },
   {
    "id": "D",
    "text": "An if / else for the base fee, then a separate if that adds express",
    "why": "Two independent decisions, written as two separate pieces of logic: base fee, then express on top."
   }
  ],
  "correct": "D",
  "reasonSignals": [
   "separate",
   "independent",
   "regardless",
   "every case",
   "add",
   "two decisions",
   "then",
   "on top"
  ],
  "concept": "Independent conditions (Week 3)"
 },
 {
  "id": "cm-hard-8",
  "topicId": "loops",
  "difficulty": "hard",
  "story": "A monitoring tool reads a server log line by line and must stop at the first \"ERROR\" line, reporting how many lines it read before it.",
  "options": [
   {
    "id": "A",
    "text": "A for loop with enumerate that breaks at the first ERROR line",
    "why": "enumerate gives the line number for free and break stops at the first error."
   },
   {
    "id": "B",
    "text": "while True with a manual index counter",
    "why": "Works, but managing the index by hand invites off-by-one errors."
   },
   {
    "id": "C",
    "text": "A list comprehension that keeps only the ERROR lines",
    "why": "It reads the whole log and loses how many lines came before the first error."
   },
   {
    "id": "D",
    "text": "Recursion, one call per line",
    "why": "Logs have thousands of lines, far deeper than recursion should go."
   }
  ],
  "correct": "A",
  "reasonSignals": [
   "break",
   "enumerate",
   "stop",
   "first",
   "count",
   "index",
   "line number"
  ],
  "concept": "Loops with enumerate and break (Week 5)"
 },
 {
  "id": "cm-hard-9",
  "topicId": "lists-strings",
  "difficulty": "hard",
  "story": "A word game checks whether two words are anagrams: the same letters, each used the same number of times, in any order (\"listen\" and \"silent\").",
  "options": [
   {
    "id": "A",
    "text": "Compare the sets of letters",
    "why": "Sets ignore how many times a letter appears: \"aab\" and \"abb\" would wrongly match."
   },
   {
    "id": "B",
    "text": "Compare the sorted letters of both words",
    "why": "Sorting keeps every letter, repeats included, so equal sorted letters means the same letters the same number of times."
   },
   {
    "id": "C",
    "text": "Check each letter of one word is `in` the other",
    "why": "That also ignores repeats: \"aab\" passes against \"ab\"."
   },
   {
    "id": "D",
    "text": "Compare the lengths",
    "why": "Many different words have the same length."
   }
  ],
  "correct": "B",
  "reasonSignals": [
   "sort",
   "count",
   "same letters",
   "repeat",
   "duplicate",
   "frequenc",
   "number of times",
   "how many"
  ],
  "concept": "Sorting and counting characters (Week 6)"
 },
 {
  "id": "cm-hard-10",
  "topicId": "functions-conditionals",
  "difficulty": "hard",
  "story": "The same grading function is used by three courses, with pass marks of 40, 50 and 60. More courses may use it later.",
  "options": [
   {
    "id": "A",
    "text": "A global pass-mark variable changed before each call",
    "why": "It works until someone forgets to reset it; hidden state is fragile."
   },
   {
    "id": "B",
    "text": "Three copies of the function, one per course",
    "why": "Any fix must be made three times, and each new course needs another copy."
   },
   {
    "id": "C",
    "text": "One function with the pass mark as a parameter (default 50)",
    "why": "The rule is written once and each course passes its own mark; new courses need no code changes."
   },
   {
    "id": "D",
    "text": "An if / elif on the course name inside the function",
    "why": "Every new course means editing the function."
   }
  ],
  "correct": "C",
  "reasonSignals": [
   "parameter",
   "argument",
   "default",
   "pass in",
   "reuse",
   "one function",
   "general"
  ],
  "concept": "Function parameters (Week 2)"
 }
];
