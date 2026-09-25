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
let lessonFeedback = document.querySelector("#lesson-feedback");
let completeLessonButton = document.querySelector("#complete-lesson");
let activeLessonKey = "learning-studio.lesson.fullstack.phase1.topic0";
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


// Create the completion feedback and control in JavaScript so the reader
// works even when the HTML shell provides only an empty lesson-reader container.
if (!lessonFeedback) {
  lessonFeedback = makeElement("p", "lesson-feedback");
  lessonFeedback.id = "lesson-feedback";
  lessonFeedback.setAttribute("aria-live", "polite");
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
    lead: "Learn to build the meaning, navigation, and interaction structure of a page before styling it. This lesson moves from browser parsing to landmarks, headings, forms, keyboard use, and a practical audit.",
    highlight: "Semantic HTML gives content and controls meaning through the browser’s built-in elements. Choose the element for its purpose first; style it afterward.",
    keyPoints: ["Use native HTML elements before adding ARIA.", "Use headings to show content hierarchy, not to choose font size.", "Links navigate; buttons perform actions.", "Every form control needs a programmatically associated label.", "Check the page with keyboard-only navigation and visible focus."],
    syntaxNotes: [
      ["<!doctype html>", "Declares that the document uses modern HTML. It helps the browser render the page in standards mode."],
      ['<html lang="en">', "The root element wraps the document. The lang attribute identifies the main language, helping assistive technology choose pronunciation and language rules."],
      ['<meta charset="utf-8">',"Sets the character encoding so text is interpreted consistently."],
      ['<meta name="viewport" content="width=device-width, initial-scale=1">', "Makes the layout viewport match the device width and starts at the intended scale. It is important for responsive pages."],
      ["<title>Field Notes</title>", "Sets the document title shown in the browser tab and used as a page identifier in many contexts."],
      ["<header>, <nav>, <main>, <article>, <footer>", "These are semantic elements. Their names communicate the purpose of each region; they are not interchangeable decoration."],
      ['<nav aria-label="Primary">', "Creates a navigation landmark and gives it a concise accessible name. Use a distinct name when a page has multiple navigation regions."],
      ['<a href="#about">', "An anchor with href is a link. The #about fragment navigates to the element whose id is about."],
      ['<h1> and <h2>',"Heading levels express hierarchy. This example uses h1 for the page title and h2 for the article heading nested within the main content."],
      ['id="articles" and href="#articles"',"The id gives an element a unique in-page identifier; the matching fragment in href links to it. IDs should be unique in the document."]
    ],
    sections: [
      ["Learning outcomes", "By the end, you should be able to distinguish semantic HTML from generic containers, choose elements by their purpose, create a useful heading and landmark structure, connect form labels to controls, and check a page with keyboard-only navigation."],
      ["1. What the browser does with HTML", "HTML is a markup language that describes document structure. The browser parses the markup into a Document Object Model (DOM), a tree of nodes that scripts and assistive technologies can inspect. Elements are not merely visual boxes: their native roles, names, states, and relationships can expose useful meaning. CSS changes presentation; it does not automatically give a generic div the same native behavior as a button or link."],
      ["2. Semantic elements versus generic containers", "Use an element whose built-in meaning matches the content. header represents introductory content for a page or section; nav groups major navigation links; main identifies the dominant page content; article is a self-contained composition that could make sense on its own; section groups related content and should usually have a heading; aside contains complementary material; footer holds closing or metadata content. A div is appropriate when no more specific element fits and you need a neutral grouping hook. Do not choose an element only because its default browser styling looks convenient."],
      ["3. Landmarks and page structure", "A landmark is a navigable region that helps people using screen readers move around a page. A typical page has a header, navigation, one main region, and a footer. Use main for the unique primary content of the document, not for every panel. If a page has multiple nav regions, provide distinct accessible names such as aria-label=\"Primary\" and aria-label=\"In this article\". Keep the landmark structure predictable so users can jump directly to the region they need."],
      ["4. Headings create an outline for people", "Headings communicate topic and hierarchy, not just font size. Start with a clear page title in h1, then use h2 for major sections and h3 for subsections within an h2. Do not skip levels just to get smaller text; use CSS for appearance. Each section heading should describe the content that follows. A page can contain more than one h1 in modern HTML, but a single clear page-level h1 is a simple, maintainable convention for beginners."],
      ["5. Links and buttons have different jobs", "A link navigates to a resource or location and should normally use an anchor with a meaningful href. A button performs an action in the current interface, such as submitting a form, opening a dialog, or changing a setting. Avoid clickable divs and spans: they do not provide the same keyboard and accessibility behavior automatically. Link text like \"Read the accessibility guide\" is more informative than \"Click here\". If an icon-only control is necessary, give it an accessible name."],
      ["6. Accessible forms: name, instruction, error", "A visible label should be programmatically associated with its input. The simplest pattern is <label for=\"email\">Email address</label> and <input id=\"email\" name=\"email\" type=\"email\">. The for value must exactly match the control id. Placeholder text is a hint, not a replacement for a persistent label. Use fieldset and legend to group related controls, such as a set of radio buttons. Explain required formats before submission, identify errors in text, and connect help or error text with aria-describedby when useful. Native input types and validation can help, but do not rely on color alone to communicate errors."],
      ["7. Keyboard and focus checks", "Many people navigate without a mouse. Use Tab and Shift+Tab to move through interactive controls, Enter to activate links and buttons, and Space to activate buttons and checkboxes. Focus should move in a logical order and remain visibly indicated. Do not remove the browser outline unless you replace it with a clear, high-contrast focus style. Avoid positive tabindex values because they can create a confusing order. Test that every action can be reached and completed using only the keyboard."],
      ["8. ARIA: add meaning only when native HTML is not enough", "Accessible Rich Internet Applications (ARIA) can expose roles, names, states, and relationships, but it does not add behavior. Prefer native elements first: a button already has button semantics and keyboard activation. Use aria-label when a control needs a concise accessible name and no suitable visible label exists; use aria-labelledby to reference existing visible text; use aria-describedby for supporting instructions. Do not add redundant roles such as role=\"button\" to a native button, and do not use ARIA to disguise a non-interactive element without also implementing keyboard behavior."],
      ["9. A practical quality checklist", "Inspect the page at a narrow viewport and at 200% zoom. Confirm there is a clear page title, sensible heading order, a main landmark, descriptive links, labels for all form fields, visible keyboard focus, and no keyboard traps. Check text and focus contrast against their actual backgrounds. Automated tools can identify some issues, but they cannot fully judge whether link text is understandable, headings are meaningful, or a workflow is usable. Combine automated checks with manual keyboard and screen-reader review."],
      ["Worked example: a small article page", "The example uses a page header, a named navigation region, one main landmark, an article with a heading, and a footer. Notice that the article heading is h2 because the page title is h1. The nav label names the purpose of that navigation region. This is a starting structure, not a complete production site: a real page still needs responsive styling, meaningful content, and manual accessibility checks."]
    ],
    code: '<!doctype html>\\n<html lang="en">\\n<head>\\n  <meta charset="utf-8">\\n  <meta name="viewport" content="width=device-width, initial-scale=1">\\n  <title>Field Notes</title>\\n</head>\\n<body>\\n  <header>\\n    <h1>Field Notes</h1>\\n  </header>\\n  <nav aria-label="Primary">\\n    <a href="#articles">Articles</a>\\n    <a href="#about">About</a>\\n  </nav>\\n  <main id="articles">\\n    <article>\\n      <h2>Starting with structure</h2>\\n      <p>Meaningful markup helps people navigate content.</p>\\n      <a href="#about">Learn about this project</a>\\n    </article>\\n  </main>\\n  <footer id="about">\\n    <p>Field Notes learning project</p>\\n  </footer>\\n</body>\\n</html>',
    practice: "Build a one-page article with a page title, primary navigation, main region, article, and footer. Then add a short contact form with a visible label, email input, and submit button. Explain why each element was chosen. Finally, use only the keyboard to visit every control and confirm focus is visible. As a self-check, list the page landmarks and read the headings in order.",
    workedExample: {
      title: "Label a form field correctly",
      code: '<label for="email">Email address</label>\\n<input id="email" name="email" type="email" autocomplete="email">\\n<button type="submit">Join newsletter</button>',
      explanation: [
        "The label's for value and the input's id are both email, so the label is programmatically associated with that input.",
        "The name attribute is the key used when form data is submitted; id identifies the element in the document and connects the label.",
        "type=email gives the browser an email-oriented input control and basic format validation. It does not prove that the address exists.",
        "The button is a real button, so it supports native keyboard activation. In a complete form, place these controls inside a form element."
      ]
    },
    knowledgeCheck: [
      {
        question: "Which element should you use for an action such as opening a dialog?",
        answer: "Use a <button> because it performs an action. Use an <a href> when the user is navigating to a URL or in-page destination."
      },
      {
        question: "What makes a visible label associated with an input in this example?",
        answer: "The label's for attribute must exactly match the input's id. The text merely being nearby is not enough to guarantee a programmatic association."
      },
      {
        question: "Why is a div with a click handler usually not a good substitute for a button?",
        answer: "A native button already provides interactive semantics, keyboard behavior, and focus handling. A clickable div requires you to recreate those behaviors and expose its role and state correctly."
      }
    ]
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
  },
  1: {"title":"CSS layout: box model, Flexbox and Grid","lead":"Understand element sizing, one-dimensional and two-dimensional layout, and responsive behavior.","highlight":"Flexbox arranges items along one main axis; Grid manages rows and columns together. Debug overflow by finding the sizing constraint.","keyPoints":["The box model is content, padding, border and margin.","border-box includes padding and border in declared dimensions.","Flexbox is one-dimensional; Grid is two-dimensional.","Use gap for consistent gutters.","Test layouts at narrow widths and zoom."],"sections":[["Outcomes","Calculate a box size, choose Flexbox or Grid, and build a responsive gallery without horizontal overflow."],["1. Box model","An element consists of content, padding, border and margin. With content-box, width applies to content and padding/border add to the outer size. With border-box, the declared width includes content, padding and border; margin remains outside. This makes component sizing easier to reason about."],["2. Cascade and constraints","The cascade resolves competing rules using origin, importance, layers, specificity and source order. Width is not always the final size: min/max constraints, intrinsic content and layout algorithms also apply. Long unbroken text or fixed-width media can force overflow."],["3. Flexbox","Set display:flex on a parent. flex-direction selects the main axis; justify-content distributes space on it; align-items aligns on the cross axis. flex-wrap allows items to wrap, and gap sets consistent spacing. Flexbox is useful for navigation, control rows and simple stacks."],["4. Grid","Grid controls rows and columns together. grid-template-columns defines tracks; fr shares remaining space. repeat(auto-fit, minmax(min(100%, 14rem), 1fr)) creates as many columns as fit while allowing a track to shrink when the container is narrow."],["5. Responsive debugging","Start narrow and add breakpoints when content needs them. Inspect the overflowing node, computed width and min-width. min-width:0 can let a flex/grid child shrink below its automatic content minimum. Allow long text to wrap and constrain images; avoid hiding overflow blindly because it can clip content or focus rings."],["6. Walkthrough","The sample grid auto-fits cards to available space. border-box makes dimensions predictable; min-width:0 lets cards shrink; max-width:100% constrains images. Also test long titles, zoom and keyboard focus."]],"code":"*, *::before, *::after {\\n  box-sizing: border-box;\\n}\\n.gallery {\\n  display: grid;\\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));\\n  gap: 1rem;\\n}\\n.card { min-width: 0; }\\n.card img { max-width: 100%; height: auto; }","syntaxNotes":[["box-sizing: border-box","Declared width/height includes content, padding and border; margin is excluded."],["display: grid","Turns the element into a grid container; direct children are grid items."],["repeat(auto-fit, ...)","Creates as many tracks as fit; empty tracks can collapse and remaining tracks expand."],["minmax(min(100%, 14rem), 1fr)","Defines a flexible track whose minimum does not exceed the container width."],["gap: 1rem","Sets gutters between tracks without adding margins to outer edges."],["min-width: 0","Allows a flex/grid item to shrink below its automatic content-based minimum."],["max-width: 100%; height: auto","Keeps images within their container and preserves aspect ratio."]],"workedExample":{"title":"Fix a flex card overflow","code":".row { display: flex; }\\n.card { flex: 1; min-width: 0; }\\n.card__title { overflow-wrap: anywhere; }","explanation":["Use devtools to identify the element whose box extends beyond the viewport.","A flex item’s automatic minimum may be content-based; min-width:0 allows it to shrink.","overflow-wrap:anywhere lets long tokens break instead of widening the card.","Constrain images too, then retest narrow widths and zoom."]},"knowledgeCheck":[{"question":"What does border-box include?","answer":"Content, padding and border; margin remains outside."},{"question":"When is Grid preferable?","answer":"When rows and columns both matter, such as a card gallery."},{"question":"Why can min-width:0 help?","answer":"It removes the automatic content-based minimum that may prevent a flex/grid child from shrinking."}],"practice":"Build six responsive cards with a long title and an image. Test at 320px, 768px and desktop widths; record column changes and check for unintended horizontal scrolling.","sources":["https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model","https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout","https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"]},
  2: {"title":"JavaScript foundations: scope, functions and async","lead":"Understand where values live, how functions retain access to them, and how asynchronous work is scheduled.","highlight":"The synchronous stack completes before queued callbacks run. Promise reactions are microtasks; timers schedule later tasks. await composes promises without blocking the entire runtime.","keyPoints":["let and const are block-scoped; var is function-scoped.","Closures retain access to lexical variables.","Regular-function this depends on call form; arrows inherit this.","async functions always return Promises.","map(async ...) returns Promises; Promise.all awaits them together."],"sections":[["Outcomes","Trace scope, describe closures, distinguish this behavior, read async/await and predict event-loop ordering."],["1. Bindings and scope","let and const are block-scoped. Their bindings exist when the scope is entered but cannot be read before declaration evaluation: the temporal dead zone. var is function-scoped and initialized to undefined when its function begins. Prefer const unless reassignment is needed."],["2. Closures","Functions are values that can be passed, returned and stored. A closure is a function with access to its lexical environment. An inner function can continue using an outer binding after the outer function returns. This enables private state and callbacks, but long-lived callbacks can unintentionally retain objects."],["3. this","A regular function’s this is generally determined by how it is called (method, call/apply, constructor, or plain call, with strict-mode differences). An arrow function has no own this; it captures the surrounding value. Arrows are useful for callbacks that should preserve context, but not every method should be an arrow."],["4. Promises and async/await","A Promise represents eventual fulfillment or rejection. then chains work, catch handles rejection and finally runs cleanup. An async function returns a Promise. await suspends that function’s continuation until settlement; it does not block unrelated work. Use try/catch for local error handling."],["5. Event loop","Synchronous code runs on the call stack. When it empties, queued microtasks such as Promise reactions run before the next task, such as a timer callback. A zero-delay timer is not immediate. Host scheduling and rendering add details, but this ordering explains common traces."],["6. Async array methods","map returns an array of callback results. With an async callback those results are Promises, not resolved values. Promise.all waits for all inputs and returns values in input order, or rejects if one rejects. Use a sequential for...of loop when each operation depends on the previous one."]],"code":"const values = [1, 2, 3];\\nconst promises = values.map(async value => value * 2);\\nconst doubled = await Promise.all(promises);\\nconsole.log(doubled); // [2, 4, 6]","syntaxNotes":[["const","Creates a non-reassignable block-scoped binding; objects it references may still be mutable."],["map(callback)","Calls the callback for each element and returns a new array of callback results."],["async value => ...","An async arrow function; its return value is wrapped in a Promise."],["Promise.all(promises)","Combines promises into one Promise; fulfillment results preserve input order."],["await","Suspends the current async function’s continuation until settlement."],["console.log","Writes a diagnostic value to the developer console."]],"workedExample":{"title":"Fetch several records concurrently","code":"async function loadUsers(ids) {\\n  const responses = await Promise.all(\\n    ids.map(id => fetch('/api/users/' + id))\\n  );\\n  const parsed = responses.map(response => {\\n    if (!response.ok) throw new Error('HTTP ' + response.status);\\n    return response.json();\\n  });\\n  return Promise.all(parsed);\\n}","explanation":["The first map starts one fetch per ID and returns promises.","The first Promise.all waits for responses and preserves input order.","response.json() is asynchronous too, so the second Promise.all waits for parsing.","A production app should handle network errors, cancellation and request limits."]},"knowledgeCheck":[{"question":"What is the temporal dead zone?","answer":"The period after entering a let/const scope but before its declaration is evaluated; reading the binding then throws ReferenceError."},{"question":"Does await block the whole runtime?","answer":"No. It suspends the current async function while other work can proceed."},{"question":"What does map(async callback) return?","answer":"An array of Promises; use Promise.all to await independent operations together."}],"practice":"Fetch three URLs concurrently, check response.ok, parse JSON and handle rejection. Rewrite with for...of and await for sequential execution; compare when each approach is appropriate.","sources":["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types","https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures","https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function","https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop"]},
  3: {"title":"Common JavaScript and layout pitfalls","lead":"Practice debugging async ordering, async map, flex overflow, event propagation and delegation.","highlight":"Reduce a failure to a small reproduction, state the expected result, observe the actual result, and test one assumption at a time.","keyPoints":["Promise reactions are microtasks after the current stack.","async map returns Promises, not resolved values.","Flex items may resist shrinking due to automatic minimum sizing.","Events can capture, reach a target and bubble.","Delegation handles events from dynamic descendants."],"sections":[["Outcomes","Predict event-loop order, repair async map, diagnose flex overflow and implement event delegation for a dynamic list."],["1. Predict order","Mark synchronous statements first. Promise reactions and queueMicrotask are microtasks; timers are tasks. The current stack completes, then microtasks drain before the next task. A timer delay of zero does not mean immediate execution."],["2. Repair async map","items.map(async item => transform(item)) returns Promise objects. For independent operations, await Promise.all(items.map(item => transform(item))). For sequential work use for...of with await. Promise.all rejects if an input rejects, but does not automatically cancel other started work."],["3. Flex overflow","A flex item’s automatic minimum can be influenced by min-content width. Long tokens, fixed controls or large images may prevent shrinking. Inspect the overflowing node and computed sizing; set min-width:0 on the appropriate item, allow wrapping and constrain media. Avoid blanket overflow:hidden, which may clip content and focus rings."],["4. Event propagation","Events may travel through capture ancestors, reach the target, then bubble. event.target is the original node and may be a nested icon; event.currentTarget is the listener’s node. preventDefault cancels a cancelable default action; stopPropagation halts further propagation. They are distinct and should be used intentionally."],["5. Delegation","Attach one listener to a stable parent. Use closest(selector) to find the intended control from a nested click target, then contains() to ensure it belongs to the parent. This works for dynamically added children. Use native buttons/links for keyboard behavior and validate action identifiers."],["6. Debugging loop","Reproduce with the smallest failing input. State expected behavior, capture actual output, and inspect data, control flow, event target, computed styles and console. Change one thing, rerun the same case, and add a regression check."]],"code":"const list = document.querySelector('#task-list');\\nlist.addEventListener('click', event => {\\n  if (!(event.target instanceof Element)) return;\\n  const button = event.target.closest('button[data-action]');\\n  if (!button || !list.contains(button)) return;\\n  handleAction(button.dataset.action);\\n});","syntaxNotes":[["addEventListener('click', callback)","Registers one listener on the stable parent; descendant clicks can bubble to it."],["event.target","The original event target, possibly a nested span/icon."],["instanceof Element","Guards use of closest(), an Element method."],["closest('button[data-action]')","Finds the nearest matching button from the target up through its ancestors."],["list.contains(button)","Confirms the matched button is inside this list."],["dataset.action","Reads the string stored in the data-action attribute."],["handleAction(...)","An application function to define separately; validate the action before use."]],"workedExample":{"title":"Correct an async result array","code":"// Incorrect: an array of Promise objects\\nconst pending = records.map(async record => enrich(record));\\n\\n// Correct for independent operations\\nconst results = await Promise.all(\\n  records.map(record => enrich(record))\\n);","explanation":["An async callback returns a Promise even when its body returns a plain value.","map collects the Promise objects; it does not await them.","Promise.all resolves to the values in input order.","For rate-limited services, use bounded concurrency instead of launching every request at once."]},"knowledgeCheck":[{"question":"Which runs first: synchronous log, Promise.then, zero-delay timer?","answer":"The synchronous log, then the Promise reaction microtask, then the timer task."},{"question":"How do preventDefault and stopPropagation differ?","answer":"preventDefault cancels a cancelable default action; stopPropagation stops further event propagation."},{"question":"Why use closest() and contains() together?","answer":"closest handles nested click targets; contains ensures the matched control is inside the intended delegated container."}],"practice":"Build a dynamic task list with add/remove buttons and one delegated listener. Verify nested button text works and outside clicks do nothing. Then explain the order of a synchronous log, Promise.then and setTimeout.","sources":["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop","https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all","https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation","https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout"]}
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



