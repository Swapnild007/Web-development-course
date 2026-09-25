"use strict";

const trackRoot = document.querySelector("#tracks");
const searchInput = document.querySelector("#search");
const dialog = document.querySelector("#phase-page");
const title = document.querySelector("#dialog-title");
const description = document.querySelector("#dialog-description");
const phaseList = document.querySelector("#phase-list");
const phaseStudy = document.querySelector("#phase-study");
const studyTitle = document.querySelector("#study-phase-title");
const studyDescription = document.querySelector("#study-phase-description");
const studyTopics = document.querySelector("#study-topics");
const studyProject = document.querySelector("#study-project");
const studyCheckpoints = document.querySelector("#study-checkpoints");
const lessonReader = document.querySelector("#lesson-reader");
let lessonNotes = document.querySelector("#lesson-notes");
let lessonFeedback = document.querySelector("#lesson-feedback");
let saveLessonNotesButton = document.querySelector("#save-lesson-notes");
let completeLessonButton = document.querySelector("#complete-lesson");
const lessonKey = "learning-studio.lesson.fullstack.phase1";
const notesKey = lessonKey + ".notes";
const trackCount = document.querySelector("#track-count");
const views = [...document.querySelectorAll(".view")];
const navButtons = [...document.querySelectorAll(".nav-item")];

let tracks = [];

