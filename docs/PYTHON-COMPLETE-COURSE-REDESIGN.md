# Python Complete Guide — Curriculum Redesign

## Product promise

This course is intended to be the learner's primary and self-contained study resource: start with no programming experience, learn Python from first principles, and build, test, document, and deploy practical applications. Learners should not need to leave the course to understand a lesson, complete its exercises, or proceed to the next module.

External documentation may be offered as optional further reading or a way to verify version-sensitive details. It must never be required to understand a core concept, finish an assignment, or pass an assessment. The course itself must include explanations, examples, setup steps, reference material, answer keys, and project assets.

“Complete” means the course covers the stated learning outcomes with authored teaching material and assessment. It does not mean a learner is guaranteed employment; independent practice and role-specific hiring requirements still matter.

## Course shape

Use four phases as learner milestones, not as a limit of four lessons. Each phase contains four modules (16 modules total). Each module is broken into short lessons and labs. Keep the app's phase navigation readable by showing module names and lesson counts, then show lessons inside a selected module. Do not flatten every subtopic into one huge page.

Target 8–12 lessons per module, with a few longer project labs. Lesson counts are a planning target, not a substitute for authored quality. Each module must have an explicit prerequisite, outcomes, lesson sequence, assessment, and completion gate.

## Teaching standard: required for every lesson

1. **Why it matters:** a concrete everyday or workplace problem, stated before syntax.
2. **Prerequisite check:** brief recall or a clear statement that no prior knowledge is assumed.
3. **Concept explanation:** plain language, correct terminology, diagrams or analogies where useful, and a precise explanation of where the analogy stops.
4. **Syntax walkthrough:** introduce one new construct at a time; explain punctuation, indentation, names, values, and execution order line by line.
5. **Runnable example:** complete code, how to run it in the course environment, and exact expected output. Explain each important line.
6. **Predict–run–explain:** ask the learner to predict behavior before revealing output, then explain discrepancies.
7. **Guided practice:** scaffolded tasks with hints that can be revealed progressively.
8. **Independent practice:** at least one task requiring a small variation or new solution, not merely copying.
9. **Worked solution:** complete answer with reasoning, common alternative approaches, and why the chosen solution meets the requirements.
10. **Debug clinic:** likely beginner mistakes, exact symptoms, diagnosis steps, and corrected examples.
11. **Knowledge check:** questions with answer explanations, not just a score.
12. **Recap and glossary:** concise summary, key terms, and links to earlier concepts.
13. **Accessibility and offline completeness:** code and essential explanation must be readable without relying on an external video, link, or image.

For every practical assignment include requirements, starter files/data where needed, expected behavior, sample input/output, edge cases, acceptance criteria, solution walkthrough, and a rubric. Use synthetic, clearly labeled sample data when real data is not required. Never place credentials or private information in examples.

## Phase 1 — Start from zero: thinking, setup, and complete beginner syntax

**Outcome:** Learner can explain how a program runs and independently write small console programs using core Python syntax, decisions, loops, collections, and simple functions.

### Module 01 — What programming is and how to work with Python
- Instructions, algorithms, decomposition, input–process–output, tracing by hand
- What code is; source files, editor, terminal, interpreter, runtime, script and REPL
- Python 3, CPython, version checking, installation and first-run verification across Windows, macOS, and Linux
- Running a saved file, current working directory, command arguments at an introductory level
- Syntax errors vs runtime errors; read a traceback; systematic debugging
- How to use the course's built-in help, glossary, and reference cards
- Lab: write and run a tiny program; deliberately break and repair it

### Module 02 — Core syntax, values, variables, and input/output
- Python statements and expressions, indentation, code blocks, comments, line continuation basics
- Identifiers, naming conventions, assignment, rebinding, constants by convention
- Integers, floats, strings, booleans, None; type inspection and conversion
- print(), input(), separators, end, basic formatting and f-strings
- Arithmetic operators, precedence, division, floor division, modulo, exponentiation
- Comparisons, Boolean operators, truthiness, identity vs equality, membership overview
- Strings: quotes, escapes, newline, indexing, slicing, common methods, immutability
- Reading error messages for common type, name, and syntax mistakes
- Lab: interactive calculator and unit converter with validation and expected outputs

### Module 03 — Decisions, repetition, and control flow
- if / elif / else, nested decisions, compound conditions, truth tables and guard clauses
- for loops, while loops, range(), iteration protocol at an introductory level
- break, continue, pass, loop else (with careful explanation of its less-common use)
- Accumulators, counters, sentinel loops, input loops, avoiding infinite loops
- Nested loops, tracing loop state, choosing loop boundaries
- Common errors: off-by-one, wrong indentation, never-updated condition, accidental assignment assumptions
- Lab: menu-driven quiz and score tracker