/* Phase 01 completeness pass: standardize learning checks and worked examples
   across all foundation lessons, and explicitly cover the remaining JS syllabus items. */
guidedLessons[2].sections.push(
  ["7. Prototype chains", "Objects can delegate property lookup to a prototype. If a property is not found on the object itself, JavaScript checks its prototype and continues up the chain until null. Classes are syntax built on this prototype model. Use Object.hasOwn(object, key) when you need to know whether a property belongs directly to the object rather than being inherited."],
  ["8. ES modules", "Use export to expose a module's public bindings and import to consume them in another file. Named exports are imported by name; a default export is imported under a local name. Modules have their own scope and run in strict mode. In browser projects, load the entry file with type=\"module\" and serve files through a development server."],
  ["9. Map and Set", "Map stores key-value entries and permits keys of any type; use set, get, has, delete and size. Set stores unique values and supports membership checks and de-duplication. Prefer Map for dynamic keyed collections and Set when uniqueness is the central requirement. A plain object remains suitable for records with known string keys."]
);
guidedLessons[2].syntaxNotes.push(
  ["Object.hasOwn(obj, key)", "Returns true only when key is a property directly on obj, not inherited through its prototype chain."],
  ["export / import", "Defines and consumes a module's public interface; named imports must match an exported name."],
  ["new Map() / new Set()", "Creates a keyed collection or unique-value collection; use collection methods rather than bracket lookup."]
);
guidedLessons[2].knowledgeCheck.push(
  { question: "How does property lookup work when an object does not own a property?", answer: "JavaScript follows the object's prototype chain until the property is found or the chain ends at null." },
  { question: "When is Map a better fit than a plain object?", answer: "For a dynamic key-value collection with arbitrary key types and collection methods such as has, get, set and size." },
  { question: "What is the role of export and import in ES modules?", answer: "They define and consume explicit module bindings, helping keep dependencies and scope clear." }
);
guidedLessons[2].workedExample = {
  title: "A closure with private state, plus Map and module syntax",
  code: "const makeCounter = () => {\\n  let count = 0;\\n  return () => ++count;\\n};\\nconst next = makeCounter();\\nconsole.log(next(), next()); // 1 2\\n\\nconst cache = new Map();\\ncache.set(\"user-7\", { name: \"Ari\" });\\nconsole.log(cache.has(\"user-7\")); // true\\n\\n// math.js: export const double = n => n * 2;\\n// app.js: import { double } from \"./math.js\";",
  explanation: [
    "makeCounter creates a local count binding and returns an inner function that retains access to it.",
    "Each call to makeCounter creates an independent counter environment.",
    "Map stores entries through set and retrieves them through get/has; it is not accessed as cache[\"user-7\"].",
    "The final comments show a named export and its matching import in separate module files."
  ]
};
guidedLessons[2].practice += " Extend the exercise by creating a Map cache and a separate ES module with one named export. Explain the difference between a closure's retained lexical binding and a Map entry.";