function showView(viewName) {
  const viewIds = {
    learn: "learn-view",
    curriculum: "curriculum-view",
    progress: "progress-view",
    profile: "profile-view",
    phase: "phase-page",
    lesson: "lesson-view"
  };
  const targetId = viewIds[viewName];
  if (!targetId) return;
  const navViewName = (viewName === "phase" || viewName === "lesson") ? "curriculum" : viewName;
  views.forEach(view => {
    const isActive = view.id === targetId;
    view.hidden = !isActive;
    view.classList.toggle("active", isActive);
  });
  navButtons.forEach(button => {
    const isActive = button.dataset.view === navViewName;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  window.scrollTo({ top: 0, behavior: "auto" });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});
document.querySelector("#browse-curriculum").addEventListener("click", () => showView("curriculum"));
document.querySelector("#home-link").addEventListener("click", event => {
  event.preventDefault();
  showView("learn");
});
document.querySelectorAll("[data-view].secondary-action").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

function makeElement(tag, className, textContent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}


// Create lesson controls in JavaScript so the reader works even when the
// HTML shell only provides an empty lesson-reader container.
if (!lessonNotes) {
  lessonNotes = makeElement("textarea", "");
  lessonNotes.id = "lesson-notes";
  lessonNotes.rows = 5;
  lessonNotes.placeholder = "Write your notes for this lesson…";
}
if (!lessonFeedback) {
  lessonFeedback = makeElement("p", "lesson-feedback");
  lessonFeedback.id = "lesson-feedback";
  lessonFeedback.setAttribute("aria-live", "polite");
}
if (!saveLessonNotesButton) {
  saveLessonNotesButton = makeElement("button", "secondary-action", "Save notes");
  saveLessonNotesButton.id = "save-lesson-notes";
  saveLessonNotesButton.type = "button";
}
if (!completeLessonButton) {
  completeLessonButton = makeElement("button", "phase-start-action", "Mark lesson complete");
  completeLessonButton.id = "complete-lesson";
  completeLessonButton.type = "button";
}

function renderTracks(filter = "") {
  const query = filter.trim().toLowerCase();
  const visibleTracks = tracks.filter(track => {
    const searchableText = [
      track.name,
      track.description,
      ...track.phases.flatMap(phase => [
        phase.title,
        ...phase.topics,
        phase.project,
        ...phase.checkpoints
      ])
    ].join(" ").toLowerCase();
    return searchableText.includes(query);
  });

  trackCount.textContent = `${visibleTracks.length} ${visibleTracks.length === 1 ? "track" : "tracks"}`;
  trackRoot.replaceChildren();

  if (visibleTracks.length === 0) {
    trackRoot.append(makeElement("p", "muted", "No matching tracks. Try another search."));
    return;
  }

  visibleTracks.forEach(track => {
    const card = makeElement("article", "track-card");
    card.style.setProperty("--accent", track.accent);
    card.style.setProperty("--tint", track.tint);
    const top = makeElement("div", "card-top");
    top.append(
      makeElement("span", "track-icon", track.icon),
      makeElement("span", "phase-count", `${track.phases.length} PHASES`)
    );
    const heading = makeElement("h3", "", track.name);
    const copy = makeElement("p", "", track.description);
    const bottom = makeElement("div", "card-bottom");
    bottom.append(makeElement("span", "", "Beginner to advanced"));
    const button = makeElement("button", "open-track", "View roadmap →");
    button.type = "button";
    button.setAttribute("aria-label", `View ${track.name} roadmap`);
    button.addEventListener("click", () => openRoadmap(track));
    bottom.append(button);
    card.append(top, heading, copy, bottom);
    trackRoot.append(card);
  });
}

function appendBulletList(parent, headingText, entries) {
  const heading = makeElement("h4", "detail-heading", headingText);
  const list = makeElement("ul", "detail-list");
  entries.forEach(entry => list.append(makeElement("li", "", entry)));
  parent.append(heading, list);
}

function openRoadmap(track) {
  const roadmapBack = document.querySelector("#back-to-curriculum");
  if (roadmapBack) roadmapBack.hidden = false;
  title.textContent = track.name;
  description.textContent = track.description;
  phaseList.hidden = false;
  phaseStudy.hidden = true;
  lessonReader.hidden = true;
  phaseList.replaceChildren();

  track.phases.forEach((phase, index) => {
    const details = makeElement("details", "phase-detail");
    if (index === 0) details.open = true;
    const summary = makeElement("summary", "phase-summary");
    const number = makeElement("span", "phase-number", String(index + 1).padStart(2, "0"));
    const summaryText = makeElement("span", "phase-summary-text");
    summaryText.append(
      makeElement("strong", "", phase.title),
      makeElement("small", "", `${phase.topics.length} syllabus topic groups · project · checkpoints`)
    );
    summary.append(number, summaryText, makeElement("span", "phase-chevron", "⌄"));
    const content = makeElement("div", "phase-content");
    appendBulletList(content, "Topics covered", phase.topics);
    const project = makeElement("section", "project-block");
    project.append(makeElement("h4", "detail-heading", "Applied project"));
    project.append(makeElement("p", "project-copy", phase.project));
    content.append(project);
    appendBulletList(content, "Knowledge checkpoints", phase.checkpoints);
    const startButton = makeElement("button", "phase-start-action", index === 0 ? "Start Phase →" : `Open Phase ${index + 1} →`);
    startButton.type = "button";
    startButton.addEventListener("click", () => openPhaseStudy(track, phase, index));
    content.append(startButton);
    details.append(summary, content);
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      phaseList.querySelectorAll(".phase-detail[open]").forEach(other => {
        if (other !== details) other.open = false;
      });
    });
    phaseList.append(details);
  });

  if (track.id === "powerbi") {
    phaseList.prepend(makeElement("p", "sequence-note", "Learning sequence: " + getSequenceNote()));
  }
  phaseList.scrollTop = 0;
  showView("phase");
}

