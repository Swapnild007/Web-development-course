# Python Academy: Zero to Job-Ready

A complete learning syllabus for learners starting with no programming experience. This document is the master curriculum plan; the interactive course should author and wire each lesson before marking it complete.

## Outcomes

By the end, learners should be able to:
- Explain core programming concepts and solve unfamiliar problems with Python.
- Write maintainable, typed, tested Python packages and command-line tools.
- Automate file, spreadsheet, reporting, and API workflows safely.
- Clean, analyze, visualize, and persist data using Pandas, NumPy, SQL, and PostgreSQL.
- Build and test a database-backed REST API.
- Package, containerize, deploy, monitor, and document an application.
- Present a portfolio capstone and explain design choices, limitations, and test evidence.

## Learning design

Each lesson includes prerequisites, measurable objectives, a plain-language explanation, syntax walkthrough, runnable examples with expected output, guided practice, independent challenge, debugging task, knowledge check, references, and a practical submission criterion. Projects progress cumulatively. Use synthetic or properly anonymized data in exercises.

## Stage 1 — Beginner: computational thinking and Python essentials

### Module 01 — How computers and programs work
1. What programming is; programs as precise instructions
2. Hardware, operating systems, files, processes, and memory at a beginner level
3. Programming languages, interpreters, compilers, and Python's execution model
4. Installing Python, editor/IDE, terminal, and checking versions
5. Running scripts, REPL, arguments, and working directory
6. Syntax, indentation, comments, tracebacks, and help/documentation
7. First program: print, literals, and simple expressions
8. Computational thinking: inputs, outputs, constraints, decomposition
**Lab:** environment setup, run and modify a small script; explain a deliberately broken program.

### Module 02 — Values, variables, expressions, and input/output
1. Names, assignment, objects, identity, and references
2. int, float, str, bool, None, and type()
3. Arithmetic, comparison, Boolean logic, precedence
4. Conversion, rounding, numeric precision, and Decimal for money
5. Strings, indexing, slicing, methods, and Unicode basics
6. f-strings and readable output
7. input(), parsing, and validation
8. Truthiness and common type errors
9. Comments, naming, and basic style
**Project:** interactive calculator and call-volume summary with input validation.

### Module 03 — Decisions, loops, and functions
1. if/elif/else and compound conditions
2. for/while, range, enumerate, and zip
3. break, continue, loop else, and nested loops
4. Function definition, call, parameters, arguments, return
5. Positional-only, keyword-only, defaults, *args, **kwargs
6. Scope, LEGB, local/global/nonlocal, and side effects
7. Docstrings and function contracts
8. Decomposition, helper functions, and simple recursion
9. Assertions and manual test cases
**Project:** attendance and overtime calculator with reusable functions and boundary-case tests.

## Stage 2 — Core Python and software construction

### Module 04 — Collections and algorithmic thinking
1. Lists: creation, indexing, slicing, mutation, copying
2. Tuples and unpacking
3. Dictionaries, keys, values, and safe lookup
4. Sets and membership
5. Nested structures and choosing the right collection
6. Comprehensions and generator expressions
7. Sorting, key functions, and stable ordering
8. Iterables, iterators, next(), and StopIteration
9. Big-O intuition; time/space trade-offs and common operations
10. Common traps: aliasing, mutable defaults, modifying while iterating
**Project:** command-line task/employee records manager with search, sort, and summary views.

### Module 05 — Files, data formats, errors, and logging
1. Paths, pathlib, directories, and file modes
2. Context managers and safe resource cleanup
3. Text files, encodings, newline handling
4. CSV with csv module; headers, quoting, malformed rows
5. JSON serialization, decoding, and schema assumptions
6. Exceptions: catch narrowly, raise, chain, custom exceptions
7. Logging levels, structured context, and useful diagnostics
8. Dates, times, time zones, and ISO-8601
9. Configuration and environment variables; never commit secrets
10. Atomic writes, backups, and recoverable batch processing
**Project:** robust multi-file report processor with validation, logs, error summary, and repeatable output.

### Module 06 — Modules, OOP, typing, and maintainability
1. Imports, modules, packages, __name__ == "__main__
2. Classes, instances, attributes, methods, and constructors
3. Encapsulation, properties, and invariants
4. Composition, inheritance, polymorphism, and when not to inherit
5. Dunder methods, equality, hashing, and representation
6. Dataclasses, enums, and abstract base classes
7. Type hints, unions, generics, Protocol, and mypy/pyright basics
8. Functional patterns, pure functions, and dependency injection
9. Refactoring, separation of concerns, and readable design
10. Packaging layout and public interfaces
**Project:** typed library-management package with persistence adapter and documented API.

## Stage 3 — Applied Python for work

### Module 07 — Automation and scripting
1. Standard library tour: pathlib, shutil, csv, json, argparse, subprocess
2. CLI design, arguments, exit codes, and help text
3. Batch file operations and safe naming
4. Regular expressions and when simpler string methods are better
5. Excel workbooks with openpyxl: sheets, formulas, styles, tables
6. Formula preservation, recalculation caveats, and workbook testing
7. PDF/report generation and output validation
8. HTTP requests, timeouts, retries, status codes, and pagination
9. Email/report automation with secure credentials and provider rules
10. Scheduling, idempotency, checkpoints, and duplicate prevention
11. Browser automation fundamentals and responsible use
12. Packaging and distributing internal tools
**Project:** scheduled reporting utility that ingests CSV exports, validates data, produces a formatted workbook, and logs failures.