### Module 04 — Collections and beginner problem-solving patterns
- Lists, indexing, slicing, append/extend/insert/remove/pop, mutation and copying
- Tuples and unpacking; sets and uniqueness; dictionaries and key/value lookup
- Nested collections, iteration over values/items, membership, safe dictionary access
- Comprehensions for list/set/dict after equivalent loop versions are understood
- Sorting, key functions, min/max/sum/len, enumerate and zip
- Choosing a collection for a task; common aliasing and mutability bugs
- Introductory functions: def, call, parameters, arguments, return, default values, docstrings and simple scope
- Lab: build a small contact/expense/attendance tracker using in-memory data

**Phase 1 gate:** closed-book concept check, a syntax-reading task, and a small console application built from written requirements. Learner must explain their code and handle normal, boundary, and invalid inputs.

## Phase 2 — Write maintainable Python and work with real data

**Outcome:** Learner can structure a program into modules, persist and validate data, handle failures, and test code.

### Module 05 — Functions and reusable program design
- Function contracts, parameters, positional/keyword arguments, return values
- Default parameters, keyword-only parameters, *args and **kwargs with use cases
- Local/global/nonlocal scope and lifetime; avoid unnecessary global state
- Pure functions, side effects, decomposition, cohesion and coupling
- Recursion, base cases, stack behavior, iterative alternatives
- Type hints, annotations, docstrings and readable APIs
- Lab: refactor a single-file program into tested reusable functions

### Module 06 — Files, formats, errors, and persistence
- Paths and pathlib; text files, encodings, context managers and safe writes
- CSV and JSON reading/writing, serialization, schema checks and malformed data
- Exceptions, try/except/else/finally, raising errors, custom exceptions
- Logging, useful diagnostics, recovery vs fail-fast behavior
- Dates, times, time zones and reliable parsing
- Environment variables and configuration without secrets in source
- Lab: resilient file-processing tool with rejected-row report and logs

### Module 07 — Object-oriented Python and project structure
- Classes, instances, attributes, methods, initialization and invariants
- Encapsulation, properties, class/static methods, composition vs inheritance
- Inheritance, overriding, MRO and when not to use inheritance
- Data model and common dunder methods; dataclasses and enums
- Modules, packages, imports, main guard, project layout
- Type hints deeper: unions, generics, protocols, static checking and limits
- Refactoring, code review, naming, separation of concerns and design trade-offs
- Lab: typed library or asset management application with persistence boundary

### Module 08 — Testing, debugging, Git, and developer workflow
- Test cases, expected/actual results, unit vs integration tests
- pytest basics, assertions, fixtures, parametrization, mocking and coverage concepts
- Edge cases, regression tests, property-based testing introduction
- Debugger, breakpoints, stack traces, logging and minimal reproducible examples
- Git concepts, repository, status, diff, add, commit, branches and conflict resolution
- Formatting, linting, type checks, dependency isolation and reproducible setup
- Lab: add tests and Git history to a previously built application

**Phase 2 gate:** a multi-file application with validated persistence, meaningful tests, a clear README, and reproducible setup instructions. Learner must diagnose a seeded bug and demonstrate a regression test.

## Phase 3 — Apply Python to automation, analytics, databases, and APIs

**Outcome:** Learner can choose a practical application path and build integrations with reliable data handling.

### Module 09 — Automation and command-line applications
- Standard library orientation: pathlib, os, sys, shutil, subprocess, argparse
- Safe batch file operations, dry-run, backups, idempotency and checkpoints
- Regular expressions with readable patterns and testing
- Spreadsheet processing: workbook/sheet/cell concepts, formulas, styles, limitations
- HTTP and APIs: requests concepts, methods, headers, JSON, timeouts, retries, pagination
- Scheduling, structured logs, failure notifications and responsible automation
- Lab: automated recurring report generator from supplied CSV/Excel exports

### Module 10 — Data analysis with Python
- Data workflow and data dictionary; NumPy arrays, shape, dtype and vectorization
- Pandas Series/DataFrames, import/export, indexing and selection
- Profiling, missing values, duplicates, type conversion and data validation
- Filtering, sorting, groupby, aggregation, merge/join, pivot and reshape
- Datetime parsing, time series and resampling
- Descriptive statistics, sampling, variability, uncertainty and misleading summaries
- Visualization principles and Matplotlib charts; labels, units and interpretation
- Reproducible analysis, data lineage, report writing and communicating limitations
- Lab: complete analysis of included synthetic workforce/operations dataset

### Module 11 — SQL and databases from Python
- Tables, rows, columns, primary/foreign keys, constraints and relational modeling
- SQL SELECT, filtering, ordering, aggregation, grouping, joins and subqueries
- Normalization, indexes and basic query plans/performance
- SQLite for local learning; PostgreSQL concepts and environment setup
- Python database connections, parameterized queries and SQL injection prevention
- Transactions, commit/rollback, isolation basics and data integrity
- Migrations, seed data, repository/data-access patterns, SQLAlchemy foundations
- Lab: database-backed scheduling/records system with tested queries