const phase1TutorRebuild = {
  "python": [
    {
      "highlight": "Names bind to objects. Mutability is a property of the object, not the name; this distinction explains aliasing and many beginner bugs.",
      "sections": [
        [
          "Trace a statement precisely",
          "For each statement, identify the expression evaluated, the object produced or retrieved, and the name binding or mutation that follows. Python evaluates expressions before assigning the result. Use type(x), repr(x), and id(x) as inspection tools while learning; id identifies object identity during that object's lifetime, not a permanent business identifier."
        ],
        [
          "Truthiness is a language rule, not a data-quality test",
          "if value: asks whether the value is truthy. Zero, None, False and empty built-in containers are falsey; a non-empty string such as \"0\" is truthy. Do not use truthiness to decide whether a numeric value is valid unless zero truly means absent. For missingness, prefer `is None`; for a non-empty string, test the stripped string explicitly."
        ],
        [
          "Mutability, aliasing and copying",
          "Assignment does not clone a list. If a and b refer to the same list, mutating through either name is visible through both. A shallow copy creates a new outer container but still shares nested objects. Make the data ownership decision explicit: mutate in place, copy before editing, or construct a new value."
        ],
        [
          "Control flow and boundary cases",
          "A branch is chosen from the current condition at runtime. Test boundary values such as 0, negative values, empty collections and None. For real inputs, validate type and allowed range before using a value in a calculation; readable code should make invalid-input behavior deliberate."
        ]
      ],
      "syntaxNotes": [
        [
          "name = expression",
          "Evaluates the expression, then binds the name to the resulting object; it does not necessarily copy it."
        ],
        [
          "if value:",
          "Branches on truthiness; use explicit checks when zero, empty or missing values have different meanings."
        ],
        [
          "value is None",
          "Identity comparison for the singleton None; use this to check a missing optional value."
        ],
        [
          "items.copy()",
          "Creates a shallow copy of a list; nested mutable members remain shared."
        ],
        [
          "id(value)",
          "Returns an identity integer for the object's lifetime, useful for demonstrating aliasing."
        ]
      ],
      "workedExample": {
        "title": "Predict, inspect, then mutate",
        "code": "source = [10, 20]\nalias = source\nsnapshot = source.copy()\nalias.append(30)\n\nprint(source)    # [10, 20, 30]\nprint(alias)     # [10, 20, 30]\nprint(snapshot)  # [10, 20]\nprint(source is alias)  # True\nprint(source is snapshot)  # False",
        "explanation": [
          "Before running the code, predict each printed line. `alias = source` creates a second name for the same list object.",
          "append mutates that one shared list, so both source and alias display the appended value.",
          "copy creates a different outer list, so snapshot keeps its original three? No: it keeps the two original values because the copy happened before append.",
          "The `is` operator tests identity, while `==` tests value equality. These answer different questions."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "After `b = a`, what must be true if a is a list?",
          "answer": "Both names refer to the same list object unless a later assignment rebinds one name."
        },
        {
          "question": "Why can `if amount:` be wrong for checking whether an amount was supplied?",
          "answer": "Zero is falsey but may be a valid amount. Use `amount is not None` when distinguishing missing from zero."
        },
        {
          "question": "Does `list.copy()` recursively copy nested lists?",
          "answer": "No. It makes a shallow copy of the outer list; nested objects remain shared."
        }
      ],
      "practice": "Create a function that receives a list of expense amounts and returns a new list with a 10% fee added to each amount. Do not mutate the caller's list. Demonstrate this with id() and an empty input; explain why your output is independent."
    },
    {
      "highlight": "Choose a collection from its invariants and access pattern. Big-O is a model for growth, not a stopwatch prediction.",
      "sections": [
        [
          "Define the collection contract",
          "A list preserves order and allows duplicates; a tuple is an immutable sequence; a set enforces uniqueness; a dict maps unique hashable keys to values. Before selecting one, write down the operations required: positional access, append, membership, uniqueness, or key-based retrieval."
        ],
        [
          "Complexity with the reason attached",
          "List indexing is O(1), while membership search is O(n) because a general list may need to inspect each element. Appending is amortized O(1): occasional resizing is more expensive, but averaged across many appends the cost is constant. Inserting at index zero is O(n) because existing elements shift. Dict/set membership is average O(1) under ordinary hashing assumptions, not an unconditional worst-case guarantee."
        ],
        [
          "Specialized structures solve specific workloads",
          "Use collections.Counter for frequency counts, defaultdict for grouped accumulation, and deque for efficient additions/removals at both ends. These are not automatically better for every task: first state the required operation, then choose the abstraction that makes the invariant clear."
        ],
        [
          "Measure memory and benchmark carefully",
          "sys.getsizeof reports an object's shallow size and does not include all objects it refers to. Compare realistic datasets and include construction plus access costs. Avoid optimizing based on a tiny sample or assuming one implementation's layout is a language guarantee."
        ]
      ],
      "syntaxNotes": [
        [
          "items[i]",
          "Indexed access to a list or tuple; list/tuple indexing is O(1)."
        ],
        [
          "value in items",
          "Membership test; O(n) for a list, average O(1) for a set/dict key lookup."
        ],
        [
          "dict.get(key, default)",
          "Returns a value or default without raising KeyError when the key is absent."
        ],
        [
          "collections.Counter(values)",
          "Counts hashable values and provides a purpose-built frequency mapping."
        ],
        [
          "collections.deque()",
          "Double-ended queue; efficient append/pop operations at either end."
        ]
      ],
      "workedExample": {
        "title": "Count categories without repeated scans",
        "code": "from collections import Counter\n\ncategories = [\"food\", \"travel\", \"food\", \"supplies\", \"food\"]\ncounts = Counter(categories)\nprint(counts[\"food\"])       # 3\nprint(counts.most_common(2)) # [('food', 3), ('travel', 1)]\n\n# Equivalent core idea, written manually:\nmanual = {}\nfor category in categories:\n    manual[category] = manual.get(category, 0) + 1\nprint(manual[\"food\"])       # 3",
        "explanation": [
          "The Counter approach directly expresses the task: frequency counting.",
          "The manual version reveals the underlying algorithm: one pass, updating one key per item.",
          "For n categories in the input, the loop performs n updates; dictionary updates are average constant-time, giving expected O(n) work under normal hashing assumptions.",
          "Counter is a standard-library tool, not magic: understanding the manual version helps debug and adapt it."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Why is `item in a_list` generally O(n)?",
          "answer": "In the general case Python may have to compare the target with each list element until it finds a match or reaches the end."
        },
        {
          "question": "What does amortized O(1) append mean?",
          "answer": "Most appends are constant-time and occasional resizing is more expensive; averaged across a long sequence of appends, the cost per append is constant."
        },
        {
          "question": "When is deque a better fit than a list?",
          "answer": "When the workload frequently adds or removes items from both ends, such as a queue."
        }
      ],
      "practice": "Implement a category counter manually from 100 sample transactions, then refactor it to Counter. Compare the results, add a category that never appears, and explain list membership versus set membership for a repeated lookup workload."
    },
    {
      "highlight": "A Python str is text; bytes are encoded data. Crossing that boundary requires an explicit encoding decision.",
      "sections": [
        [
          "Unicode text and encoded bytes",
          "A Python str contains Unicode text. A bytes value is a sequence of byte values. Encoding maps text to bytes using a codec such as UTF-8; decoding interprets bytes using a codec. The same text can produce different bytes under different encodings, and malformed bytes may fail decoding."
        ],
        [
          "Characters, code points and visible glyphs",
          "len(str) counts Python string elements (Unicode code points in typical use), not necessarily user-perceived grapheme clusters. A visible character can be made from a base character plus combining marks. UTF-8 byte length is a separate count; never assume len(text) equals len(text.encode('utf-8'))."
        ],
        [
          "File boundaries and error policy",
          "When reading a text file, specify encoding where the format is known. If data may be malformed, decide whether to reject it, replace invalid sequences, or report it for correction. Silent replacement can be acceptable for some display-only pipelines but is risky for identifiers and audit data."
        ],
        [
          "Normalize only when the domain requires it",
          "Visually identical strings can have different Unicode representations. Normalization can help comparisons, but it is a domain decision: preserve original text for display/audit and normalize comparison keys consistently where appropriate."
        ]
      ],
      "syntaxNotes": [
        [
          "str",
          "Unicode text object; not a byte array."
        ],
        [
          "bytes",
          "Immutable sequence of byte values, often used for encoded files and network payloads."
        ],
        [
          "text.encode('utf-8')",
          "Encodes Unicode text into UTF-8 bytes."
        ],
        [
          "payload.decode('utf-8')",
          "Decodes bytes as UTF-8; invalid sequences can raise UnicodeDecodeError."
        ],
        [
          "open(path, encoding='utf-8')",
          "Opens a text file using an explicit codec, avoiding dependence on a platform default."
        ]
      ],
      "workedExample": {
        "title": "Round-trip a non-ASCII value",
        "code": "label = \"café\"\npayload = label.encode(\"utf-8\")\nrestored = payload.decode(\"utf-8\")\n\nprint(type(label).__name__)       # str\nprint(type(payload).__name__)     # bytes\nprint(len(label))                 # 4\nprint(len(payload))               # 5\nprint(restored == label)          # True",
        "explanation": [
          "The accented é is one Python string element in this example, so the text length is four.",
          "UTF-8 encodes é using more than one byte, so the payload length is five.",
          "Decoding with the matching codec reconstructs the original text.",
          "A successful round trip checks this sample, but robust file handling should also test invalid byte sequences and define an error policy."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "What does encode do, and what does decode do?",
          "answer": "encode converts text (str) into bytes using a codec; decode interprets bytes as text using a codec."
        },
        {
          "question": "Why can UTF-8 byte length exceed len(text)?",
          "answer": "UTF-8 uses a variable number of bytes per code point; non-ASCII code points often require multiple bytes."
        },
        {
          "question": "Should malformed bytes always be silently replaced?",
          "answer": "No. Choose a policy based on the data's purpose; rejecting or logging malformed identifiers may be safer than silently changing them."
        }
      ],
      "practice": "Read a UTF-8 text file containing accented names. Print both its decoded text and encoded byte length. Add a malformed-byte test and document whether your program rejects, replaces, or reports it."
    },
    {
      "highlight": "A function has an input/output contract and a scope. Defaults are evaluated once when the function is defined.",
      "sections": [
        [
          "Function contract and return values",
          "A function should state what inputs it accepts, what it returns, and what side effects it performs. `return` exits the function and passes a value to the caller; falling off the end returns None. Distinguish printing a result from returning it: printed text is for a human or console, while a returned value can be reused by other code."
        ],
        [
          "Arguments and parameter binding",
          "Positional arguments bind by position; keyword arguments bind by parameter name. Use keyword-only parameters when optional settings would be ambiguous. *args gathers extra positional arguments into a tuple; **kwargs gathers extra keyword arguments into a dict. These are collection mechanisms, not a substitute for a clear function signature."
        ],
        [
          "Mutable default trap",
          "Default expressions are evaluated when the def statement runs, not freshly for each call. A default list can therefore be shared across calls. Use None as the sentinel and create a fresh list inside the function when the caller omitted the argument."
        ],
        [
          "LEGB scope and closures",
          "A name is resolved through Local, Enclosing, Global, then Built-in scopes. Assignment inside a function normally binds a local name unless declared global/nonlocal. Passing values explicitly often makes dependencies easier to test than relying on global state."
        ]
      ],
      "syntaxNotes": [
        [
          "def name(arg):",
          "Defines a function; its indented body runs when called."
        ],
        [
          "return value",
          "Ends the current function call and provides a result to the caller."
        ],
        [
          "parameter=None",
          "Common sentinel pattern for optional mutable inputs; create the fresh mutable object inside."
        ],
        [
          "*args / **kwargs",
          "Collect extra positional arguments into a tuple and extra keyword arguments into a dictionary."
        ],
        [
          "nonlocal name",
          "Declares that assignment should rebind a name in the nearest enclosing function scope."
        ]
      ],
      "workedExample": {
        "title": "Make independent defaults and return a value",
        "code": "def add_tag(tag, tags=None):\n    if tags is None:\n        tags = []\n    tags.append(tag)\n    return tags\n\nfirst = add_tag(\"urgent\")\nsecond = add_tag(\"later\")\nprint(first)   # ['urgent']\nprint(second)  # ['later']\n\n# The caller can also pass an existing list:\nshared = [\"finance\"]\nresult = add_tag(\"review\", shared)\nprint(shared)  # ['finance', 'review']",
        "explanation": [
          "None marks the absence of a supplied list; it is not used as the working list itself.",
          "The function creates a fresh list for each omitted argument, so the first two calls do not share state.",
          "When the caller explicitly passes a list, this implementation mutates that list. That side effect is part of the function contract and should be documented or redesigned if mutation is not intended.",
          "The function returns the list rather than printing it, allowing callers to store, test or transform the result."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "What does a function return if it has no explicit return statement?",
          "answer": "None."
        },
        {
          "question": "Why is `def f(items=[])` often a bug?",
          "answer": "The list default is created once at function definition time and reused by calls that omit the argument."
        },
        {
          "question": "What is the difference between print and return?",
          "answer": "print writes a representation to an output stream; return provides a value to the caller and ends the function."
        }
      ],
      "practice": "Write `summarize_expenses(records, threshold=...)` to return total and count without printing. Add an optional category list safely, call it twice without that list, and test empty records, zero amount and a missing category. State the function's contract."
    }
  ],
  "excel": [
    {
      "highlight": "Excel formulas form a dependency graph. References should move only when the underlying business input should move.",
      "sections": [
        [
          "Formula anatomy and calculation",
          "A formula begins with `=` and evaluates references, operators, constants and functions. Excel tracks precedent/dependent relationships and recalculates affected formulas. Operator precedence matters; use parentheses to make intended grouping explicit rather than relying on a reader to remember the order."
        ],
        [
          "Reference translation when copied",
          "Relative A1 references adjust by the number of rows/columns moved. `$A$1` locks both axes; `$A1` locks the column; `A$1` locks the row. Decide which references are inputs that should vary per record and which are shared assumptions."
        ],
        [
          "Circular references and intentional iteration",
          "A circular reference exists when a formula depends on itself directly or through a chain. It is often a design mistake, such as a total cell included in its own sum range. Iterative calculation can be appropriate for specific financial models, but it changes workbook calculation behavior and needs documented convergence assumptions."
        ],
        [
          "Audit a result instead of guessing",
          "Use Trace Precedents/Dependents and Evaluate Formula to inspect how a result is built. Check whether source cells are numeric or text and whether number formatting is disguising a unit mismatch. Validate with a hand-calculated small case."
        ]
      ],
      "syntaxNotes": [
        [
          "=B2*$F$1",
          "Multiplies a row-specific value by a fixed assumption cell."
        ],
        [
          "$A$1",
          "Absolute reference: locks column A and row 1 when copied."
        ],
        [
          "$A2 / A$2",
          "Mixed references: lock only the column or only the row."
        ],
        [
          "=SUM(C2:C10)",
          "Aggregates a range; range endpoints should exclude the output cell to avoid self-reference."
        ],
        [
          "Evaluate Formula",
          "Steps through formula evaluation to expose an incorrect intermediate reference or operation."
        ]
      ],
      "workedExample": {
        "title": "Copy a tax calculation down safely",
        "code": "A2 = Unit price\nB2 = Quantity\nF1 = Tax rate (e.g. 8%)\nC2 = A2*B2\nD2 = C2*$F$1\nE2 = C2+D2\n\nFill C2:E2 down for the next transaction.",
        "explanation": [
          "C2 uses relative references because each row has its own price and quantity; when copied down, the references should become A3 and B3.",
          "D2 keeps the tax assumption anchored at $F$1 while its subtotal reference changes by row.",
          "E2 adds subtotal and tax. A hand check with price 100, quantity 2, tax 8% should produce subtotal 200, tax 16 and total 216.",
          "If the total formula is placed inside the range it sums, Excel may report a circular reference; check the output cell is outside its input range."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "When copied one row down, how does `=B2*$F$1` change?",
          "answer": "It becomes `=B3*$F$1`: B2 is relative, while the absolute F1 reference remains fixed."
        },
        {
          "question": "What is the difference between `$A2` and `A$2`?",
          "answer": "$A2 locks the column but lets the row move; A$2 lets the column move but locks the row."
        },
        {
          "question": "Why should iterative calculation not be enabled as a reflexive fix?",
          "answer": "It can mask a mistaken circular dependency and introduces calculation settings/convergence behavior that must be intentional and documented."
        }
      ],
      "practice": "Build a 5-row expense calculation with unit price, quantity, tax rate and total. Fill formulas down, audit one row with Evaluate Formula, and intentionally create then fix a circular reference. Record the expected and actual results."
    },
    {
      "highlight": "A Table gives a range a schema: named columns, consistent records and references that expand with new rows.",
      "sections": [
        [
          "Shape source data like a dataset",
          "Use one header row, one record per row and one field per column. Avoid merged cells, blank separator rows and multiple unrelated tables in one rectangle. This tidy structure makes filters, formulas, charts and future Power Query work more reliable."
        ],
        [
          "Create and name a Table",
          "Convert the source range to an Excel Table and give it a descriptive name such as Expenses. Tables expand when records are added and can carry calculated-column formulas down. Confirm that the header names are unique and meaningful."
        ],
        [
          "Structured reference anatomy",
          "`Expenses[Amount]` refers to the Amount column; `Expenses[@Amount]` refers to the current row's Amount within a table formula. Special specifiers such as `[#Headers]` and `[#Totals]` select table parts. Structured references adjust as table rows are added or removed."
        ],
        [
          "Named ranges as semantic labels",
          "A defined name can identify a cell, range or formula. A name like TaxRate communicates the role of an assumption better than `$F$1`. Workbook scope and worksheet scope differ, so resolve duplicate names deliberately."
        ]
      ],
      "syntaxNotes": [
        [
          "Ctrl+T / Insert > Table",
          "Converts a selected data range into a structured Table in supported Excel versions."
        ],
        [
          "Expenses[Amount]",
          "References the full Amount column of the named table."
        ],
        [
          "Expenses[@Amount]",
          "References the Amount value in the current row of a table formula."
        ],
        [
          "=SUM(Expenses[Amount])",
          "Totals a table column and includes appended rows as the table expands."
        ],
        [
          "Name Manager",
          "Creates, edits and audits defined names and their scope."
        ]
      ],
      "workedExample": {
        "title": "Create an expandable expense register",
        "code": "Table: Expenses\nColumns: Date | Category | Owner | Amount\n\nTotal spend:\n=SUM(Expenses[Amount])\n\nTravel spend:\n=SUMIFS(Expenses[Amount],Expenses[Category],\"Travel\")\n\nCurrent row flag (inside table):\n=[@Amount]>500",
        "explanation": [
          "Convert the raw rows to a Table named Expenses and verify that the field names match the formulas exactly.",
          "The total and category subtotal use full-column structured references, so new table records are included as the table grows.",
          "The current-row reference `[@Amount]` is useful in a calculated column because each row evaluates against its own amount.",
          "Append a new record and verify both totals update. A fixed range such as C2:C100 may silently omit later rows."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "What is the structural advantage of one record per row?",
          "answer": "It gives each row a consistent record shape, enabling reliable filtering, aggregation, formulas and data import."
        },
        {
          "question": "What does `Expenses[@Amount]` mean inside a table formula?",
          "answer": "The Amount value for the current row."
        },
        {
          "question": "Why are structured references often more maintainable than fixed ranges?",
          "answer": "They use table and field names and adjust as table records are added or removed."
        }
      ],
      "practice": "Create an Expenses table with at least 10 records and a named TaxRate assumption. Add a total, a category SUMIFS, and a calculated column that flags amounts over a threshold. Append records and verify formulas expand."
    },
    {
      "highlight": "Conditional aggregation is criteria-driven. Keep the criteria ranges aligned and make the meaning of each criterion explicit.",
      "sections": [
        [
          "Build conditional aggregations in pairs",
          "SUMIFS uses the sum range first, then one or more criteria-range/criteria pairs. COUNTIFS uses criteria pairs to count matching rows; AVERAGEIFS averages values for matching records. For clean results, each criteria range should align to the same row set and have compatible dimensions."
        ],
        [
          "Understand criteria strings",
          "A criterion can be a value, cell reference, or expression such as `\">=100\"`. When combining an operator with a cell value, concatenate the operator and reference, for example `\">=\"&G1`. Dates should be compared as actual Excel date serial values, not ambiguous text."
        ],
        [
          "Branching and error behavior",
          "IF evaluates one condition; IFS evaluates conditions in order, so order matters when ranges overlap. IFERROR catches any error and returns a fallback, but can hide broken references or type errors. Use IFNA when only a missing lookup result should be handled."
        ],
        [
          "Lookup assumptions",
          "VLOOKUP searches the leftmost column of its table array and returns a specified column index. Inserting or rearranging columns can make the index wrong. Exact-match mode should be explicit for identifiers; modern XLOOKUP can separate lookup and return arrays but is version-dependent."
        ]
      ],
      "syntaxNotes": [
        [
          "SUMIFS(sum_range, range1, criteria1, ...)",
          "Adds values whose corresponding records satisfy every criteria pair."
        ],
        [
          "COUNTIFS(range1, criteria1, ...)",
          "Counts records satisfying all supplied criteria pairs."
        ],
        [
          "IF(test, true_value, false_value)",
          "Returns one branch based on a logical test."
        ],
        [
          "IFNA(value, fallback)",
          "Handles #N/A specifically, leaving other errors visible."
        ],
        [
          "VLOOKUP(key, table, col_index, FALSE)",
          "Looks in the table's first column and requests an exact match."
        ]
      ],
      "workedExample": {
        "title": "Reconcile a three-condition monthly report",
        "code": "=SUMIFS(Expenses[Amount],\n        Expenses[Category],\"Travel\",\n        Expenses[Month],\"Jan\",\n        Expenses[Owner],\"Mina\")\n\n=IF(B2>=1000,\"Review\",\"OK\")\n\n=IFNA(XLOOKUP(E2,People[ID],People[Name]),\"Unknown ID\")",
        "explanation": [
          "The SUMIFS formula adds Amount only where Category is Travel, Month is Jan and Owner is Mina; the conditions are ANDed.",
          "Check that the month and owner fields use consistent values and that Amount contains numeric values, not text imported from a CSV.",
          "The IF formula creates an explicit review rule. Test values immediately below, at and above 1000 to verify the boundary.",
          "The XLOOKUP example handles only a missing ID with IFNA; other errors remain visible for diagnosis. If your Excel version lacks XLOOKUP, use an exact-match alternative supported by that version."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Are SUMIFS criteria pairs combined as OR or AND?",
          "answer": "AND: a record must satisfy every criteria pair to be included."
        },
        {
          "question": "How do you create a criterion meaning greater than or equal to the value in G1?",
          "answer": "Use a concatenated criterion such as `\">=\"&G1`."
        },
        {
          "question": "Why might IFERROR be less appropriate than IFNA for a missing lookup?",
          "answer": "IFERROR hides all error types; IFNA handles only #N/A and leaves unrelated formula defects visible."
        }
      ],
      "practice": "Build a monthly expense report using category, month and owner criteria. Add a review flag with IF, and a lookup for an owner name. Test missing IDs, amounts stored as text, criteria boundary cases and one intentionally broken reference."
    },
    {
      "highlight": "Formatting communicates; validation guides entry. Neither substitutes for correct underlying values or a deliberate data-quality process.",
      "sections": [
        [
          "Separate value from display",
          "A date or currency format changes how a stored number is displayed; it does not transform text into a real date or number. Imported data may look numeric while being stored as text. Check the underlying type before using it in arithmetic or date logic."
        ],
        [
          "Conditional formatting as a signal",
          "Rules evaluate values or formulas over a specified Applies To range. Relative references can shift across that range, so test the top-left cell logic and verify the range boundaries. Use formatting sparingly and pair color with labels or icons when the distinction matters."
        ],
        [
          "Validation rules and user guidance",
          "Data Validation can restrict entries to a list, number, date or custom formula. Add an input message that states the expected value and an error alert that tells users how to correct invalid input. Some paste/import paths can bypass validation, so inspect incoming data separately."
        ],
        [
          "Design for audit and accessibility",
          "Use consistent number formats, clear units and descriptive headings. Avoid merged cells in data tables. Do not rely on color alone to communicate status, and make the workbook's assumptions and allowed inputs easy to find."
        ]
      ],
      "syntaxNotes": [
        [
          "Format Cells > Number",
          "Controls display format; does not convert a text value into a number."
        ],
        [
          "Conditional Formatting > New Rule",
          "Creates a rule and an Applies To range; validate relative/absolute references."
        ],
        [
          "Data Validation > List",
          "Restricts normal cell entry to values in a source list."
        ],
        [
          "=CategoryList",
          "Can reference a named range as a validation-list source in supported Excel configurations."
        ],
        [
          "Stop-style error alert",
          "Blocks ordinary invalid entries and explains correction; pasted/imported data still needs validation."
        ]
      ],
      "workedExample": {
        "title": "Build a controlled category input",
        "code": "1. Place allowed categories in a small reference list.\n2. Define the name CategoryList for that range.\n3. Select the Category cells in the expense register.\n4. Data > Data Validation > Allow: List.\n5. Source: =CategoryList\n6. Add an input message and a clear error alert.\n7. Apply a conditional format to flag Amount > budget threshold.",
        "explanation": [
          "A single maintained list reduces category spelling variants that would otherwise split totals across labels.",
          "The validation dropdown helps a person choose a valid value, while the error alert explains what to do if they type something else.",
          "Test typing an invalid value and also test pasting a value; validation behavior can differ across data-entry routes.",
          "The conditional format should identify the relevant row/cell and be backed by a numeric rule, not by manually colored cells."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Does applying Currency format convert text like `\"125\"` into a number?",
          "answer": "No. Number formatting changes display; convert and validate the underlying value separately."
        },
        {
          "question": "Why should conditional-format rules be tested at the top-left cell of their range?",
          "answer": "Relative references are interpreted from the rule's anchor and shift across the Applies To range."
        },
        {
          "question": "Is Data Validation a complete guarantee that all imported records are valid?",
          "answer": "No. It guides normal entry but can be bypassed by paste/import workflows; validate source data independently."
        }
      ],
      "practice": "Create a category list and validation dropdown, plus a date validation rule and an over-budget conditional format. Test valid, invalid, pasted, blank and boundary inputs. Write a short data-entry guide for another user."
    }
  ],
  "powerbi": [
    {
      "highlight": "A connection choice determines how data is accessed, secured and refreshed. Choose it from requirements, not convenience alone.",
      "sections": [
        [
          "Start from the source contract",
          "Record where the data lives, who owns it, what credentials are permitted, whether the source schema is stable, and how often data changes. A report's freshness promise cannot exceed the refresh and source-access design."
        ],
        [
          "Import and DirectQuery are different trade-offs",
          "Import stores a refreshed copy in the semantic model; report interactions query that model, while source changes appear after a successful refresh. DirectQuery sends supported queries to the source and depends on its performance, capacity and network. Neither mode is universally best."
        ],
        [
          "Choose connectors and credentials deliberately",
          "Use a connector designed for the source (SQL, workbook, web, folder). Check authentication, privacy levels and gateway requirements before building the report. Do not embed credentials or personal secrets in query text."
        ],
        [
          "Folder combine and schema drift",
          "Combining files from a folder assumes a consistent file structure. Inspect the sample transformation and test missing columns, extra columns, blank files and malformed rows. A production pipeline should fail visibly or handle drift intentionally rather than silently dropping data."
        ]
      ],
      "syntaxNotes": [
        [
          "Get Data",
          "Starts the connector workflow; select the source type and provide its location and credentials."
        ],
        [
          "Import",
          "Loads a data copy into the model; data freshness depends on refresh."
        ],
        [
          "DirectQuery",
          "Queries the source for supported operations; monitor source workload and query latency."
        ],
        [
          "Privacy levels",
          "Help govern how Power Query combines data sources; set them based on actual data sensitivity."
        ],
        [
          "Folder connector",
          "Combines files most reliably when their schema and layout are consistent."
        ]
      ],
      "workedExample": {
        "title": "Select a connection mode for a daily sales report",
        "code": "Requirement: 18 months of sales history\nSource: governed SQL database\nNeed: interactive slicing; data refreshed once each morning\n\nEvaluate:\n- Import: model size, scheduled refresh, refresh duration\n- DirectQuery: source capacity, query latency, network dependency\n- Both: credential/gateway configuration and access policy\n\nDecision record: document freshness, volume, performance and security trade-offs.",
        "explanation": [
          "A morning-updated report may fit Import if the model size and refresh window are acceptable; this is a hypothesis to test, not an automatic answer.",
          "DirectQuery may be needed for fresher source values or particular governance requirements, but interactive report queries then depend on the source.",
          "Validate using a representative dataset and typical report interactions. Measure refresh duration and visual response, then record the reason for the chosen mode.",
          "Keep source credentials out of code and test the actual published refresh path if deployment is part of the exercise."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Does an imported model automatically include every source update?",
          "answer": "No. The data copy changes after a successful refresh; visual refresh alone does not reload imported source data."
        },
        {
          "question": "What practical dependency increases with DirectQuery?",
          "answer": "The report's supported query interactions depend on source performance, network and capacity."
        },
        {
          "question": "What should you test before combining a folder of files?",
          "answer": "Schema consistency and behavior for missing/extra columns, empty files and malformed records."
        }
      ],
      "practice": "Connect Power BI to a small workbook or CSV sample. Document the source and credentials approach, choose Import for the exercise, then explain what would have to change if users required near-real-time values. Test a file with one missing field."
    },
    {
      "highlight": "Power Query is a repeatable transformation pipeline. Each step should have a clear reason and a verifiable effect on rows, columns and types.",
      "sections": [
        [
          "ETL and query responsibility",
          "Extract obtains records from the source; transform standardizes and shapes them; load places the result in the model. Keep source acquisition separate from business logic when that separation improves reuse and auditability."
        ],
        [
          "Applied Steps as a transformation log",
          "Power Query records operations as ordered steps. Rename columns, promote headers, set types, filter rows, split or combine columns and remove errors with an explicit policy. Inspect intermediate output when row counts or values change unexpectedly."
        ],
        [
          "Data profiling before aggregation",
          "Check column quality, distribution and profile; compare row counts before and after filters. Confirm whether blank, null, error and zero have different meanings. Avoid deleting data merely because it is inconvenient to visualize."
        ],
        [
          "Incremental refresh is a model/service feature",
          "Incremental refresh uses date/time parameters and partition policies to limit the portion of a large table refreshed after initial load. It requires compatible filtering and service configuration; test folding and refresh behavior rather than assuming desktop preview proves the published policy works."
        ]
      ],
      "syntaxNotes": [
        [
          "Applied Steps",
          "An ordered record of transformations applied to the query."
        ],
        [
          "Changed Type",
          "Sets a column's data type; verify locale-sensitive dates and decimals."
        ],
        [
          "Filter Rows",
          "Keeps rows matching a condition; inspect whether the operation folds to the source."
        ],
        [
          "Reference query",
          "Creates a query based on another query's result, useful for separating raw and curated layers."
        ],
        [
          "RangeStart / RangeEnd",
          "Date/time parameters commonly used in incremental-refresh filtering patterns."
        ]
      ],
      "workedExample": {
        "title": "Build and validate a small clean-up pipeline",
        "code": "Source\n→ Promote Headers\n→ Rename Columns\n→ Set Data Types\n→ Remove Blank Rows\n→ Filter invalid/test records\n→ Load to model\n\nValidation log:\nRows at source: ______\nRows after cleaning: ______\nNulls in required key: ______\nDate range after filter: ______",
        "explanation": [
          "Record the starting row count before transforming so that removed rows can be explained.",
          "Set data types intentionally; locale-sensitive dates and decimal separators can be misread during automatic detection.",
          "Every filter should be tied to a requirement and its removed-row count should be reviewed, not merely accepted.",
          "For incremental refresh, use a date/time column and validate the filter/partition design in the target service configuration."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Why is an Applied Step sequence more than a history list?",
          "answer": "It is the repeatable transformation logic rerun when the query refreshes."
        },
        {
          "question": "What should you check when a filter unexpectedly removes many rows?",
          "answer": "Inspect the filter condition, source values, nulls/types and before/after row counts to establish whether removal is intended."
        },
        {
          "question": "Does setting RangeStart and RangeEnd parameters alone complete incremental refresh?",
          "answer": "No. The date filter and incremental policy must be configured correctly and validated in the published semantic model/service."
        }
      ],
      "practice": "Take a messy CSV with inconsistent headers, a date column and blank rows. Build a transformation sequence, record row counts at each material step, and explain the policy for nulls and invalid dates. Then outline the extra configuration needed for incremental refresh."
    },
    {
      "highlight": "Visual design starts with the analytical question and data grain. Filters are part of the query context, so their scope and interactions matter.",
      "sections": [
        [
          "Define the question and grain",
          "Before choosing a visual, state the question (trend, comparison, composition, KPI or detail) and what one row in the underlying data represents. A chart can be visually polished yet analytically wrong if the grain or aggregation is misunderstood."
        ],
        [
          "Map the question to a visual",
          "A line chart is suited to ordered time trends; a sorted bar chart compares categories; a card communicates a single summarized KPI; a table supports record-level inspection. Label units and periods and avoid implying precision the data does not contain."
        ],
        [
          "Understand filter scopes",
          "A visual-level filter affects one visual; a page-level filter affects visuals on a page; a report-level filter affects the report. A slicer exposes a filter control to readers. Verify cross-filter/highlight interactions and make reset behavior understandable."
        ],
        [
          "Check accessibility and interpretation",
          "Use descriptive titles, adequate contrast, readable text, logical tab order and meaningful alt text where supported. Do not rely on color alone. Use appropriate axis scales and sort order, and distinguish missing data from zero."
        ]
      ],
      "syntaxNotes": [
        [
          "Card visual",
          "Displays a single measure or value in the current filter context."
        ],
        [
          "Line chart",
          "Plots values against an ordered axis such as date/time."
        ],
        [
          "Bar chart",
          "Compares categories; sort by the measure or meaningful category order."
        ],
        [
          "Slicer",
          "A visible interactive filter control for report readers."
        ],
        [
          "Visual/page/report filter",
          "Filter scopes differ; inspect each scope and how filters interact."
        ]
      ],
      "workedExample": {
        "title": "Design a two-page report from four business questions",
        "code": "Overview page\n- KPI card: total sales for selected period\n- Line chart: sales by week, chronological axis\n- Bar chart: sales by region, descending order\n- Slicer: reporting period\n\nDetail page\n- Table: order date, order ID, region, amount\n- Slicer: region\n- Drill/selection behavior: test intentionally",
        "explanation": [
          "The KPI card summarizes; its value changes with the active filter context, so its title should state the metric and period.",
          "The trend chart needs a real date/week field sorted chronologically; text week labels can sort incorrectly.",
          "The bar chart answers a category comparison and should be sorted clearly. Keep categories and measures unambiguous.",
          "Test slicer interactions with each visual. If an interaction is intentionally disabled, explain why; otherwise readers may infer that a visual is responding when it is not."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Which visual is a natural starting point for a weekly trend?",
          "answer": "A line chart with a chronological date/week axis."
        },
        {
          "question": "What is the difference between page-level and report-level filters?",
          "answer": "A page filter applies to visuals on that page; a report filter applies across report pages."
        },
        {
          "question": "Why should you identify data grain before building a chart?",
          "answer": "It determines what each record represents and prevents accidental double-counting or invalid aggregation."
        }
      ],
      "practice": "Create a two-page report: overview with a KPI, trend and regional comparison; detail with a transaction table. Add a date slicer, test each visual's interaction, label units and periods, and submit a short design rationale."
    },
    {
      "highlight": "Data types, categories and sort keys are model metadata. Correct metadata protects aggregation and presentation semantics.",
      "sections": [
        [
          "Set and verify types",
          "Whole number, decimal, fixed decimal, date, text and Boolean types support different operations. Set types in Power Query where practical and verify the loaded model. An ID that happens to contain digits is often a text identifier, not a quantity to sum."
        ],
        [
          "Categorization is metadata, not data cleaning",
          "Data categories such as city, country/region, URL or postal code tell Power BI how to interpret a field for particular features. Apply a category only when the values actually represent that concept, and consider whether map features expose sensitive location information."
        ],
        [
          "Sort by column and uniqueness",
          "Text month names sort alphabetically by default. A numeric month number can provide calendar order, but each displayed label must map consistently to one sort value. If data spans multiple years, use a YearMonth key or date grain so repeated month names do not collapse distinct periods."
        ],
        [
          "Validate after load",
          "Check column types, distinct counts, blank values, relationships and a few manually verified records. Metadata errors can produce confusing totals, wrong axes or unexpected visuals; fix them in the model/query layer rather than patching each chart."
        ]
      ],
      "syntaxNotes": [
        [
          "Data type",
          "Controls valid operations and aggregation behavior; verify after import."
        ],
        [
          "Data category",
          "Metadata describing fields such as city, country, URL or postal code."
        ],
        [
          "Sort by column",
          "Uses a separate sort field to order a display column."
        ],
        [
          "MonthNumber",
          "A numeric key from 1 to 12; suitable for month labels only when the label-to-sort mapping is unambiguous."
        ],
        [
          "ID as text",
          "Treats identifiers as labels rather than numeric measures."
        ]
      ],
      "workedExample": {
        "title": "Sort month labels and avoid multi-year ambiguity",
        "code": "MonthName | MonthNumber\nJan       | 1\nFeb       | 2\nMar       | 3\n...\nDec       | 12\n\nFor a single year:\nSelect MonthName → Sort by column → MonthNumber\n\nFor multiple years, use a YearMonth label/key such as 2026-01\nand sort by a date or numeric YearMonth key.",
        "explanation": [
          "MonthName is text and would otherwise sort alphabetically rather than January-to-December.",
          "MonthNumber gives a calendar sort order only when each label maps to one number; it does not distinguish January 2025 from January 2026.",
          "For a multi-year trend, use a date column or a unique YearMonth field and sort key so the chronology is preserved.",
          "After changing metadata, verify the actual axis and a sample total rather than assuming the visual updated as intended."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Why should a numeric-looking order ID often be typed as text?",
          "answer": "It identifies a record; arithmetic or numeric aggregation on it usually has no business meaning and may strip leading zeros."
        },
        {
          "question": "When is MonthNumber alone insufficient as a sort key?",
          "answer": "When multiple years are represented and month labels repeat; use a unique chronological key such as YearMonth/date."
        },
        {
          "question": "What is the purpose of a data category?",
          "answer": "It provides semantic metadata that helps Power BI interpret a column for supported features; it does not clean or validate the underlying values."
        }
      ],
      "practice": "Import a table with IDs, dates, month names and location fields. Set appropriate data types and categories, build a month axis, and demonstrate the difference between one-year and multi-year sorting. Record the checks you used to confirm no IDs were summed."
    }
  ]
};
for (const [trackId, lessonSet] of Object.entries(phase1TutorRebuild)) {
  lessonSet.forEach((content, index) => {
    const lesson = foundationLessons[trackId][index];
    lesson.highlight = content.highlight;
    lesson.sections = [...lesson.sections, ...content.sections];
    lesson.syntaxNotes = content.syntaxNotes;
    lesson.workedExample = content.workedExample;
    lesson.knowledgeCheck = content.knowledgeCheck;
    lesson.practice = content.practice;
  });
}