### Module 08 — Data analysis with NumPy, Pandas, and visualization
1. Arrays, vectorization, shapes, dtypes, and broadcasting
2. Series/DataFrame mental model and indexing
3. Importing CSV, Excel, JSON; explicit data types
4. Data profiling, missing values, duplicates, and validation
5. Filtering, sorting, groupby, aggregation, and pivot tables
6. Merge/join/concat and relational data pitfalls
7. Reshaping, categorical data, and efficient operations
8. Dates, time series, resampling, and time-zone handling
9. Descriptive statistics, distributions, sampling, and uncertainty
10. Matplotlib charts: choosing appropriate visual encodings
11. Reproducible notebooks versus production scripts
12. Exporting reports and documenting assumptions
**Project:** workforce analytics using interval-level sample data, including data-quality checks, SLA/ASA/AHT definitions, trend charts, and a written interpretation. Never fabricate interval observations; label estimates distinctly.

### Module 09 — SQL and database programming
1. Relational concepts, tables, keys, constraints, and normalization
2. SELECT, WHERE, ORDER BY, LIMIT, and NULL semantics
3. Aggregation, GROUP BY, HAVING, joins, and subqueries
4. CTEs, window functions, and date queries
5. Schema design, indexes, and query plans
6. SQLite from Python and database-API basics
7. PostgreSQL connection and parameterized queries
8. Transactions, isolation, rollback, and consistency
9. SQLAlchemy Core/ORM and session lifecycle
10. Migrations, seed data, and repeatable setup
11. Connection pooling, N+1 queries, and performance basics
12. Data access layer and repository testing
**Project:** PostgreSQL-backed workforce/shift records with migrations, constraints, safe queries, and tests.

### Module 10 — Backend development and APIs
1. HTTP request/response, methods, status codes, headers, JSON
2. REST resource modeling, validation, pagination, filtering
3. FastAPI routes, dependency injection, and OpenAPI docs
4. Pydantic models and validation of untrusted input
5. Database integration and transaction boundaries
6. Authentication versus authorization; password handling
7. Role-based access and owner/tenant-scoped authorization
8. Error handling, safe responses, and API versioning
9. Async/await, event loop, and choosing sync versus async
10. External API clients, timeouts, retries, and rate limits
11. Unit/integration tests and API contract checks
12. Security: injection, CORS, CSRF context, secrets, dependency risks
**Project:** tested API with authentication, PostgreSQL, CRUD, authorization, OpenAPI docs, and deployment-ready configuration.

## Stage 4 — Production engineering and career portfolio

### Module 11 — Testing, engineering workflow, and deployment
1. Git fundamentals, branching, commits, pull requests, and conflict resolution
2. Virtual environments, pip, uv/Poetry concepts, lockfiles, pyproject.toml
3. Formatting, linting, type checking, and pre-commit checks
4. pytest: fixtures, parametrization, mocks, and coverage
5. Property-based testing with Hypothesis and edge-case design
6. Debugging, profiling, memory basics, and performance measurement
7. Secure configuration, secret management, dependency updates
8. Docker images, multi-stage builds, non-root users, and volumes
9. CI/CD with GitHub Actions: test, build, publish, deploy gates
10. Cloud deployment fundamentals, TLS, runtime config, and migrations
11. Observability: logs, metrics, health checks, alerts, incident notes
12. Documentation, architecture decisions, code review, and handover
**Project:** containerize and deploy the API; establish automated checks, migration workflow, health checks, and operations guide.

### Module 12 — AI/ML foundations and final capstone
1. AI/ML terminology, realistic use cases, and limitations
2. Required math: vectors, probability, distributions, and evaluation metrics
3. Dataset preparation, leakage prevention, and train/validation/test splits
4. scikit-learn pipelines and preprocessing
5. Regression and classification baselines
6. Clustering, feature engineering, and model evaluation
7. Overfitting, cross-validation, imbalance, and explainability basics
8. Model persistence and inference API patterns
9. Neural network concepts and introductory deep learning
10. Using hosted model APIs responsibly, including cost, privacy, and validation
11. Capstone planning, milestones, test strategy, and technical presentation
12. Portfolio walkthrough, interview practice, and improvement plan
**Capstone:** build a production-style Workforce Intelligence application: import validated source data, persist it in PostgreSQL, calculate documented metrics, expose a FastAPI service, provide a usable interface, automate a report, and ship tests, containerization, CI, deployment notes, monitoring, and a clear README. Optional extension: forecasting or AI-generated metric explanations, with human verification and explicit uncertainty.

## Assessment and completion gates

- Each module ends with a practical artifact and a review rubric covering correctness, edge cases, readability, tests, and explanation.
- Require passing knowledge checks and independent exercises before unlocking the next module; allow retries with feedback.
- Stage gates: (1) solve a new small problem unaided; (2) build a multi-file package with tests; (3) deliver a useful automation/data/API project; (4) deploy and explain a capstone.
- Portfolio must contain at least three polished projects, setup instructions, sample data, tests, screenshots or demo, and a concise explanation of trade-offs.
- Job readiness is demonstrated through independent work and review, not course completion alone.

## Suggested pacing

Plan approximately 600–900 focused hours for the core track, adjusted to learner pace and prior experience. A 8-hour/week schedule is roughly 17–26 months; this is a planning estimate, not a promise. Specialization depth and job-search preparation may add time.

## Reference documentation

- Python tutorial: https://docs.python.org/3/tutorial/
- Python library reference: https://docs.python.org/3/library/
- Python Packaging User Guide: https://packaging.python.org/
- pytest: https://docs.pytest.org/
- NumPy: https://numpy.org/doc/
- pandas: https://pandas.pydata.org/docs/
- Matplotlib: https://matplotlib.org/stable/
- PostgreSQL: https://www.postgresql.org/docs/
- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/
- scikit-learn: https://scikit-learn.org/stable/user_guide.html
- Git: https://git-scm.com/doc
- Docker: https://docs.docker.com/
