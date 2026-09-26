# PY01-L01 — Programs Are Precise Instructions

**Module:** 01 · How Programming Works  
**Time:** 25 minutes · **Level:** Absolute beginner  
**Tools:** Paper or notes; Python installation is optional until the first-run activity.

## Mission

Imagine giving instructions to a robot that cannot guess what you mean. You say, “Make me a cup of tea.” A person fills in missing details automatically. A computer needs the steps and assumptions stated clearly.

By the end, you can:
- Explain what a program is in your own words.
- Turn a vague task into an ordered algorithm.
- Predict, run, and explain a tiny Python program.

**Success test:** Write a clear sequence for a simple task and explain why its order matters.

## 1. Quick retrieval: commit to an answer

Before reading, write a sentence for each:
1. Is “organize my desk” precise enough for a computer to execute as written? Why?
2. If a program has three steps, can changing their order change the result?

Keep your answers. You will revisit them at the end. It is okay to be unsure; this is a diagnostic, not a grade.

## 2. A computer needs explicit steps

A **program** is a set of instructions expressed in a form a computer can execute. An **algorithm** is a step-by-step plan for solving a task. The plan is the idea; a Python program is one way to express that plan in code.

### Be the robot

Task: Put a book on a shelf. Draft:
1. Pick up the book.
2. Walk to the shelf.
3. Put the book down.

What is missing? Which shelf? Where on it? What if the book is already there?

Now assume there is one book on the desk, one empty shelf directly in front of you, and you can reach both. Rewrite the steps so someone unfamiliar with your intention could follow them. One possible answer:
1. Reach toward the book on the desk.
2. Grip the book.
3. Lift it clear of the desk.
4. Move it over the empty shelf.
5. Lower it onto the shelf.
6. Release it.

**Teaching point:** Good instructions are precise enough for the situation. Stating assumptions helps define what “precise enough” means.

## 3. Order changes outcomes

Imagine writing a destination on a label and attaching it to a package. If you attach the blank label first, you may need to remove it to write on it. The sequence matters.

Programmers call instructions carried out one after another **sequence**. Later, you will learn decisions and repetition. For now, focus on one instruction, then the next.

### Predict → run → explain

Read this code. Before running it, write down the exact output, including line breaks.

~~~python
print("Pack the box")
print("Add the address label")
print("Ready to ship")
~~~

Expected output:

~~~text
Pack the box
Add the address label
Ready to ship
~~~

Why? `print()` displays the value you give it. Each call here displays a line. The statements execute from top to bottom.

**Distinction:** Code is the instruction text you write. Output is what the program displays when it runs. They are not the same thing.

## 4. First run: make the computer follow your plan

If Python is installed, open your editor, create `first_steps.py`, type the code exactly, save it, and run it using your editor or terminal.

~~~python
print("Open the workbook")
print("Find the column headings")
print("Check that the file is saved")
~~~

Expected output:

~~~text
Open the workbook
Find the column headings
Check that the file is saved
~~~

Line-by-line:
- `print` is a built-in Python function.
- Parentheses `()` contain the value passed to the function.
- Quoted text is a **string**, meaning a piece of text.
- Each line is a separate statement; Python runs them in order.

You do not need to memorize every term now. Be able to point to an instruction, the text it uses, and the output it produces.

**Not installed yet?** Complete the prediction and plan exercises now. Return to this run activity after Lesson PY01-L05, which teaches setup. Do not sign up for an unfamiliar website just to paste code.

## 5. Guided practice: repair a checklist

A coworker’s start-of-shift checklist:
1. Mark the report complete.
2. Open the report.
3. Check the date on the report.

**Diagnose:** What is wrong?
- A. Too many steps.
- B. It marks the report complete before opening and checking it.
- C. It uses words instead of numbers.

**Answer: B.** Completion is recorded before the work it is meant to confirm.

**Improve it:** Write a corrected three-step sequence. One valid answer:
1. Open the report.
2. Check that the report date is correct.
3. Mark the report complete.

**Add a condition in plain language:** What if the date is wrong? Example: “Stop and ask the report owner to correct the date before marking it complete.” This previews decision-making, which will be coded later.

## 6. Independent transfer challenge

Choose one: save a document with a clear filename; prepare a morning checklist; alphabetize three items; or make a sandwich.

Write 4–7 ordered steps and state at least one assumption or starting condition.

**Acceptance criteria**
- Each step describes one action.
- The order makes sense.
- A person unfamiliar with your intention could follow it.
- At least one assumption or starting condition is stated.

Self-check: replace vague words such as “properly,” “normally,” “quickly,” or “as needed” with an observable action or a clear rule. Different answers can be valid if they meet the criteria.

## 7. Knowledge check with feedback

**1. Which best describes an algorithm?**
A. A computer brand · B. A step-by-step plan · C. Text displayed by a program · D. An installation file  
**Correct: B.** An algorithm is a plan or procedure. It can be written in everyday language, a diagram, or code.

**2. What is displayed?**
~~~python
print("One")
print("Two")
~~~
A. OneTwo on one line · B. Two then One · C. One then Two, each on its own line · D. Nothing  
**Correct: C.** The statements run in order. Each print call ends its displayed line by default.

**3. Why can a vague instruction cause trouble?**
A. Computers dislike long sentences · B. The computer may lack precise information to determine the intended action · C. Computers run instructions in reverse · D. Programs can contain only one instruction  
**Correct: B.** Unclear requirements force guesswork and can produce results different from what the person intended.

**4. Code and output mean the same thing. True or false?**  
**Correct: False.** Code is the instruction text. Output is what appears when the program executes. A program can also run without displaying output.

## 8. Retrieval recap and exit ticket

Without scrolling up, complete these in your own words:
1. A program is…
2. An algorithm is…
3. `print("Hello")` is an instruction that…
4. Order matters because…

Revisit your opening answers and add one correction or refinement.

**One-minute exit ticket:** Explain why “make the report good” is not a useful computer instruction yet. Give one more precise version.

**Next:** Lesson PY01-L02 traces what happens between saving source code and seeing program output.

## Learner-facing help prompt

If your script does not run, record:
- Your operating system and Python version (if known).
- The exact command or editor action you used.
- The complete error text, not just “it failed.”
- What you expected and what happened instead.

This turns a vague help request into a reproducible problem another person can investigate.

## Instructor/reviewer notes

- Accept different wording when the sequence is clear and consistent with the stated assumptions.
- If algorithm and program are confused, show the same plan first in plain-language steps, then as Python statements.
- If learners think `print()` saves a file, distinguish displaying text from file input/output, taught later.
- Provide a non-digital option for the robot activity.
- Keep this first syntax exposure small; do not introduce variables, input, loops, or branching here.