guidedLessons[1].syntaxNotes = [
 ["box-sizing: border-box","Includes padding and border in declared width and height."],
 ["display: flex","Arranges children along a main axis and cross axis."],
 ["display: grid","Creates a two-dimensional row/column layout."],
 ["gap","Sets consistent gutters between layout items."],
 ["min-width: 0","Allows a flex/grid child to shrink below its min-content width."]
];
guidedLessons[1].workedExample = {
 title:"Build a responsive card gallery",
 code:"*, *::before, *::after {\\n  box-sizing: border-box;\\n}\\n.gallery {\\n  display: grid;\\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));\\n  gap: 1rem;\\n}\\n.card { min-width: 0; }",
 explanation:["The universal rule makes sizing include padding and borders.","Grid adapts the number of columns to available space.","The minmax/min combination avoids forcing cards wider than a narrow container.","min-width: 0 helps long content shrink; test long strings and images too."]
};
guidedLessons[1].knowledgeCheck = [
 {question:"When is Flexbox a natural fit compared with Grid?",answer:"Flexbox arranges items primarily along one axis; Grid manages rows and columns together."},
 {question:"What does border-box include in the declared width?",answer:"Content, padding and border."},
 {question:"What can min-width: 0 prevent?",answer:"A flex/grid child being held wider than its available space by its automatic min-content size."}
];
guidedLessons[1].practice += " Add a long unbroken title and a wide image to a card. Test at 320px, tablet and desktop widths, then explain the sizing rules that prevent overflow.";

