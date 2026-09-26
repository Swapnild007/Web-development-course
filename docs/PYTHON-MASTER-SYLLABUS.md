# Python Academy: Zero to Job-Ready

A complete learning path for a learner starting with no programming knowledge. This syllabus is designed to build independent problem-solving ability and a portfolio of tested, documented Python applications.

> **Scope note:** This is the master syllabus. The existing app curriculum currently models Python as four phases with a limited set of topic entries. Integrating this expanded syllabus into the in-app reader requires mapping modules and lesson IDs to the reader's data model; this document does not claim those lessons have already been authored.

## Learning outcomes

By the end of the core program, the learner should be able to:
- Explain core programming concepts and translate requirements into working Python.
- Write readable, typed, modular code and debug it systematically.
- Process files and datasets, automate repeatable workflows, and query relational databases.
- Build, test, document, package, and deploy a database-backed API.
- Use Git, code quality tools, CI, containers, secure configuration, and basic observability.
- Deliver and explain a substantial portfolio project, including design decisions and limitations.

## How each lesson is taught

Every lesson should include prerequisites, measurable objectives, plain-language concept explanations, syntax walkthroughs, runnable examples with expected output, a worked example, guided practice, an independent exercise, common errors/debugging, a knowledge check, and references to official documentation. Practical lessons should include starter data, acceptance criteria, edge cases, and a solution review rubric. Avoid presenting code without explaining each important line.

## Stage 1 — Programming foundations

### Module 01: How programming works
1. What programming is; programs as precise instructions
2. How computers represent and execute instructions
3. Programming languages, interpreters, compilers, runtime
4. Python use cases, versions, CPython and implementation basics
5. Install Python, editor, terminal and interpreter
6. Run scripts, REPL, command-line arguments overview
7. Source files, syntax, runtime errors and tracebacks
8. print(), comments and first program
9. Reading documentation and asking precise technical questions
10. Debugging workflow: reproduce, isolate, inspect, fix, retest

**Lab:** Run a small script from the terminal, intentionally introduce a syntax error, and explain the traceback.

### Module 02: Syntax and computational thinking
1. Statements, expressions, indentation and code blocks
2. Variables, identifiers and naming conventions
3. int, float, str, bool and None
4. input(), print() and basic I/O
5. Arithmetic operators, precedence and numeric behavior
6. Comparison, Boolean logic and truthiness
7. Type conversion, type() and isinstance()
8. Strings, escape sequences and f-strings
9. Algorithm steps, pseudocode and flowcharts
10. Trace tables and breaking problems into smaller functions
11. Testing expected, boundary and invalid inputs
12. Build small programs from written requirements

**Project:** Console calculator and unit converter with input validation.

### Module 03: Decisions, loops and functions
1. if/elif/else and Boolean conditions
2. Nested conditions and simplifying logic
3. for loops, while loops and range()
4. break, continue, pass and loop else
5. Iterating over strings and sequences
6. Define and call functions; return versus print
7. Parameters, arguments and default values
8. Positional, keyword-only, *args and **kwargs
9. LEGB scope, local/global/nonlocal and lifetime
10. Pure functions and side effects
11. Recursion, base cases and iterative alternatives
12. Assertions, doctests and introductory unit tests

**Project:** Interactive attendance and overtime calculator with reusable functions.

## Stage 2 — Core Python and software design

### Module 04: Data structures and algorithmic thinking
1. String indexing, slicing and methods
2. Lists, mutation, copying and aliasing
3. Tuples and immutable sequences
4. Sets, membership and set algebra
5. Dictionaries, keys, values and safe lookup
6. Nested structures and modeling records
7. Comprehensions and readable transformations
8. Sorting, key functions and stable ordering
9. Iterables, iterators, next() and StopIteration
10. Generators and lazy evaluation
11. Big O, time/space complexity and common operations
12. Choose structures based on access, mutation and ordering needs

**Project:** In-memory employee and shift registry with search, sorting and summaries.