const guidedLessons = {
  0: {
    title: "Semantic HTML and accessible structure",
    lead: "Give page content meaning first, then use CSS to control its appearance.",
    sections: [
      ["What semantic HTML means", "Semantic elements communicate the role of content to browsers, assistive technology, and other developers. Use header for introductory content, nav for navigation, main for the page’s primary content, article for a self-contained item, and footer for closing information."],
      ["Build a useful outline", "Use one main landmark for the page’s central content. Give sections meaningful headings in a logical hierarchy. Choose an element for its meaning, not because its default appearance happens to look right."],
      ["Make controls accessible", "Associate each form control with a visible label. Give links descriptive text that makes sense out of context. Ensure keyboard users can reach interactive controls and see a clear focus indicator."]
    ],
    code: '<header>\\n  <h1>Field Notes</h1>\\n</header>\\n<nav aria-label="Main">\\n  <a href="#articles">Articles</a>\\n</nav>\\n<main id="articles">\\n  <article>\\n    <h2>First article</h2>\\n    <p>A short introduction.</p>\\n  </article>\\n</main>',
    practice: "Sketch an article page with a site header, navigation, main region, and one article. Select semantic elements and explain the purpose of each."
  },
  1: {
    title: "CSS layout: box model, Flexbox and Grid",
    lead: "Understand how an element’s size is calculated and choose a layout system based on the relationship between items.",
    sections: [
      ["The box model", "Every element is laid out as content, padding, border, and margin. With the default content-box sizing, declared width applies to content only. A common project-wide rule is box-sizing: border-box, so declared width includes padding and border."],
      ["Flexbox for one-dimensional layout", "Flexbox arranges items along a main axis and a cross axis. Use it for a row of controls, a navigation bar, or a simple stack. Set gap for consistent spacing and allow items to wrap when the available width is narrow."],
      ["Grid for two-dimensional layout", "CSS Grid defines rows and columns together, making it useful for card galleries and page regions. minmax(0, 1fr) lets a track shrink below its min-content size; min-width: 0 can prevent long content from forcing a flex or grid child wider than its container."],
      ["Responsive thinking", "Start with a layout that works in a narrow viewport, then add breakpoints when the content needs them. Prefer flexible tracks such as repeat(auto-fit, minmax(...)) where suitable, and test long labels, zoom, and narrow screens."]
    ],
    code: '*, *::before, *::after {\\n  box-sizing: border-box;\\n}\\n.gallery {\\n  display: grid;\\n  grid-template-columns: repeat(\\n    auto-fit, minmax(min(100%, 14rem), 1fr)\\n  );\\n  gap: 1rem;\\n}\\n.card { min-width: 0; }',
    practice: "Create a three-card gallery that becomes one column on a narrow screen. Explain why border-box sizing and min-width: 0 can help prevent overflow."
  },
  2: {
    title: "JavaScript foundations: scope, functions and async",
    lead: "Build a reliable mental model for where values live, how functions retain access to them, and when asynchronous work resumes.",
    sections: [
      ["Scope and the temporal dead zone", "let and const are block-scoped. Their bindings exist from the start of the block but cannot be accessed before the declaration is evaluated; that interval is the temporal dead zone. var is function-scoped and has different hoisting behavior."],
      ["Closures and this", "A closure is a function together with access to its surrounding lexical environment. It can retain values after the outer function returns. The value of this depends on how a function is called; arrow functions do not create their own this binding."],
      ["Promises and the event loop", "Promise callbacks run as microtasks after the current synchronous stack completes. Timer callbacks are tasks (often called macrotasks). After a task completes, the runtime drains the microtask queue before moving to the next task."],
      ["Array map does not await", "Array.prototype.map calls its callback for each item and returns an array of callback results. If the callback is async, those results are promises. Use Promise.all(items.map(async ...)) when you want to await all mapped operations together."]
    ],
    code: 'const values = [1, 2, 3];\\nconst promises = values.map(async value => value * 2);\\nconst doubled = await Promise.all(promises);\\nconsole.log(doubled); // [2, 4, 6]',
    practice: "Predict the order of a synchronous console.log, a Promise.then callback, and a setTimeout callback. Then explain why an async map returns promises."
  },
  3: {
    title: "Common JavaScript and layout pitfalls",
    lead: "Recognize frequent failure patterns and use a small diagnostic routine instead of guessing.",
    sections: [
      ["Microtasks versus tasks", "Synchronous code runs first. Promise reactions and queueMicrotask callbacks are microtasks; setTimeout callbacks are tasks. Microtasks queued by the current task run before the next task begins."],
      ["Find async map mistakes", "If you log the result of items.map(async item => ...), you see an array of promises, not the resolved values. Await Promise.all(...) for concurrent work, or use a for...of loop with await when operations must happen sequentially."],
      ["Prevent flex overflow", "A flex item’s automatic minimum size can be based on its content. When a child refuses to shrink, inspect its min-width and set min-width: 0 on the appropriate flex item; also check unbroken strings, images, and fixed-width children."],
      ["Event propagation and delegation", "An event can travel through capture, target, and bubble phases. Delegation places a listener on a stable ancestor and checks event.target or closest(...) to identify a matching child. Use it when many similar dynamic children need the same behavior."]
    ],
    code: 'list.addEventListener("click", event => {\\n  const button = event.target.closest("[data-action]");\\n  if (!button || !list.contains(button)) return;\\n  handleAction(button.dataset.action);\\n});',
    practice: "Debug a list that adds items dynamically but has no click handlers on new items. Describe how event delegation solves it and where you would attach the listener."
  }
};