guidedLessons[2].sections.push(
 ["7. Prototype chains","Objects can delegate property lookup to a prototype. If a property is not found on the object itself, JavaScript checks its prototype and continues until null. Classes are syntax built on this prototype model. Use Object.hasOwn(obj, key) to distinguish own properties from inherited ones."],
 ["8. ES modules","Use export to expose bindings and import to consume them in another file. Named exports are imported by name; a default export is imported under a local name. Modules have their own scope and run in strict mode. In browsers, load the entry script with type=\"module\" and use a development server."],
 ["9. Map and Set","Map stores key-value entries with keys of any type and methods such as set, get, has and size. Set stores unique values and supports membership checks and de-duplication. Use Map for dynamic keyed collections and Set when uniqueness is the main requirement."]
);
guidedLessons[2].syntaxNotes.push(
 ["Object.hasOwn(obj, key)","Returns true only if the property belongs directly to obj, not its prototype."],
 ["export / import","Defines and consumes explicit module bindings."],
 ["new Map() / new Set()","Creates keyed or unique-value collections; use their methods rather than bracket lookup."]
);
guidedLessons[2].workedExample = {
 title:"Closure state, Map lookup and module exports",
 code:"const makeCounter = () => {\\n  let count = 0;\\n  return () => ++count;\\n};\\nconst next = makeCounter();\\nconsole.log(next(), next()); // 1 2\\n\\nconst cache = new Map();\\ncache.set(\"user-7\", { name: \"Ari\" });\\nconsole.log(cache.has(\"user-7\")); // true\\n\\n// math.js: export const double = n => n * 2;\\n// app.js: import { double } from \"./math.js\";",
 explanation:["The returned inner function closes over count after makeCounter returns.","Each makeCounter call creates a separate lexical environment.","Map entries are managed through set/get/has methods, not ordinary object property access.","The comments show a named export and its matching import in separate files."]
};
guidedLessons[2].knowledgeCheck.push(
 {question:"How does lookup work when an object lacks a property?",answer:"The runtime follows its prototype chain until the property is found or the chain ends at null."},
 {question:"When is Map a better fit than a plain object?",answer:"For dynamic key-value collections with arbitrary key types and collection methods."},
 {question:"What do export and import do?",answer:"They define and consume a module's public bindings."}
);
guidedLessons[2].practice += " Add a Map cache and split one function into a separate ES module with a named export. Explain the difference between a closure's retained binding and a Map entry.";