### Module 12 — Web services and APIs with Python
- Web foundations: client/server, HTTP, URLs, methods, status codes, headers, JSON
- REST resources, request/response contracts, validation and error design
- FastAPI app structure, routes, path/query/body parameters, response models
- Pydantic models and input validation; dependency injection
- Connect routes to database through service/data layers
- Authentication vs authorization, safe password handling and token/session concepts
- Async basics, event loop, blocking work and when async is appropriate
- Pagination, filtering, rate limits, timeouts, retries and API documentation
- Unit/integration tests and API test clients
- Lab: tested CRUD API with database, validation and OpenAPI docs

**Phase 3 gate:** one chosen practical project (automation, analytics, database or API) with acceptance tests, documentation, realistic failure handling, and a demo. The course supplies all sample inputs and setup guidance.

## Phase 4 — Production readiness, specialization, and capstone

**Outcome:** Learner can deliver a maintainable application, explain engineering choices, and present credible portfolio evidence.

### Module 13 — Advanced Python language and runtime
- Iterables, iterators, generators, yield and lazy evaluation
- Decorators, closures and practical function wrapping
- Context managers and resource lifetime
- Functional tools, higher-order functions and readable transformations
- Concurrency concepts: threads, processes, asyncio, tasks and cancellation
- Race conditions, locks, queues, bounded concurrency and safe shared state
- Memory model, references, garbage collection and CPython/GIL overview
- Profiling and optimization based on measurement; algorithmic complexity
- Lab: stream and process a large input safely; compare approaches

### Module 14 — Packaging, security, deployment, and operations
- Virtual environments, dependency management, lockfiles, pyproject.toml
- Build and distribute packages/CLI tools; semantic versioning and release basics
- Secure coding: validation, least privilege, secrets, dependency hygiene and common web risks
- Docker concepts, images, containers, environment configuration and non-root execution
- CI workflows: automated tests, lint/type checks, build and deployment gates
- Deployment architecture, database migrations, backups and rollback thinking
- Observability: structured logs, health checks, metrics and incident triage
- Lab: package and containerize an application; deploy using a documented provider-neutral workflow

### Module 15 — Applied specialization and interview preparation
- Select a pathway: backend/API, automation, data analytics, or AI/ML application development
- Role-specific tool and architecture patterns, with transparent prerequisites
- AI/ML literacy: data splits, leakage, baseline models, evaluation, limits and responsible use
- Technical problem solving: arrays/strings, hash maps, sorting/searching, complexity and test-first reasoning
- Code reading, debugging interview, system design fundamentals and explaining trade-offs
- Resume/portfolio evidence, project walkthrough and behavioral examples
- Lab: pathway-specific mini-project plus mock technical review

### Module 16 — Integrated capstone: plan, build, verify, present
- Requirements, user stories, constraints, data definitions and acceptance criteria
- Architecture, repository layout, schema/API design and threat/risk checklist
- Iterative implementation with version control and review checkpoints
- Automated tests, seeded defects, edge-case validation and quality gates
- Deployment, configuration, logging, health checks and operational runbook
- Documentation: setup, architecture diagram, data dictionary, API examples, limitations
- Demo rehearsal, code walkthrough, retrospective and next-step learning plan

**Capstone:** build a complete workforce or operations intelligence application using an appropriate subset of the course stack: ingestion, validation, Python processing, persistence, API and a usable interface, tests, secure configuration, deployment and documentation. The assignment must include a synthetic dataset, detailed brief, starter scaffold, milestones, acceptance tests, reference solution, rubric and presentation checklist.

## Self-contained course assets and reference system

The platform must provide these internally:
- Beginner glossary with cross-links and plain-language definitions.
- Searchable syntax handbook, organized by concept, with runnable examples and “when to use / avoid” notes.
- Complete setup guides for Windows, macOS and Linux, including terminal basics and troubleshooting.
- Built-in code examples with expected output and step-by-step explanation.
- Exercise hints, full worked solutions and rubrics; solutions should be hidden until requested.
- Downloadable or in-platform synthetic datasets, starter repositories/files, schemas and expected output artifacts.
- Project checklists, test cases, debugging playbook and README templates.
- Version notes identifying the Python and major library versions used in course examples. Teach stable core language first and label version-specific behavior.
- Optional external references for verification and further exploration only. The core lesson must remain complete if the learner never opens them.

## Quality gates before marking any module complete

A module is **not ready to publish** until:
1. Every listed lesson has authored content, not only a title or placeholder.
2. Every code example has been executed in the target environment and its output checked.
3. Every exercise has a clear prompt, input/output expectations, and a worked solution or rubric.
4. Prerequisite links, next/previous navigation, progress and completion state work in the LMS.
5. Content is reviewed for beginner comprehension, accuracy, accessibility and mobile readability.
6. The phase-level assessment checks application, not only recall.
7. The module does not require an external link to understand or finish the material.

Maintain a visible status per module: **Planned → Drafted → Code-checked → Reviewed → Published**. Do not describe the whole course as complete until all required modules pass these gates and the full learner journey has been smoke-tested.