const foundationLessons = {
  python: [
    { title:"Python syntax, values and truthiness", lead:"Python programs are sequences of statements that operate on objects. Learn to read values, types, and branching before building larger scripts.", sections:[
      ["Names, objects, and assignment","A variable name is a reference to an object, not a box that permanently owns a value. Assignment binds a name; assigning one name to another can make both refer to the same mutable object. Use type(value) when learning what a value is, and repr(value) when you need an unambiguous representation."],
      ["Expressions, indentation, and truthiness","Python uses indentation to group blocks. if, elif, and else select a branch based on a condition. False, None, numeric zero, and empty collections are falsey; most other objects are truthy. Prefer explicit comparisons when the distinction matters, such as value is None."],
      ["Mutability and safe updates","Numbers, strings, and tuples are immutable; lists and dictionaries are mutable. An operation that mutates a list changes the same object. Make a copy when you need an independent collection, and do not confuse a shallow copy with a deep copy of nested objects."]
    ], code:"amount = 125\nname = \"Travel\"\nitems = [\"bus\", \"train\"]\n\nif amount and items:\n    print(f\"{name}: {amount} for {len(items)} items\")", practice:"Write a small script that stores a category, an amount, and a list of expenses. Print a readable summary. Then test the condition with 0, an empty list, and None.", sources:["https://docs.python.org/3/tutorial/introduction.html"]},
    { title:"Built-in data structures and complexity", lead:"Choose a collection by the operations your program performs most often, not just by how its literal looks.", sections:[
      ["List, tuple, set, and dictionary","A list is ordered and mutable, suited to sequences. A tuple is ordered and immutable, useful for fixed records. A set stores unique hashable values and supports membership and set algebra. A dictionary maps hashable keys to values and preserves insertion order in modern Python."],
      ["Practical complexity","List indexing is O(1); appending is amortized O(1); inserting near the front and searching a list are O(n). Set and dictionary membership are average O(1), though worst-case behavior can differ. These are useful models, not guarantees about every workload or implementation."],
      ["Memory and data shape","A dictionary is convenient for looking up a record by key; a list is convenient for preserving a sequence. For nested data, draw a tiny example and identify which level represents a row, a field, or a group. Measure before optimizing memory."]
    ], code:"expenses = [120, 80, 120]\nunique_amounts = set(expenses)\nby_category = {\"food\": 120, \"travel\": 80}\n\nprint(120 in unique_amounts)  # True\nprint(by_category[\"food\"])  # 120", practice:"Create a list of five transactions. Use a dictionary to total amounts by category and a set to list the unique categories. Explain why each structure fits its task.", sources:["https://docs.python.org/3/tutorial/datastructures.html"]},
    { title:"Strings, Unicode and encoding", lead:"Text is made of Unicode code points in Python; bytes are sequences of values used to represent encoded data.", sections:[
      ["Text versus bytes","str represents text; bytes represents raw byte values. Encoding converts text to bytes, while decoding converts bytes to text. UTF-8 is a common encoding for files and network data, but you should still specify the encoding when reading and writing files."],
      ["Normalize and inspect text","Visually identical text can have different underlying code-point sequences. When comparing user-entered text, consider Unicode normalization when appropriate. Avoid assuming one character equals one byte or one visible glyph."],
      ["Robust file handling","Open text files with an explicit encoding such as utf-8. Handle UnicodeDecodeError when input may be malformed, and choose a documented error policy rather than silently corrupting data."]
    ], code:"text = \"café\"\ndata = text.encode(\"utf-8\")\nprint(data)\nprint(data.decode(\"utf-8\"))", practice:"Write a string containing accented characters, encode it to UTF-8, and decode it. Explain why len(text) and len(data) may differ.", sources:["https://docs.python.org/3/howto/unicode.html"]},
    { title:"Functions, arguments and scope", lead:"Functions package a task behind a name and a clear input/output contract.", sections:[
      ["Define and return","Use def to create a function. Parameters name the inputs; return sends a result to the caller. A function without an explicit return returns None. Keep a function focused and make side effects visible in its name or documentation."],
      ["Default arguments and keyword arguments","Default values are evaluated once when the def statement executes. Avoid mutable defaults such as [] because calls can share the same object; use None and create a new list inside the function. Keyword-only parameters can make optional behavior clearer."],
      ["LEGB name lookup","Python resolves local, enclosing, global, and built-in names in that order. Prefer passing dependencies as parameters instead of modifying global state. *args collects extra positional arguments; **kwargs collects extra keyword arguments."]
    ], code:"def add_expense(amount, category, tags=None):\n    if tags is None:\n        tags = []\n    return {\n        \"amount\": amount,\n        \"category\": category,\n        \"tags\": tags,\n    }", practice:"Write a function that accepts amount and category, plus optional tags. Call it twice without tags and prove the returned tag lists are independent.", sources:["https://docs.python.org/3/tutorial/controlflow.html#defining-functions"]}
  ],
  excel: [
    { title:"How Excel calculates formulas and references", lead:"A worksheet is a grid, but a formula is a dependency that Excel recalculates when its inputs change.", sections:[
      ["Formula evaluation and dependencies","A formula begins with = and combines values, cell references, operators, and functions. Excel tracks dependencies so a changed input can trigger recalculation of dependent formulas. Circular references occur when a formula depends on its own result through a chain; resolve the dependency loop unless iterative calculation is deliberately required."],
      ["Relative, absolute, and mixed references","A relative reference such as A2 shifts when copied. An absolute reference $A$2 locks both row and column. Mixed references $A2 and A$2 lock only one dimension. Press F4 while editing a reference to cycle reference styles in supported desktop versions."],
      ["Debugging a copied formula","Before filling a formula down or across, identify which inputs should move and which should stay fixed. Use Evaluate Formula and inspect precedents when a result surprises you. Check number formats too: formatting changes display, not the underlying value."]
    ], code:"=B2*$F$1\n\nCopying down changes B2 to B3, while $F$1 stays fixed.\n=$A2*B$1 locks column A and row 1.", practice:"Build a small price × quantity table and place a tax rate in one fixed cell. Write a total formula and copy it down, using an absolute reference for the tax rate.", sources:["https://support.microsoft.com/en-us/excel"]},
    { title:"Tables, structured references and named ranges", lead:"Turn raw ranges into clear, expandable data structures that are easier to maintain.", sections:[
      ["Convert a range to a Table","A Table gives a dataset named columns, built-in filtering, and formulas that fill down automatically. Keep one header row, one record per row, and avoid merged cells inside the data region."],
      ["Structured references","Instead of A2:A500, a formula can refer to Table1[Amount]. Structured references follow the table as rows are added, and make formulas more readable. Use the Table Design tab to give the table a meaningful name."],
      ["Named ranges","A defined name can represent a cell, range, or formula. Names such as TaxRate communicate intent better than a bare address. Keep names unique and check their scope if a workbook contains multiple sheets."]
    ], code:"=SUM(Expenses[Amount])\n=SUMIFS(Expenses[Amount], Expenses[Category], \"Travel\")", practice:"Convert a transaction list to a Table named Expenses. Add a formula that totals its Amount column and a SUMIFS total for one category.", sources:["https://support.microsoft.com/en-us/office/using-structured-references-with-excel-tables"]}
    ,{ title:"Core conditional formulas and lookup limits", lead:"Summarize rows by criteria, branch on conditions, and understand what a lookup can and cannot safely assume.", sections:[
      ["Conditional aggregation","SUMIFS adds values meeting multiple criteria; COUNTIFS counts matching rows; AVERAGEIFS averages matching values. The sum/average range comes first, followed by paired criteria ranges and criteria. All criteria ranges should align in size."],
      ["Logical formulas and error handling","IF chooses between two results; IFS tests multiple conditions in order. IFERROR replaces any error with a chosen result, so use it carefully: it can hide genuine formula defects. During development, expose errors rather than masking them."],
      ["VLOOKUP constraints","VLOOKUP searches the first column of a table array and returns a value from a column index. Inserting/reordering columns can make hard-coded indices fragile; exact-match mode should be explicit for most business lookups. Modern alternatives include XLOOKUP, but availability depends on Excel version."]
    ], code:"=SUMIFS(Expenses[Amount],Expenses[Category],\"Travel\",Expenses[Month],\"Jan\")\n=IF(B2>=1000,\"Review\",\"OK\")\n=IFERROR(XLOOKUP(E2,IDs,Names),\"Not found\")", practice:"Create a three-criteria SUMIFS (category, month, and owner). Add an IF-based review flag. Test a missing lookup value and decide whether an error or friendly message is more appropriate.", sources:["https://support.microsoft.com/en-us/excel"]},
    { title:"Formatting, validation and trustworthy inputs", lead:"Make a workbook readable while preventing avoidable data-entry errors.", sections:[
      ["Number formats are presentation","A number format controls how a value appears, such as currency, percentage, or date. It does not convert the stored value. Confirm that imported dates and amounts are real numeric values rather than text."],
      ["Conditional formatting","Use conditional formatting to draw attention to values that meet a rule. Prefer a small number of meaningful rules and verify the rule range and relative references. Color should not be the only signal; include text, icons, or labels where needed."],
      ["Data validation","Validation can restrict entries to a list, whole number, decimal, date, or custom formula. Use a source list for consistent categories, and add clear input and error messages. Validation reduces errors but is not a security boundary; pasted data may bypass it."]
    ], code:"Example validation setup:\nAllow: List\nSource: =CategoryList\nInput message: Choose a listed category.\nError alert: Please select a valid category.", practice:"Create a category dropdown from a named range. Add a date rule and conditional formatting that flags expenses above a chosen threshold.", sources:["https://support.microsoft.com/en-us/excel"]}
  ],
  powerbi: [
    { title:"Connect to data sources responsibly", lead:"A Power BI report starts with a data source decision: where data lives, how it is accessed, and how refresh will work.", sections:[
      ["Choose a connector","Power BI Desktop can connect to files, databases, web endpoints, and folders. Match the connector to the actual source and confirm credentials, privacy requirements, and refresh support before designing visuals."],
      ["Understand connection modes","Import loads a model copy that is refreshed on a schedule or manually. DirectQuery sends queries to the source for supported operations, introducing source and network performance considerations. Choose based on freshness, scale, source capability, and governance."],
      ["Folder ingestion","Combining files from a folder works best when files share a consistent schema and naming convention. Inspect sample-file transformations and test what happens when a file is missing a column or contains a malformed row."]
    ], practice:"Connect to a small CSV or Excel workbook with two related tables. Record the source, connector, authentication method, and whether Import or DirectQuery fits the exercise.", sources:["https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-data-sources"]},
    { title:"Power Query ETL and shaping", lead:"Power Query records a repeatable sequence of data-preparation steps before data reaches the model.", sections:[
      ["ETL in a report workflow","Extract obtains data, transform cleans and shapes it, and load places the result into the model. Rename columns, set types, remove irrelevant rows, and keep transformations understandable and testable."],
      ["Applied Steps and query design","Each transformation appears as a step. Use clear step names and keep raw-source queries separate from curated outputs when that improves maintainability. Avoid making a long chain of opaque transformations without checking intermediate results."],
      ["Incremental refresh concept","Incremental refresh partitions data by a date/time range so only a defined recent period needs refresh after initial setup. It requires appropriate date filtering and configuration; it is not a magic speed switch and must be validated against the data source and service setup."]
    ], practice:"In Power Query, set correct data types, remove blank rows, standardize column names, and filter out test records. Describe which steps would need updating if a source column is renamed.", sources:["https://learn.microsoft.com/en-us/power-query/"]},
    { title:"Build a report with visuals, slicers and filters", lead:"A report is an interface for asking questions of a model, not just a page of charts.", sections:[
      ["Choose a visual for the question","Cards show a single KPI; bar charts compare categories; line charts show trends over an ordered axis; tables expose detail. Start with the question and the grain of the data, then choose the visual that communicates it accurately."],
      ["Filters and slicers","Visual-, page-, and report-level filters act at different scopes. A slicer is a visible filter control for report readers. Check interactions between visuals so selecting one chart does not unexpectedly hide or distort another."],
      ["Labels and interpretation","Use descriptive titles, meaningful units, sensible sort order, and accessible contrast. Avoid misleading axes and clutter. Include the reporting period and data freshness where they affect interpretation."]
    ], practice:"Build a two-page report from the sample model: an overview page with KPI cards and a trend, and a detail page with a table and slicer. Write one sentence describing what each visual helps answer.", sources:["https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-report-visualization"]},
    { title:"Data types, categories and sort order", lead:"Correct metadata prevents misleading visuals and broken aggregations.", sections:[
      ["Set data types early","Dates, whole numbers, decimals, text, and Boolean values behave differently in the model. Set the type in Power Query where possible, then confirm it in the model. A numeric-looking ID is often text if arithmetic on it has no meaning."],
      ["Data categorization","Categorization can help Power BI interpret fields such as city, country, postal code, or web URL. Use it only when the column genuinely contains that kind of data, and consider privacy implications before enabling map visuals."],
      ["Sort by another column","Month names sort alphabetically unless you provide a numeric month index. Set Sort by column so labels display in intended order, and ensure each displayed label maps consistently to the sort key."]
    ], practice:"Create MonthName and MonthNumber columns, sort MonthName by MonthNumber, and verify that a chart displays Jan through Dec rather than alphabetical order.", sources:["https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-sort-by-column"]}
  ]
};