guidedLessons[3].syntaxNotes = [
 ["Promise.all(items.map(async ...))","Waits for independent async callback results; fulfillment values preserve input order."],
 ["for...of with await","Runs async operations sequentially when order or bounded concurrency matters."],
 ["event.target.closest(selector)","Finds the nearest matching ancestor, useful for delegated event handling."],
 ["addEventListener(type, handler)","Registers a listener; attach to a stable ancestor to handle dynamic descendants."],
 ["min-width: 0","Allows a flex/grid child to shrink when content-based minimum sizing causes overflow."]
];
guidedLessons[3].workedExample = {
 title:"Delegate clicks for a dynamic list",
 code:"list.addEventListener(\"click\", event => {\\n  const button = event.target.closest(\"[data-action]\");\\n  if (!button || !list.contains(button)) return;\\n  handleAction(button.dataset.action);\\n});",
 explanation:["One listener on the stable list container can handle items added later.","closest handles clicks on nested icons or spans inside an action button.","contains ensures the matching element belongs to this list.","Validate the action before it triggers sensitive behavior."]
};
guidedLessons[3].knowledgeCheck = [
 {question:"What does map(async callback) return?",answer:"An array of Promises; use Promise.all for independent operations or for...of with await for sequential work."},
 {question:"Why use event delegation for dynamic list items?",answer:"A stable ancestor listener can handle events from current and future matching descendants."},
 {question:"What are the main event propagation phases?",answer:"Capture travels toward the target, then target handling occurs, and bubbling travels back through ancestors when the event bubbles."}
];
guidedLessons[3].practice += " Add an async action to a dynamically created list item. Choose concurrent or sequential execution, add an error path and test clicks on a nested icon.";

const pbiExamples=[
 "Source: governed SQL tables\\nConnect: select connector and configure credentials\\nCompare: Import refresh cadence vs DirectQuery freshness/source load\\nValidate: row counts, types and refresh behavior",
 "Source → Promote Headers → Rename Columns → Set Types → Remove Blank Rows → Filter Invalid Records → Load\\nInspect each step and compare row counts before and after transformations.",
 "Weekly sales trend → line chart with ordered week axis\\nCompare regions → sorted bar chart\\nPeriod total → KPI card with date context\\nInspect transactions → detail table and slicer",
 "MonthName | MonthNumber\\nJan | 1\\nFeb | 2\\n... | ...\\nDec | 12\\nSelect MonthName → Sort by column → MonthNumber"
];
foundationLessons.powerbi.forEach((lesson,i)=>{ lesson.code=pbiExamples[i]; lesson.workedExample.code=pbiExamples[i]; });

guidedLessons[0].sources = ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML"];
guidedLessons[1].sources = ["https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox"];
guidedLessons[2].sources = ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises"];
guidedLessons[3].sources = ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_events"];