### Module 05: Files, errors and persistence
1. File paths and pathlib
2. Read/write text safely with context managers
3. Encoding, Unicode and newline handling
4. CSV reader/writer and DictReader/DictWriter
5. JSON serialization, parsing and schema validation
6. Exception types and exception handling
7. Raise custom exceptions; avoid swallowing failures
8. Logging levels, handlers and useful diagnostic context
9. Dates, times, time zones and datetime arithmetic
10. Environment variables and configuration files
11. Atomic writes, temporary files and safe replacement
12. Data validation, malformed rows and recovery strategies

**Project:** Multi-file CSV processor that validates input, records rejected rows, and generates a reproducible report.

### Module 06: Object-oriented and maintainable Python
1. Classes, instances, attributes and methods
2. __init__, instance state and invariants
3. Encapsulation, properties and validation
4. Inheritance, overriding and method resolution order
5. Composition and dependency injection
6. Dunder methods and Python data model
7. Dataclasses, enums and immutable data records
8. Abstract base classes and structural typing with Protocol
9. Type hints, unions, generics and narrowing
10. Modules, packages, imports and project layout
11. Clean code, cohesion, coupling and separation of concerns
12. Refactoring, code review and practical design patterns

**Project:** Library or asset management application with typed domain models, persistence abstraction and tests.

## Stage 3 — Applied Python specializations

### Module 07: Automation and scripting
1. Standard library tour: os, sys, shutil, pathlib, subprocess
2. Batch file operations and safe dry-run modes
3. Regular expressions for structured text extraction
4. Excel workbooks with openpyxl: cells, sheets, styles and formulas
5. Reliable spreadsheet templates and formula caveats
6. Generate CSV, JSON and PDF outputs
7. Email/report workflow concepts and safe credential handling
8. HTTP requests, timeouts, retries and API pagination
9. Browser automation concepts and responsible use
10. Scheduling, idempotency, checkpoints and retries
11. Logging, alerts and operational failure handling
12. Package and distribute command-line tools with argparse

**Project:** Automated reporting tool that combines multiple CSV/Excel exports, validates data, and produces a formatted management workbook.

### Module 08: Data analytics with Python
1. NumPy arrays, shape, dtype and vectorized operations
2. Pandas Series/DataFrames and indexing
3. Load Excel, CSV, JSON and database extracts
4. Data profiling, types, missing values and duplicates
5. Filtering, sorting, groupby and aggregation
6. Merge, join, concat, pivot and melt
7. Datetime parsing, time series and resampling
8. Exploratory data analysis and descriptive statistics
9. Visualize distributions and trends with Matplotlib
10. Statistical foundations: sampling, variability and uncertainty
11. Reproducible analysis, data lineage and pipeline stages
12. Export results and communicate analytical findings

**Project:** End-to-end workforce dataset analysis with documented data-quality checks, metric definitions, visualizations and a reproducible report. Never invent interval data; distinguish source facts from estimates.

### Module 09: SQL and database integration
1. Relational database concepts, tables and keys
2. SELECT, WHERE, ORDER BY and LIMIT
3. Joins, grouping, aggregates and subqueries
4. Schema design, normalization and constraints
5. SQLite and PostgreSQL connections from Python
6. Parameterized SQL and injection prevention
7. Transactions, isolation basics, commit and rollback
8. Repository/data-access patterns
9. SQLAlchemy Core and ORM fundamentals
10. Migrations, seeds and repeatable local setup
11. Indexes, EXPLAIN and query performance basics
12. Database-backed application integration and tests

**Project:** Employee/shift management database with schema, migrations, seeded sample data and tested queries.

### Module 10: Web development and APIs
1. HTTP, URLs, methods, status codes and headers
2. REST resource design and JSON contracts
3. FastAPI application structure and routing
4. Path/query parameters, request bodies and response models
5. Pydantic validation and safe error responses
6. Authentication versus authorization; session/token concepts
7. Connect API routes to PostgreSQL through a service layer
8. Async/await, event loop and when async helps
9. Pagination, filtering, rate limits, timeouts and retries
10. OpenAPI docs and API versioning
11. Unit and integration testing with pytest and test clients
12. Build and consume a complete CRUD API