function openPhaseStudy(track, phase, index) {
  studyTitle.textContent = `Phase ${index + 1} · ${phase.title}`;
  studyDescription.textContent = `${track.name} · Study focus`;
  studyTopics.replaceChildren();
  phase.topics.forEach((topic, topicIndex) => {
    const item = makeElement("article", "study-topic");
    item.append(makeElement("span", "study-topic-number", `TOPIC GROUP ${String(topicIndex + 1).padStart(2, "0")}`));
    item.append(makeElement("p", "study-topic-copy", topic));
    if (index === 0 && (track.id === "fullstack" ? guidedLessons[topicIndex] : foundationLessons[track.id]?.[topicIndex])) {
      const lessonButton = makeElement("button", "topic-lesson-action", "Study this topic →");
      lessonButton.type = "button";
      lessonButton.addEventListener("click", () => openGuidedLesson(topicIndex, track));
      item.append(lessonButton);
    } else {
      item.append(makeElement("small", "lesson-pending", "Lesson content will be authored in a later stage."));
    }
    studyTopics.append(item);
  });
  studyProject.textContent = phase.project;
  studyCheckpoints.replaceChildren();
  phase.checkpoints.forEach(checkpoint => studyCheckpoints.append(makeElement("li", "", checkpoint)));
  phaseList.hidden = true;
  phaseStudy.hidden = false;
  phaseStudy.scrollTop = 0;
}