const fullStackPhaseLessons = {
  1: [
    {
      "title": "TypeScript: types, narrowing and generics",
      "lead": "Add a checked type layer to JavaScript: model data shapes, narrow uncertain values, and write reusable functions without discarding useful type information.",
      "highlight": "TypeScript checks relationships between values before runtime; it does not validate external data at runtime. Treat parsed API input as unknown until it has been checked.",
      "keyPoints": [
        "Use interfaces or type aliases to describe contracts.",
        "Prefer unknown over any for untrusted values.",
        "Narrow unions with runtime checks before accessing variant-specific fields.",
        "Generics preserve the connection between input and output types."
      ],
      "sections": [
        [
          "Types describe contracts",
          "A type annotation documents what a value is expected to contain. TypeScript infers many local types, so annotate public boundaries and non-obvious contracts rather than mechanically adding annotations everywhere."
        ],
        [
          "Narrowing turns uncertainty into safe access",
          "A union such as string | number cannot use string-only methods until control flow proves the value is a string. typeof, equality checks, in, and discriminant properties help narrow. A type assertion only tells the compiler to trust you; it performs no runtime check."
        ],
        [
          "Generics preserve relationships",
          "A generic function uses a type parameter to express a relationship, for example that the returned value has the same type as the supplied value. Constraints such as T extends { id: string } limit which values are accepted while retaining their specific type."
        ],
        [
          "Utility types transform existing contracts",
          "Partial<T> makes properties optional; Pick<T, K> selects keys; Omit<T, K> removes keys; Readonly<T> prevents reassignment through that type. Use these to derive related shapes, but avoid exposing internal database records as public API contracts without review."
        ]
      ],
      "code": "type User = { id: string; name: string; role: 'admin' | 'member' };\\n\\nfunction getDisplayName<T extends { name: string }>(item: T): string {\\n  return item.name.trim();\\n}\\n\\nfunction describeInput(value: unknown): string {\\n  if (typeof value === 'string') return value.toUpperCase();\\n  if (typeof value === 'number') return value.toFixed(2);\\n  return 'Unsupported input';\\n}\\n\\ntype UserSummary = Pick<User, 'id' | 'name'>;",
      "syntaxNotes": [
        [
          "type User = { ... }",
          "Defines a structural object type; a value must have compatible properties to be assigned to User."
        ],
        [
          "'admin' | 'member'",
          "A string-literal union restricts role to these exact values."
        ],
        [
          "<T extends { name: string }>",
          "Declares a generic type parameter and constrains it to values with a string name property."
        ],
        [
          "value: unknown",
          "Accepts any input but requires narrowing before using it as a specific type."
        ],
        [
          "typeof value === 'string'",
          "A runtime check that also narrows value to string inside that branch."
        ],
        [
          "Pick<User, 'id' | 'name'>",
          "Creates a type containing only the selected User properties."
        ]
      ],
      "workedExample": {
        "title": "Safely read a field from unknown input",
        "code": "function readName(payload: unknown): string {\\n  if (typeof payload !== 'object' || payload === null || !('name' in payload)) {\\n    return 'Anonymous';\\n  }\\n  const name = payload.name;\\n  return typeof name === 'string' ? name : 'Anonymous';\\n}",
        "explanation": [
          "The parameter is unknown because data from a network or JSON parse has not yet earned a trusted type.",
          "The object and null checks prevent invalid property access; the in operator checks whether the key exists.",
          "The property itself is checked as a string before returning it. A production validator should also verify all required fields and allowed values."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Does `payload as User` validate an API response?",
          "answer": "No. It is a compile-time assertion only. Validate untrusted data at runtime, then use the validated result."
        },
        {
          "question": "Why use a generic return type instead of `any`?",
          "answer": "A generic can preserve the input-output type relationship, while any disables important checking."
        }
      ],
      "practice": "Create a generic `first<T>(items: T[]): T | undefined` function. Then write a `parseRole(value: unknown)` validator that accepts only 'admin' or 'member'. Test empty arrays, valid values, and unexpected inputs.",
      "sources": [
        "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
        "https://www.typescriptlang.org/docs/handbook/2/generics.html"
      ]
    },
    {
      "title": "React hooks, state and data fetching",
      "lead": "Build predictable interactive components using state, effects, reusable hooks, controlled inputs, context, and query-state management.",
      "highlight": "Render should remain pure: derive UI from props and state. Use effects to synchronize with external systems, not as a default place to calculate values.",
      "keyPoints": [
        "Hooks run at the top level of function components or custom hooks.",
        "State updates schedule a render; they do not mutate the current render's variable.",
        "Controlled inputs keep the displayed value in React state.",
        "Effects need accurate dependencies and cleanup when synchronizing external resources."
      ],
      "sections": [
        [
          "Component and render model",
          "A React component is a function of its inputs. React calls it to describe the UI, then reconciles the result with the previous render. Keep rendering free of side effects so it can be repeated safely."
        ],
        [
          "State and event handlers",
          "useState provides a value and setter. When next state depends on previous state, use the updater form: setCount(current => current + 1). Event handlers are the natural place for user-triggered changes."
        ],
        [
          "Effects and custom hooks",
          "useEffect synchronizes with something outside React, such as a subscription or browser API. Dependencies must include reactive values used by the effect. Return cleanup to unsubscribe or cancel work. A custom hook packages reusable stateful behavior while following the same hook rules."
        ],
        [
          "Context and server state",
          "Context shares values across a subtree, such as theme or authenticated-user display data; it is not automatically a full state-management strategy. Remote data has lifecycle concerns—loading, errors, freshness, caching, retries, and invalidation—so a query library can be more suitable than hand-written effects for larger apps."
        ]
      ],
      "code": "import { useEffect, useState } from 'react';\\n\\nexport function SearchBox() {\\n  const [query, setQuery] = useState('');\\n  const [results, setResults] = useState<string[]>([]);\\n\\n  useEffect(() => {\\n    const controller = new AbortController();\\n    async function load() {\\n      if (!query.trim()) { setResults([]); return; }\\n      const response = await fetch('/api/search?q=' + encodeURIComponent(query), { signal: controller.signal });\\n      if (!response.ok) throw new Error('Search failed');\\n      const data = await response.json();\\n      setResults(Array.isArray(data.results) ? data.results : []);\\n    }\\n    load().catch(error => { if (error.name !== 'AbortError') console.error(error); });\\n    return () => controller.abort();\\n  }, [query]);\\n\\n  return <input value={query} onChange={event => setQuery(event.target.value)} />;\\n}",
      "syntaxNotes": [
        [
          "useState('')",
          "Initializes state and returns the current value plus a setter."
        ],
        [
          "useEffect(() => { ... }, [query])",
          "Runs synchronization after render and reruns when query changes; cleanup runs before resynchronizing and on unmount."
        ],
        [
          "AbortController",
          "Provides a cancellation signal so obsolete requests can be stopped."
        ],
        [
          "value={query}",
          "Makes the input controlled: its displayed value comes from component state."
        ],
        [
          "onChange={event => setQuery(...)}",
          "Updates state from the user's input event; the setter causes a new render."
        ]
      ],
      "workedExample": {
        "title": "Avoid a stale state update",
        "code": "setCount(current => current + 1);",
        "explanation": [
          "The updater receives the latest queued state value, avoiding reliance on a potentially stale captured variable.",
          "Use this form when calculating next state from previous state, especially when multiple updates can be queued."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Should a derived `fullName` usually be copied into state with an effect?",
          "answer": "No. Calculate it during render from the source state or props unless there is a specific synchronization reason."
        },
        {
          "question": "Why does an effect need cleanup for a subscription?",
          "answer": "Cleanup prevents obsolete subscriptions from continuing after dependencies change or the component unmounts."
        }
      ],
      "practice": "Build a controlled task form with title and priority fields. Add a custom `useOnlineStatus` hook that subscribes to the browser online/offline events and cleans up its listeners. Explain which state is local and which data is remote.",
      "sources": [
        "https://react.dev/reference/react/useState",
        "https://react.dev/reference/react/useEffect",
        "https://react.dev/learn/reusing-logic-with-custom-hooks"
      ]
    },
    {
      "title": "Next.js App Router and rendering strategies",
      "lead": "Understand the route tree, server and client component boundaries, data fetching, caching, and mutation workflows in a modern Next.js application.",
      "highlight": "Server Components are the default in the App Router. Add a Client Component boundary only where browser interactivity or client-only APIs are needed.",
      "keyPoints": [
        "Folders and files define routes and layouts in the App Router.",
        "Server Components can access server-side resources without shipping that code to the browser.",
        "Client Components are needed for state, event handlers, and browser APIs.",
        "Cache and revalidation behavior must be explicit and appropriate to the data's freshness needs."
      ],
      "sections": [
        [
          "App Router structure",
          "The app directory uses nested folders for route segments. page files define route UI, layout files share persistent UI, and loading/error boundaries provide route-level states. Keep shared layouts focused so navigation remains coherent."
        ],
        [
          "Server versus Client Components",
          "A Server Component renders on the server and can fetch private data without exposing credentials to the browser. A file marked 'use client' creates a client boundary for hooks, event handlers, and browser APIs. Keep that boundary as small as practical and never pass secrets into client props."
        ],
        [
          "Rendering and cache choices",
          "Static generation can pre-render content that changes infrequently. Dynamic server rendering is useful when output depends on request-time data. Incremental regeneration and cache revalidation can refresh cached output. The correct choice depends on freshness, personalization, and operational requirements—not on a blanket rule that one mode is always fastest."
        ],
        [
          "Mutations and revalidation",
          "Server Actions can handle form submissions on the server. Validate input and authorize the user at the mutation boundary. After a successful write, revalidate affected paths or tags so subsequent reads reflect the new state. UI optimism improves perceived speed but must reconcile with server errors."
        ]
      ],
      "code": "// app/tasks/page.tsx — Server Component\\nimport { getTasks } from '@/lib/tasks';\\nimport { TaskForm } from './task-form';\\n\\nexport default async function TasksPage() {\\n  const tasks = await getTasks();\\n  return (\\n    <main>\\n      <h1>Tasks</h1>\\n      <TaskForm />\\n      <ul>{tasks.map(task => <li key={task.id}>{task.title}</li>)}</ul>\\n    </main>\\n  );\\n}\\n\\n// app/tasks/task-form.tsx — Client Component\\n'use client';\\nimport { useState } from 'react';\\nexport function TaskForm() {\\n  const [title, setTitle] = useState('');\\n  return <form><input value={title} onChange={e => setTitle(e.target.value)} /></form>;\\n}",
      "syntaxNotes": [
        [
          "app/tasks/page.tsx",
          "The file location maps to the /tasks route in the App Router."
        ],
        [
          "async function TasksPage()",
          "A Server Component can be async and await server-side data access."
        ],
        [
          "'use client'",
          "Marks a module as a Client Component entry point; place it before imports in that file."
        ],
        [
          "tasks.map(... key={task.id})",
          "Maps records to UI and supplies a stable key so React can track list items across updates."
        ]
      ],
      "workedExample": {
        "title": "Validate and revalidate after a server mutation",
        "code": "'use server';\\nimport { revalidatePath } from 'next/cache';\\n\\nexport async function createTask(formData: FormData) {\\n  const title = String(formData.get('title') ?? '').trim();\\n  if (!title || title.length > 120) throw new Error('Invalid title');\\n  // Authenticate, authorize, and persist the task here.\\n  revalidatePath('/tasks');\\n}",
        "explanation": [
          "The server directive marks the exported function as a Server Action.",
          "Input is normalized and checked before the persistence step; production code should return a user-safe validation result rather than expose raw exceptions.",
          "Authentication and authorization belong on the server near the operation, not only in the UI.",
          "revalidatePath requests refreshed data for the route after a successful write."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Does importing a server-only database module into a Client Component make it safe?",
          "answer": "No. Keep database access server-side and pass only the data the client needs."
        },
        {
          "question": "When is revalidation useful?",
          "answer": "After a mutation changes data used by a cached route or data tag, revalidation helps subsequent reads show the updated state."
        }
      ],
      "practice": "Create an App Router task route with a shared layout, server-rendered task list, small controlled client form, and validated Server Action. Add loading and error states, then document whether the list should be cached and how it is refreshed.",
      "sources": [
        "https://nextjs.org/docs/app",
        "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
        "https://nextjs.org/docs/app/building-your-application/caching"
      ]
    },
    {
      "title": "Node.js APIs: routing, validation and dependency injection",
      "lead": "Design a maintainable HTTP API by separating transport concerns, validation, application logic, and infrastructure dependencies.",
      "highlight": "A request body is untrusted input. Validate it at the boundary, authorize the requested operation, and return deliberate status codes and safe error messages.",
      "keyPoints": [
        "Middleware runs in a defined order and can handle cross-cutting concerns.",
        "Keep route handlers thin; move business rules into service functions.",
        "Validate request parameters and bodies at runtime.",
        "Use dependency injection to make services testable and replaceable."
      ],
      "sections": [
        [
          "HTTP request lifecycle",
          "A client sends a method, path, headers, and possibly a body. The server matches a route, runs middleware, invokes the handler, and returns a status, headers, and response body. Middleware ordering matters: parsing must happen before validation, and error middleware must be able to catch downstream failures."
        ],
        [
          "REST resource design",
          "Model endpoints around resources and use HTTP methods consistently: GET reads, POST creates or invokes a non-idempotent operation, PUT replaces, PATCH partially updates, and DELETE removes. Choose status codes deliberately, such as 201 for creation, 400 for invalid input, 401 for missing authentication, 403 for forbidden access, and 404 for missing resources."
        ],
        [
          "Runtime validation and errors",
          "Static TypeScript types disappear at runtime. A schema validator such as Zod can parse incoming JSON and provide a typed result. Keep validation errors distinct from unexpected server failures; log diagnostic details internally while returning a stable, non-sensitive error shape."
        ],
        [
          "Dependency injection and tests",
          "Pass repositories, clocks, and external clients into service constructors or functions rather than importing global singletons everywhere. This makes behavior easier to test with fakes and helps isolate domain logic from Express or Nest transport details."
        ]
      ],
      "code": "import express from 'express';\\nimport { z } from 'zod';\\n\\nconst app = express();\\napp.use(express.json());\\nconst CreateTask = z.object({ title: z.string().trim().min(1).max(120) });\\n\\napp.post('/api/tasks', async (req, res, next) => {\\n  try {\\n    const input = CreateTask.parse(req.body);\\n    // Authenticate and authorize before writing.\\n    const task = await taskService.create(input);\\n    res.status(201).json({ data: task });\\n  } catch (error) { next(error); }\\n});",
      "syntaxNotes": [
        [
          "app.use(express.json())",
          "Registers middleware that parses JSON request bodies before route handlers."
        ],
        [
          "z.object({ ... })",
          "Defines a runtime schema for an object payload."
        ],
        [
          "CreateTask.parse(req.body)",
          "Validates the runtime value and returns parsed, typed data; invalid input throws a validation error."
        ],
        [
          "next(error)",
          "Passes an error to Express error-handling middleware."
        ],
        [
          "res.status(201).json(...)",
          "Sends an HTTP response with a creation status and JSON body."
        ]
      ],
      "workedExample": {
        "title": "Keep the route thin with an injected service",
        "code": "function makeCreateTaskHandler(taskService) {\\n  return async (req, res, next) => {\\n    try {\\n      const input = CreateTask.parse(req.body);\\n      const created = await taskService.create(input);\\n      res.status(201).json({ data: created });\\n    } catch (error) { next(error); }\\n  };\\n}",
        "explanation": [
          "The handler receives its service as a parameter rather than reaching into a global dependency.",
          "A test can supply a fake taskService and assert the call and response without connecting to a database.",
          "The production route still needs authentication, authorization, and centralized error mapping."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Why isn't a TypeScript interface enough to validate req.body?",
          "answer": "Interfaces are erased at runtime. Incoming JSON needs runtime validation before it is trusted."
        },
        {
          "question": "What does dependency injection improve here?",
          "answer": "It separates business behavior from infrastructure and allows tests to supply controlled fake dependencies."
        }
      ],
      "practice": "Build GET /api/tasks and POST /api/tasks. Add a runtime schema, centralized error handler, and a service that accepts an injected repository. Test valid input, empty title, oversized title, and repository failure.",
      "sources": [
        "https://expressjs.com/en/guide/using-middleware.html",
        "https://zod.dev/"
      ]
    },
    {
      "title": "PostgreSQL data modeling and ORM workflows",
      "lead": "Translate application requirements into relational tables, constraints, indexes, and safe transactions, then use an ORM without losing sight of the SQL it generates.",
      "highlight": "A schema is an integrity contract, not just a storage layout. Put durable invariants in database constraints and use transactions for multi-step changes that must succeed or fail together.",
      "keyPoints": [
        "Normalize repeated facts and model relationships with keys.",
        "Use constraints to protect data integrity even when application code has bugs.",
        "Indexes speed selected reads but add write and storage costs.",
        "Transactions provide atomicity and isolation boundaries for related operations."
      ],
      "sections": [
        [
          "Relational modeling",
          "Represent entities as tables, rows as records, and columns as attributes. A primary key identifies a row; a foreign key enforces a relationship. A many-to-many relationship usually needs a junction table whose foreign keys point to each side. Normalize to avoid update anomalies, then denormalize only when measured needs justify it."
        ],
        [
          "Constraints and transactions",
          "NOT NULL, UNIQUE, CHECK, and foreign-key constraints encode rules close to the data. A transaction groups statements into one atomic unit. Choose isolation behavior based on concurrency risks; retry serialization failures where appropriate and keep transactions short to reduce lock contention."
        ],
        [
          "Indexes and query behavior",
          "B-tree indexes support many equality and range predicates, but PostgreSQL chooses plans based on statistics and estimated cost. An index is not automatically used for every query. Inspect EXPLAIN (and EXPLAIN ANALYZE in safe environments) and measure representative workloads before adding indexes."
        ],
        [
          "ORMs and migrations",
          "Prisma and Drizzle can improve type-safe access and migration workflows, but the database remains the source of truth for constraints and query performance. Review generated SQL for joins, pagination, and bulk operations. Migrations should be versioned, reviewed, and deployed in a sequence compatible with running application versions."
        ]
      ],
      "code": "CREATE TABLE users (\\n  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\\n  email TEXT NOT NULL UNIQUE\\n);\\n\\nCREATE TABLE tasks (\\n  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\\n  owner_id BIGINT NOT NULL REFERENCES users(id),\\n  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),\\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\\n);\\n\\nCREATE INDEX tasks_owner_created_idx ON tasks(owner_id, created_at DESC);",
      "syntaxNotes": [
        [
          "PRIMARY KEY",
          "Uniquely identifies each row and implies NOT NULL."
        ],
        [
          "REFERENCES users(id)",
          "Creates a foreign-key relationship that prevents an owner_id from referring to a nonexistent user."
        ],
        [
          "UNIQUE",
          "Prevents duplicate values in the constrained column or column set."
        ],
        [
          "CHECK (...)",
          "Rejects rows that violate the declared Boolean condition."
        ],
        [
          "INDEX ... (owner_id, created_at DESC)",
          "Supports queries filtering by owner and ordering by creation time, subject to planner choice and data distribution."
        ]
      ],
      "workedExample": {
        "title": "Make a multi-step operation atomic",
        "code": "BEGIN;\\nUPDATE inventory SET quantity = quantity - 1\\nWHERE sku = 'A-17' AND quantity > 0;\\n-- Application checks that exactly one row was updated.\\nINSERT INTO orders (sku, quantity) VALUES ('A-17', 1);\\nCOMMIT;",
        "explanation": [
          "BEGIN starts a transaction; the changes are not committed independently.",
          "The guarded update prevents decrementing an already-empty inventory row. The application must check the affected-row count and roll back if it is not exactly one.",
          "The insert and inventory decrement commit together, preventing an order from being recorded without the corresponding stock change.",
          "In production, handle rollback on errors and consider concurrent requests and appropriate constraints."
        ]
      },
      "knowledgeCheck": [
        {
          "question": "Why add an index on owner_id and created_at together?",
          "answer": "It may support a common access pattern that filters by owner and sorts newest-first; confirm with a representative query plan."
        },
        {
          "question": "Does an ORM remove the need to understand SQL?",
          "answer": "No. You still need to reason about joins, transactions, constraints, query plans, and generated SQL."
        }
      ],
      "practice": "Design users, tasks, and task_labels tables for a task app with tags. Add primary/foreign keys, uniqueness rules, and one composite index for a stated query. Write a transaction for creating a task and its tags, and explain what should happen if one tag is invalid.",
      "sources": [
        "https://www.postgresql.org/docs/current/ddl-constraints.html",
        "https://www.postgresql.org/docs/current/indexes.html",
        "https://www.postgresql.org/docs/current/tutorial-transactions.html"
      ]
    }
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
    const lessonButton = makeElement("button", "topic-lesson-action", "Open lesson →");
    lessonButton.type = "button";
    lessonButton.addEventListener("click", () => openGuidedLesson(topicIndex, track, phase, index));
    item.append(lessonButton);
    studyTopics.append(item);
  });
  studyProject.textContent = phase.project;
  studyCheckpoints.replaceChildren();
  phase.checkpoints.forEach(checkpoint => studyCheckpoints.append(makeElement("li", "", checkpoint)));
  phaseList.hidden = true;
  phaseStudy.hidden = false;
  const studyNote = phaseStudy.querySelector(".study-note");
  if (studyNote) studyNote.textContent = "Choose a topic to open its learning page. Each page includes the syllabus focus, practical application, and checkpoints for this phase.";
  phaseStudy.scrollTop = 0;
}