**Project:** Secure task or shift-planning API with PostgreSQL, validation, authentication, tests and API documentation.

## Stage 4 — Production engineering and career capstone

### Module 11: AI and machine learning foundations
1. AI, ML, deep learning and generative AI distinctions
2. Math refresh: vectors, probability, distributions and statistics
3. Dataset preparation and feature/target concepts
4. Supervised and unsupervised learning workflows
5. scikit-learn estimators, pipelines and preprocessing
6. Regression, classification and clustering
7. Train/validation/test splits and cross-validation
8. Metrics, class imbalance, leakage and overfitting
9. Feature engineering and baseline comparisons
10. Neural network concepts and deep-learning overview
11. Hosted model APIs, prompt/data boundaries and cost awareness
12. Build an AI-enabled application with evaluation and safeguards

**Project:** Small, explainable prediction workflow using a public or synthetic dataset, with a baseline, evaluation report and limitations.

### Module 12: Professional engineering, deployment and capstone
1. Git fundamentals, branches, commits and pull requests
2. Virtual environments, dependency pins, lockfiles and pyproject.toml
3. Formatting, linting, static checks and pre-commit workflows
4. pytest fixtures, mocks, coverage and property-based testing
5. Profiling, benchmarking and optimization by evidence
6. Secure secrets, dependency hygiene, input validation and OWASP basics
7. Docker images, multi-stage builds and non-root execution
8. CI/CD pipeline: quality gates, tests, build and deployment
9. Cloud runtime configuration, database deployment and migrations
10. Structured logs, health checks, metrics and operational debugging
11. Documentation, architecture diagrams, code reviews and handover
12. Portfolio presentation, technical interview practice and capstone defense

**Capstone:** Build a Workforce Intelligence application: validated data ingestion, Python analytics, PostgreSQL persistence, FastAPI service, a usable web interface, automated reporting, tests, secure configuration, containerization, CI and deployment. Include architecture, setup, data dictionary, metric definitions, test evidence, limitations and a short demo.

## Assessment and completion standards

- **Knowledge checks:** Explain concepts in your own words and predict code behavior.
- **Coding labs:** Submit runnable code with expected output and edge-case handling.
- **Project gates:** Meet explicit acceptance criteria and demonstrate tests.
- **Code review:** Readability, modularity, typing where useful, error handling and security.
- **Capstone defense:** Explain architecture, trade-offs, test strategy, deployment and known limitations.

A module is complete only when its required practical work and assessment pass. Job readiness is not guaranteed by course completion; it also depends on independent practice, portfolio quality, communication, and the requirements of the roles being targeted.

## Recommended role pathways after the core

- **Python automation developer:** Modules 01–07, 09, 12; emphasize robust file/API workflows, scheduling and operations.
- **Data analyst / analytics engineer:** Modules 01–05, 07–09, 11; emphasize SQL, Pandas, statistics, data quality and communication.
- **Python backend developer:** Modules 01–06, 09–10, 12; emphasize API design, databases, testing, security and deployment.
- **AI/ML application developer:** Core modules plus 08, 09, 11–12; deepen mathematics, model evaluation, data pipelines and deployment.

## Suggested official references

- Python Tutorial: https://docs.python.org/3/tutorial/
- Python Library Reference: https://docs.python.org/3/library/
- Python Packaging User Guide: https://packaging.python.org/
- pytest documentation: https://docs.pytest.org/
- NumPy: https://numpy.org/doc/
- pandas: https://pandas.pydata.org/docs/
- FastAPI: https://fastapi.tiangolo.com/
- PostgreSQL: https://www.postgresql.org/docs/
- scikit-learn: https://scikit-learn.org/stable/user_guide.html