document.querySelector("#back-to-roadmap").addEventListener("click", () => {
  phaseStudy.hidden = true;
  phaseList.hidden = false;
  phaseList.scrollTop = 0;
});

function openGuidedLesson(topicIndex = 0) {
  const lesson = guidedLessons[topicIndex];
  if (!lesson) return;
  lessonReader.replaceChildren();
  const eyebrow = makeElement("p", "eyebrow", `GUIDED LESSON · ${track?.name || "FOUNDATIONS"}`);
  const heading = makeElement("h4", "", lesson.title);
  heading.id = "lesson-title";
  heading.dataset.topicIndex = String(topicIndex);
  const lead = makeElement("p", "lesson-lead", lesson.lead);
  lessonReader.append(eyebrow, heading, lead);
  lesson.sections.forEach(([sectionTitle, sectionBody], index) => {
    lessonReader.append(makeElement("h5", "", `${index + 1}. ${sectionTitle}`));
    lessonReader.append(makeElement("p", "", sectionBody));
  });
  if (lesson.code) {
    const pre = makeElement("pre", "lesson-code");
    pre.append(makeElement("code", "", lesson.code.replace(/\\n/g, "\n")));
    lessonReader.append(pre);
  }
  const practice = makeElement("div", "lesson-practice");
  practice.append(makeElement("strong", "", "Try it"));
  practice.append(makeElement("p", "", lesson.practice));
  lessonReader.append(practice);
  if (Array.isArray(lesson.sources) && lesson.sources.length) {
    const sourceBlock = makeElement("section", "lesson-sources");
    sourceBlock.append(makeElement("h5", "", "Official reference reading"));
    const sourceList = makeElement("ul", "detail-list");
    lesson.sources.forEach(url => {
      const item = makeElement("li", "");
      const link = makeElement("a", "", new URL(url).hostname.replace(/^www\\./, ""));
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      item.append(link);
      sourceList.append(item);
    });
    sourceBlock.append(sourceList);
    lessonReader.append(sourceBlock);
  }
  const notesLabel = makeElement("label", "lesson-notes-label", "My notes");
  notesLabel.htmlFor = "lesson-notes";
  lessonReader.append(notesLabel, lessonNotes);
  const actions = makeElement("div", "lesson-actions");
  actions.append(saveLessonNotesButton, completeLessonButton);
  lessonReader.append(actions, lessonFeedback);
  lessonReader.hidden = false;
  activeLessonKey = `learning-studio.lesson.${track.id}.phase${1}.topic${topicIndex}`;\n  activeNotesKey = activeLessonKey + ".notes";\n  lessonNotes.value = readSaved(activeNotesKey);
  lessonFeedback.textContent = "";
  const completed = readSaved(activeLessonKey) === "complete";
  completeLessonButton.textContent = completed ? "Lesson completed ✓" : "Mark lesson complete";
  showView("lesson");
  lessonReader.scrollIntoView({ block: "start", behavior: "auto" });
}
function readSaved(key) {
  try { return window.localStorage.getItem(key) || ""; }
  catch (error) { return ""; }
}