document.querySelector("#back-to-roadmap").addEventListener("click", () => {
  phaseStudy.hidden = true;
  phaseList.hidden = false;
  phaseList.scrollTop = 0;
});

function openGuidedLesson(topicIndex = 0, track, phase = track?.phases?.[0], phaseIndex = 0) {
  if (!track || !track.id || !phase) return;
  const authoredLesson = track.id === "fullstack"
    ? (phaseIndex === 0 ? guidedLessons[topicIndex] : fullStackPhaseLessons[phaseIndex - 1]?.[topicIndex])
    : (phaseIndex === 0 ? foundationLessons[track.id]?.[topicIndex] : null);
  const lesson = authoredLesson || {
    title: phase.topics[topicIndex] || "Course topic",
    lead: `Study this topic within ${phase.title}. Use the syllabus checkpoints and applied project to connect the concept to a working implementation.`,
    highlight: "Work from the concept to a small, testable example. Keep the implementation observable: state your assumptions, verify behavior, and record what the result demonstrates.",
    keyPoints: [
      `Core syllabus focus: ${phase.topics[topicIndex] || "Review the topic scope"}.`,
      "Build understanding in small steps: define the problem, identify the relevant concepts, then implement and verify.",
      "Use the phase project as the integration target; avoid treating the topic as an isolated definition."
    ],
    sections: [
      ["Learning objective", `Be able to explain the purpose and main trade-offs of ${phase.topics[topicIndex] || "this topic"} and identify where it belongs in a real application or workflow.`],
      ["Conceptual walkthrough", "Start by writing a one-sentence problem statement. Identify inputs, outputs, constraints, and failure cases. Sketch the flow before coding, then separate responsibilities so each part can be inspected and tested."],
      ["Apply and verify", `Implement a minimal example related to this topic. Check the result against the relevant phase checkpoint: ${phase.checkpoints.join("; ")}. If the behavior differs from your expectation, reduce the example and isolate the assumption that failed.`]
    ],
    practice: `Create a small working example for “${phase.topics[topicIndex]}”. Write down the expected behavior, test at least one normal case and one edge case, and explain how your work contributes to the phase project: ${phase.project}`,
    knowledgeCheck: [
      {question: "What problem does this topic solve in the course project?", answer: "Explain the concrete need it addresses, the inputs and outputs involved, and how you would verify the implementation."},
      {question: "How will you know your implementation is correct?", answer: "Define observable acceptance criteria, run a normal case and an edge case, and compare the results with the relevant phase checkpoint."}
    ]
  };
  lessonReader.replaceChildren();
  const eyebrow = makeElement("p", "eyebrow", `GUIDED LESSON · ${track?.name || "FOUNDATIONS"}`);
  const heading = makeElement("h4", "", lesson.title);
  heading.id = "lesson-title";
  heading.dataset.topicIndex = String(topicIndex);
  const lead = makeElement("p", "lesson-lead", lesson.lead);
  lessonReader.append(eyebrow, heading, lead);
  if (lesson.highlight) {
    const highlight = makeElement("aside", "lesson-highlight");
    highlight.append(makeElement("strong", "", "Key idea"));
    highlight.append(makeElement("p", "", lesson.highlight));
    lessonReader.append(highlight);
  }
  if (Array.isArray(lesson.keyPoints) && lesson.keyPoints.length) {
    const points = makeElement("section", "lesson-key-points");
    points.append(makeElement("h5", "", "Key points to remember"));
    const list = makeElement("ul", "detail-list");
    lesson.keyPoints.forEach(point => list.append(makeElement("li", "", point)));
    points.append(list);
    lessonReader.append(points);
  }
  lesson.sections.forEach(([sectionTitle, sectionBody], index) => {
    lessonReader.append(makeElement("h5", "", `${index + 1}. ${sectionTitle}`));
    lessonReader.append(makeElement("p", "", sectionBody));
  });
  if (lesson.code) {
    const pre = makeElement("pre", "lesson-code");
    pre.append(makeElement("code", "", lesson.code.replace(/\\n/g, "\n")));
    lessonReader.append(pre);
    if (Array.isArray(lesson.syntaxNotes) && lesson.syntaxNotes.length) {
      const syntax = makeElement("section", "lesson-syntax-notes");
      syntax.append(makeElement("h5", "", "Key syntax and concepts explained"));
      const noteList = makeElement("div", "syntax-note-list");
      lesson.syntaxNotes.forEach(([syntaxToken, explanation]) => {
        const note = makeElement("article", "syntax-note");
        note.append(makeElement("code", "syntax-token", syntaxToken));
        note.append(makeElement("p", "", explanation));
        noteList.append(note);
      });
      syntax.append(noteList);
      lessonReader.append(syntax);
    }
  }
  if (lesson.workedExample) {
    const example = makeElement("section", "lesson-worked-example");
    example.append(makeElement("h5", "", lesson.workedExample.title));
    example.append(makeElement("p", "worked-example-label", "Worked example"));
    const exampleCode = makeElement("pre", "lesson-code");
    exampleCode.append(makeElement("code", "", lesson.workedExample.code.replace(/\\n/g, "\n")));
    example.append(exampleCode);
    const explanationList = makeElement("ul", "detail-list");
    lesson.workedExample.explanation.forEach(line => explanationList.append(makeElement("li", "", line)));
    example.append(explanationList);
    lessonReader.append(example);
  }
  if (Array.isArray(lesson.knowledgeCheck) && lesson.knowledgeCheck.length) {
    const check = makeElement("section", "lesson-knowledge-check");
    check.append(makeElement("h5", "", "Quick knowledge check"));
    check.append(makeElement("p", "muted", "Try answering each question before revealing its explanation."));
    lesson.knowledgeCheck.forEach((item, index) => {
      const details = makeElement("details", "knowledge-check-item");
      const summary = makeElement("summary", "", `Question ${index + 1}: ${item.question}`);
      details.append(summary, makeElement("p", "knowledge-check-answer", item.answer));
      check.append(details);
    });
    lessonReader.append(check);
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
  const actions = makeElement("div", "lesson-actions");
  actions.append(completeLessonButton);
  lessonReader.append(actions, lessonFeedback);
  lessonReader.hidden = false;
  activeLessonKey = `learning-studio.lesson.${track.id}.phase${1}.topic${topicIndex}`;
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