# Python Module 01 — How Programming Works

**Module promise:** A beginner can explain how a program is a set of precise instructions, set up Python, run a saved script, recognize basic error types, and use a repeatable debugging routine.
**Audience:** Absolute beginners, no prior coding or command-line experience.
**Estimated time:** 5–7 focused hours (installation troubleshooting may add time).
**Module project:** First Run Lab Notebook: a saved Python script plus a short debugging evidence log.
**Prerequisites:** Can create and save a text file. Python setup is taught inside this module.

## Teaching design

This is an active-learning module, not a video/text dump. Use:
- **Retrieval before instruction:** short, low-stakes prompts that reveal prior assumptions.
- **Predict → run → explain:** learners commit to a predicted output, execute the code, then explain any mismatch.
- **Worked example → faded example → independent transfer:** model a complete solution, remove hints gradually, then provide a new task.
- **Frequent explanatory feedback:** explain why an answer works and diagnose common misconceptions.
- **Concrete-to-abstract sequencing:** start with familiar procedures, then introduce programming vocabulary.
- **Spaced retrieval:** revisit key ideas in later lessons and the module checkpoint.
- **Authentic practice:** each lesson contributes to a real, small project.

Lessons should be segmented into short cycles: scenario, concept, example, prediction, practice, feedback, recap. Avoid click-through gamification; reward demonstrated skills, not time-on-page.

## Lesson map

| ID | Lesson | Observable outcome | Signature activity | Time |
|---|---|---|---|---:|
| PY01-L01 | Programs are precise instructions | Describe an algorithm, improve an ambiguous task, run a first statement | Human-executable robot plan; predict/run/explain | 25 min |
| PY01-L02 | What happens when code runs? | Explain source code, interpreter, runtime, input, processing, output | Arrange run-cycle cards; trace a tiny program | 30 min |
| PY01-L03 | Languages, interpreters, compilers, runtime | Distinguish language, implementation, interpreter/compiler, runtime | Scenario sorting and misconception correction | 30 min |
| PY01-L04 | Python use cases and versions | Name common use cases and explain why version/environment matter | Match tasks to capabilities; inspect version output | 25 min |
| PY01-L05 | Set up Python, editor, terminal | Install or verify Python and editor; record version evidence | Guided OS-specific setup and recovery branches | 45–75 min |
| PY01-L06 | Run a script and use the REPL | Create and run a saved .py file; distinguish script from interactive prompt | Run the same expression in both contexts | 35 min |
| PY01-L07 | Source files, errors, tracebacks | Tell syntax and runtime errors apart; find file, line, and error clue | Error-message scavenger hunt | 35 min |
| PY01-L08 | print(), comments, readable script | Use print for visible output and comments for human notes | Reconstruct and annotate a short script | 30 min |
| PY01-L09 | Documentation and precise help requests | Find an official docs section and write a reproducible question | Documentation navigation; rewrite a vague bug report | 30 min |
| PY01-L10 | Debug systematically | Reproduce, isolate, inspect, fix, retest, and record evidence | Debugging lab notebook; project review | 45 min |

## Module project: First Run Lab Notebook

**Scenario:** Prove that your computer can run a saved Python file and that you can diagnose and correct one deliberate mistake.

**Deliverables**
- `first_run.py`: a readable script with a title comment and at least three meaningful print calls.
- `debug-log.md`: the intentional error, observed message, line/type clue, fix, and successful retest.
- A short explanation in the learner’s own words of how the saved code is executed.

**Acceptance criteria**
1. The learner runs a saved local .py file, not only a pasted snippet.
2. Output matches the stated expected output.
3. Learner identifies the relevant line and error clue.
4. Learner reruns the corrected file and records the result.
5. Explanation distinguishes the code file from the Python program executing it.

**Rubric (10 points):** environment evidence (2), correct script and output (2), error diagnosis (2), fix and retest (2), own-words explanation (2). Pass at 8/10, with script execution and retest mandatory. Remediation is targeted to the missed skill, followed by a fresh parallel task.

## Module checkpoint

A mixed, low-stakes assessment: classify code/output/error; order the run cycle; interpret a short traceback; select the next debugging action; explain one concept without copying lesson wording. Feedback points to the exact concept and lesson to revisit. Reattempts use new examples.

## Scope boundaries

This module teaches the mental model and initial workflow. It does not claim learners can yet build applications or master algorithms. Variables, input validation, decisions, loops, functions, collections, and production practices are taught later.

## Setup notes

Teach Windows, macOS, and Linux setup with copyable commands, expected outputs, and recovery paths. Include Android/Termux only as an optional route after validating current package guidance. A browser REPL may be a temporary fallback, clearly labeled as not a substitute for local setup verification. Explain commands before asking learners to run them. Provide a help template: operating system, Python version, exact command, full error text, expected behavior.