document.querySelector("#back-to-phase").addEventListener("click", () => {
  lessonReader.hidden = true;
  phaseStudy.scrollTop = 0;
  showView("phase");
});
saveLessonNotesButton.addEventListener("click", () => {
  try {
    window.localStorage.setItem(activeNotesKey, lessonNotes.value);
    lessonFeedback.textContent = "Notes saved on this device.";
  } catch (error) {
    lessonFeedback.textContent = "Could not save notes in this browser. You can copy them before leaving.";
  }
});
completeLessonButton.addEventListener("click", event => {
  try {
    window.localStorage.setItem(activeLessonKey, "complete");
    event.currentTarget.textContent = "Lesson completed ✓";
    lessonFeedback.textContent = "Completion saved on this device.";
  } catch (error) {
    lessonFeedback.textContent = "Could not save completion in this browser.";
  }
  renderProgress();
});

function renderProgress() {
  const lessonIds = ["fullstack", "python", "excel", "powerbi"]
    .flatMap(trackId => [0, 1, 2, 3].map(topicIndex =>
      `learning-studio.lesson.${trackId}.phase1.topic${topicIndex}`));
  const completedCount = lessonIds.filter(id => readSaved(id) === "complete").length;
  const completed = document.querySelector("#progress-completed");
  const available = document.querySelector("#progress-available");
  const meter = document.querySelector(".progress-meter");
  const fill = document.querySelector("#progress-meter-fill");
  const status = document.querySelector("#progress-status");
  const lessonState = document.querySelector("#progress-lesson-state");
  if (!completed || !meter || !fill || !status || !lessonState) return;
  if (available) available.textContent = String(lessonIds.length);
  completed.textContent = String(completedCount);
  meter.setAttribute("aria-valuemax", String(lessonIds.length));
  meter.setAttribute("aria-valuenow", String(completedCount));
  fill.style.width = `${lessonIds.length ? (completedCount / lessonIds.length) * 100 : 0}%`;
  lessonState.textContent = readSaved(lessonIds[0]) === "complete" ? "Completed ✓" : "Not started";
  status.textContent = completedCount === lessonIds.length
    ? "All 16 authored foundation lessons are complete."
    : `${completedCount} of ${lessonIds.length} authored foundation lessons completed.`;
}
function getSequenceNote() {
  return "Complete Excel Phase 3 before Power BI Phase 2. Full-stack and Python can be studied in parallel from day one.";
}

document.querySelector(".close").addEventListener("click", () => showView("curriculum"));
const roadmapBack = makeElement("button", "back-action", "← All learning tracks");
roadmapBack.id = "back-to-curriculum";
roadmapBack.type = "button";
roadmapBack.addEventListener("click", () => showView("curriculum"));
document.querySelector("#phase-page").prepend(roadmapBack);
searchInput.addEventListener("input", event => renderTracks(event.target.value));
renderProgress();

fetch(new URL("data/curriculum.json", document.baseURI), { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error("Curriculum could not be loaded.");
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data.tracks) || data.tracks.length !== 4) {
      throw new Error("Curriculum data is incomplete or invalid.");
    }
    tracks = data.tracks;
    renderTracks();
  })
  .catch(error => {
    trackRoot.textContent = `${error.message} Please refresh or check the published curriculum file.`;
    console.error(error);
  });