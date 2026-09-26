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
let activeStudyContext = null;
const resumeStorageKey = "learning-studio.resume.v1";
const bookmarkStorageKey = "learning-studio.bookmarks.v1";
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
document.querySelector("#browse-curriculum").onclick = () => showView("curriculum");
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

function renderHomePaths() {
  const root = document.querySelector("#home-paths");
  if (!root) return;
  root.replaceChildren();
  tracks.slice(0, 4).forEach(track => {
    const phases = track.id === "fullstack" ? [0,1,2,3] : [0,1];
    const keys = [];
    phases.forEach(pi => (track.phases[pi]?.topics || []).forEach((_,ti) => keys.push("learning-studio.lesson."+track.id+".phase"+(pi+1)+".topic"+ti)));
    const done = keys.filter(key => readSaved(key) === "complete").length;
    const pct = keys.length ? Math.round(done / keys.length * 100) : 0;
    const card = makeElement("article","home-path-card");
    const top = makeElement("div","home-path-card-top");
    const icon = makeElement("span","home-path-icon",track.icon || "✦");
    icon.style.background=track.tint || "#edf2ff"; icon.style.color=track.accent || "#5577c5";
    top.append(icon,makeElement("span","home-path-badge",done ? "In progress" : "Ready to start"));
    const bar=makeElement("div","home-path-meter");bar.setAttribute("role","progressbar");bar.setAttribute("aria-label",track.name+" completion");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(keys.length));bar.setAttribute("aria-valuenow",String(done));
    const fill=makeElement("span","");fill.style.width=pct+"%";bar.append(fill);
    const foot=makeElement("div","home-path-card-foot");
    foot.append(makeElement("small","",done+" / "+keys.length+" tracked topics"));
    const open=makeElement("button","home-path-open","Open path →");open.type="button";open.addEventListener("click",()=>openRoadmap(track));foot.append(open);
    card.append(top,makeElement("h3","",track.name),makeElement("p","",track.description),bar,foot);root.append(card);
  });
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
    const trackedPhases = track.id === "fullstack" ? [0, 1, 2, 3] : [0, 1];
    const trackedKeys = [];
    trackedPhases.forEach(phaseIndex => {
      (track.phases[phaseIndex]?.topics || []).forEach((topic, topicIndex) => {
        trackedKeys.push("learning-studio.lesson." + track.id + ".phase" + (phaseIndex + 1) + ".topic" + topicIndex);
      });
    });
    const done = trackedKeys.filter(key => readSaved(key) === "complete").length;
    const status = makeElement("div", "track-status-row");
    const state = done === trackedKeys.length && trackedKeys.length > 0 ? "Completed" : (done > 0 ? "In progress" : "Ready to start");
    status.append(makeElement("span", "track-status", state), makeElement("span", "track-progress-text", done + " / " + trackedKeys.length + " topics"));
    const progress = makeElement("div", "track-progress", "");
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", track.name + " guided topic completion");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", String(trackedKeys.length));
    progress.setAttribute("aria-valuenow", String(done));
    const progressFill = makeElement("span", "");
    progressFill.style.width = (trackedKeys.length ? (done / trackedKeys.length * 100) : 0) + "%";
    progress.append(progressFill);
    const bottom = makeElement("div", "card-bottom");
    bottom.append(makeElement("span", "", track.phases.length + " learning phases"));
    const button = makeElement("button", "open-track", "View learning path →");
    button.type = "button";
    button.setAttribute("aria-label", `View ${track.name} roadmap`);
    button.addEventListener("click", () => openRoadmap(track));
    bottom.append(button);
    card.append(top, heading, copy, status, progress, bottom);
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
    {
      title: "Your first steps: instructions and algorithms",
      lead: "Start with everyday instructions before touching programming syntax. You will learn what makes a set of steps clear enough for a computer to follow.",
      highlight: "A computer does not guess what you meant. Clear steps and stated assumptions are the beginning of programming.",
      keyPoints: [
        "An algorithm is a step-by-step plan for a task.",
        "A program is a set of instructions expressed for a computer to execute.",
        "The order of steps can change the outcome."
      ],
      sections: [
        ["Start without code", "Imagine explaining how to make a cup of tea to a robot that cannot fill in missing details. What would you need to say? Start by listing actions in order, using ordinary words. There is no Python syntax to memorize in this lesson."],
        ["Make a vague task clearer", "“Get the report ready” leaves questions unanswered. Which report? What does ready mean? A more useful instruction could be: “Open the daily report, check that its date is today, and confirm the file is saved.” Clear instructions describe actions someone can observe."],
        ["Meet the programming words", "An algorithm is the plan: the ordered steps for solving a task. A program is that plan written in a form a computer can execute. In this course, Python will be the language we use to write those instructions."]
      ],
      practice: "Choose a familiar task such as packing your bag. Write 4–6 steps in everyday language. State where you start and what finished looks like. Ask: could a person who does not know your routine follow this without guessing?",
      knowledgeCheck: [
        {question:"Which is the clearest instruction?",answer:"“Check the report” is still vague. “Open the daily report and verify that the date field shows today” names an action and a checkable result."},
        {question:"What is an algorithm?",answer:"A step-by-step plan for completing a task. It can be described without writing code."}
      ]
    },
    {
      title: "Get your Python workspace ready",
      lead: "Set up or verify the tools you will use to write and run Python. You will learn what each tool is for before using it.",
      highlight: "The editor is where you write the instructions; Python runs the saved instructions. These are different jobs.",
      keyPoints: [
        "Python is the language and runtime used in this course.",
        "A code editor helps you create and save a program file.",
        "The terminal or editor run command starts the program."
      ],
      sections: [
        ["What you need", "You need Python 3, a code editor, and a way to run a command or use the editor’s Run action. A terminal is a text-based place to give your computer commands. Do not worry if the word terminal is new; the setup guide will show where to find it on your device."],
        ["Check before installing", "First find out whether Python is already available. Follow the operating-system-specific setup steps in the course setup guide. Use the exact command shown there and compare the result with the expected version output. Do not copy commands from an unrelated device guide."],
        ["If setup fails", "Stop and capture the full error text rather than repeatedly trying random fixes. Record your device and operating system, the command or button you used, and what you expected to happen. This is useful evidence for troubleshooting."]
      ],
      practice: "Complete the setup checklist for your device. Record your operating system, editor name, Python version shown by the setup check, and the method you will use to run a saved script. If setup is blocked, submit the exact error and continue with the lesson’s no-install prediction activity.",
      knowledgeCheck: [
        {question:"What is the editor for?",answer:"It is where you write and save the program text. Python is what executes that saved program."},
        {question:"What should you do if a setup command fails?",answer:"Capture the full error and exact command, note your operating system and expected result, then follow the relevant troubleshooting step or ask for help with that evidence."}
      ]
    },
    {
      title: "Read and run your first tiny program",
      lead: "Meet a tiny Python script with only one new action: displaying a line of text. Predict what it will show, run it, and compare.",
      highlight: "You do not need to understand every symbol yet. First learn to connect one written instruction to one visible result.",
      keyPoints: [
        "A script is a saved file containing instructions.",
        "The print instruction displays text on the screen.",
        "The output is what appears after the script runs."
      ],
      sections: [
        ["Look at the instruction", "Read the example below from left to right. The word print is the instruction name. The text in quotation marks is the message we want displayed. The parentheses hold the message for print. We will explain punctuation and syntax gradually, not all at once."],
        ["Predict before running", "Before pressing Run, write down exactly what you think will appear. Then run the saved file and compare the actual output with your prediction. If the result differs, look carefully at spelling, quotation marks, and whether the file was saved."],
        ["Code versus output", "The instruction you typed is called code. The line displayed after running it is output. Code describes what to do; output is the result you can observe. A program can also do work without printing anything, but for now we use visible output to make the first run easy to verify."]
      ],
      code: "print(\\"Hello, Python!\\")",
      practice: "Create a file named first_steps.py and enter one print instruction that displays your first name or a neutral greeting. Save and run it. Write down the exact output. Then change the displayed message, save again, and run it a second time.",
      knowledgeCheck: [
        {question:"What is output?",answer:"The result displayed by the program when it runs. It is not the same as the code you wrote."},
        {question:"What does print do in this example?",answer:"It displays the text message on the screen. It does not install Python or save the file."}
      ]
    },
    {
      title: "When something goes wrong: first debugging steps",
      lead: "Learn to treat an error as information, not as proof you cannot code. Practice checking one small problem at a time.",
      highlight: "Debugging is a calm loop: notice what happened, inspect the clue, make one change, and run the program again.",
      keyPoints: [
        "An error message is a clue about what went wrong.",
        "Change one thing at a time so you can see what fixed it.",
        "Always rerun after editing to verify the fix."
      ],
      sections: [
        ["A safe first mistake", "In your first_steps.py file, temporarily remove the closing parenthesis from the print line. Save and run it. Python should report a syntax error because the instruction is incomplete. Restore the missing parenthesis, save, and run again."],
        ["Read the clue", "A syntax error means Python cannot understand the way the instruction is written. The message usually points to a location near the problem. The exact wording can vary by Python version and editor. Read the message and inspect the line it identifies instead of guessing."],
        ["Use a repeatable routine", "First reproduce the problem. Next, inspect the full message and the relevant line. Make one small correction. Save and rerun. Finally, compare the new result with what you expected and record what changed."]
      ],
      practice: "Use the deliberate missing-parenthesis mistake. In a short debug note, write what you changed, what error appeared, how you corrected it, and what happened on the successful rerun. Do not leave the file broken when you finish.",
      knowledgeCheck: [
        {question:"After changing a line to fix an error, what must you do?",answer:"Save and run the program again. A fix is not verified until the program is retested."},
        {question:"What does a syntax error usually tell you?",answer:"Python could not understand how some code was written. Use the message and indicated location as clues, then inspect and retest."}
      ]
    }
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


for (const [index, content] of Object.entries({"1":{"sections":[["Cascade layers and maintainable architecture","The cascade considers origin, importance, layer order, specificity, and source order. Specificity is not the only priority. Declare layers deliberately (for example reset, base, components, utilities) so ordering is explicit. For normal declarations within one origin, later layers win; important declarations reverse layer precedence. Inspect the cascade before escalating selector specificity."],["Responsive Grid sizing","repeat() can create tracks based on available space. auto-fill preserves empty repeated tracks; auto-fit collapses empty tracks so occupied tracks can expand. minmax() sets a lower and upper track-size bound. Use minmax(0, 1fr) when content-based minimum sizing causes overflow, and test long text and images."],["Container queries and utility-first CSS","Viewport media queries respond to the browser viewport; container queries let a component adapt to its containing context. Set container-type: inline-size on the query container, then use @container rules. Tailwind expresses CSS decisions as utility classes, but does not remove the need to understand layout, cascade, accessibility or responsive behavior."]],"syntaxNotes":[["box-sizing: border-box","Includes padding and border within declared width/height."],["display: flex; gap: 1rem","Creates a one-dimensional flex layout with consistent spacing."],["repeat(auto-fit, minmax(15rem, 1fr))","Fits tracks to available space and distributes remaining width."],["@layer base, components, utilities","Declares intentional cascade layer order."],["container-type: inline-size; @container (...)","Enables styling based on a component's available inline size."]],"workedExample":{"title":"Responsive cards with component-level adaptation","code":"@layer base, components, utilities;\n@layer base { *, *::before, *::after { box-sizing: border-box; } }\n@layer components {\n  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 1rem; }\n  .card { min-width: 0; }\n  .card-shell { container-type: inline-size; }\n  @container (max-width: 22rem) { .card-content { display: block; } }\n}","explanation":["The layer list sets a deliberate order for normal declarations; it does not make specificity irrelevant within a layer.","Grid adapts the number of columns to the available space. The min() floor avoids forcing a narrow parent wider than its container.","min-width: 0 can remove a flex/grid child's automatic min-content size constraint; oversized media and long strings may still need handling.","The container query responds to the card shell's width, so the same component can adapt in a sidebar and a wide content area."]},"knowledgeCheck":[{"question":"What should you inspect before increasing selector specificity?","answer":"Origin, importance, layer order, specificity and source order—the full cascade."},{"question":"How do auto-fit and auto-fill differ?","answer":"auto-fill can preserve empty tracks; auto-fit collapses empty tracks so occupied tracks can expand."},{"question":"When is a container query useful?","answer":"When a component should respond to its own container width rather than the overall viewport."}],"practice":"Add a cascade layer and container query to the card gallery. Test it in a narrow sidebar and wide content region, and explain auto-fit versus auto-fill."},"2":{"sections":[["Destructuring, spread and rest","Destructuring extracts array items or object properties into local bindings. Spread (...) expands an iterable or copies enumerable object properties; rest collects remaining values. These are shallow operations: nested objects remain shared. A destructuring default applies when the extracted value is undefined, not null."],["Optional chaining and nullish coalescing","Optional chaining (?.) stops a property access or call when the left side is null or undefined, returning undefined. It is not a substitute for validating required data. Nullish coalescing (??) uses a fallback only for null/undefined; unlike ||, it preserves 0, false and the empty string."],["ES modules and CommonJS","Modern browser and Node.js projects commonly use ES modules (import/export); older Node.js packages may use CommonJS (require/module.exports). Runtime and package configuration determine module interpretation and interoperability. Follow the project's configured module system rather than mixing syntax arbitrarily."]],"syntaxNotes":[["const {id = 0} = record","Destructures a property; default applies only when its value is undefined."],["const copy = {...original}","Copies enumerable own properties; nested object values remain shared."],["record?.owner?.name","Safely reads nested properties through null/undefined intermediates."],["count ?? 0","Falls back only for null or undefined, preserving other falsy values."],["import {x} from './module.js'","Imports a named ES module binding."]],"workedExample":{"title":"Safely read a response and preserve module boundaries","code":"const payload = { user: { name: \"Riya\" }, count: 0 };\nconst { user = {} } = payload;\nconst displayName = user?.name ?? \"Guest\";\nconst count = payload.count ?? 10;\nconst copied = { ...payload };\nconsole.log(displayName, count); // Riya 0\nconsole.log(copied.user === payload.user); // true (shallow copy)\n\n// profile.js: export const formatName = name => name.trim();\n// app.js: import { formatName } from \"./profile.js\";","explanation":["Destructuring binds user from payload and uses an empty object only if user is undefined.","Optional chaining prevents an exception if user is nullish; nullish coalescing supplies Guest only when the resulting name is null or undefined.","The count remains 0 because ?? does not treat zero as missing.","Object spread copies the outer object but shares the nested user object reference.","The final comments show a named export and matching import in separate module files."]},"knowledgeCheck":[{"question":"Does object spread perform a deep copy?","answer":"No. It creates a shallow copy; nested references are shared."},{"question":"When does a destructuring default apply?","answer":"When the extracted value is undefined, not when it is null."},{"question":"How is ?? different from ||?","answer":"?? falls back only for null/undefined; || also falls back for 0, false and empty string."}],"practice":"Refactor nested response access using optional chaining and a deliberate fallback. Use destructuring with a default, then spread-copy an object with a nested object and demonstrate the copy is shallow."},"3":{"sections":[["Hoisting and the temporal dead zone","var declarations are function-scoped and initialized to undefined when their scope is entered; reading before assignment can produce a confusing value. let and const are block-scoped but cannot be accessed before their declaration is evaluated—the temporal dead zone. Prefer const by default, let for reassignment, and avoid var in modern code."],["Async map is not an await operation","Array.prototype.map returns an array of callback results. An async callback returns a Promise, so items.map(async ...) produces an array of Promises, not resolved values. For independent work, await Promise.all(items.map(...)); for dependent or deliberately sequential work, use for...of with await. Add bounded concurrency for large batches."],["Event-loop ordering and timers","Synchronous code in the current task runs to completion. Promise reactions and queueMicrotask callbacks run at a microtask checkpoint before the event loop proceeds to another task; timers schedule tasks no earlier than their delay and may run later under load. A zero-delay timer is not immediate."],["Propagation and delegation","Events can travel through capture toward the target and, for bubbling events, back through ancestors. Delegation attaches one listener to a stable ancestor and uses target/closest to identify a descendant. Guard against matching outside the intended container; currentTarget identifies the element holding the listener."],["Layout and cascade debugging","Floats are mainly for text wrapping, not page-wide layout; use Flexbox or Grid for layout relationships. Flex items can resist shrinking because of automatic min-content sizing; min-width: 0 can help, though long strings and media may need additional rules. Inspect cascade priorities before starting a specificity war."]],"syntaxNotes":[["var / let / const","var is function-scoped; let/const are block-scoped. const prevents rebinding, not mutation."],["await Promise.all(items.map(async fn))","Awaits independent async work; fulfillment values preserve input order."],["for...of with await","Runs async operations sequentially."],["queueMicrotask(fn) / Promise.then(fn)","Schedules a microtask for the next microtask checkpoint."],["event.target.closest('[data-action]')","Finds a matching element near the target; verify it belongs to the intended container."]],"workedExample":{"title":"Fix async mapping and delegate dynamic controls","code":"const ids = [1, 2, 3];\nconst pending = ids.map(async id => {\n  const response = await fetch(\"/api/items/\" + id);\n  if (!response.ok) throw new Error(\"HTTP \" + response.status);\n  return response.json();\n});\nconst records = await Promise.all(pending);\n\nlist.addEventListener(\"click\", event => {\n  const action = event.target.closest(\"[data-action]\");\n  if (!action || !list.contains(action)) return;\n  runAction(action.dataset.action);\n});","explanation":["map invokes the callback for each ID and returns an array of Promises immediately.","Promise.all awaits independent requests together and preserves input order. If one rejects, the aggregate rejects; production code should handle errors and consider cancellation or concurrency limits.","fetch does not reject solely because the server returns 404 or 500, so check response.ok before parsing the body.","The stable list listener handles future child buttons; closest also works when the click lands on a nested icon.","The contains guard keeps the handler scoped to this list. Validate the action value before triggering sensitive behavior."]},"knowledgeCheck":[{"question":"What does items.map(async fn) return before awaiting?","answer":"An array of Promises, one for each callback invocation."},{"question":"Why does Promise.all fit independent requests?","answer":"It awaits them concurrently and returns values in input order; a rejection makes the aggregate promise reject."},{"question":"Why might Promise.then run before setTimeout(fn, 0)?","answer":"Promise reactions are microtasks processed at a checkpoint before the event loop proceeds to a later timer task."},{"question":"What guard matters in delegated event handling?","answer":"Confirm the matched element is inside the intended container and validate the action before acting."}],"practice":"Fetch records from an array of IDs using async map and Promise.all; then compare with a sequential for...of loop. Add error handling and a delegated listener for dynamic buttons. Test nested-icon clicks and a failed HTTP response."}})) {
  const lesson = guidedLessons[Number(index)];
  lesson.sections.push(...content.sections);
  lesson.syntaxNotes = content.syntaxNotes;
  lesson.workedExample = content.workedExample;
  lesson.knowledgeCheck = content.knowledgeCheck;
  lesson.practice += " " + content.practice;
}

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
  ],
2: [{"title":"JavaScript engine internals: V8, optimization and garbage collection","lead":"Understand how JavaScript execution, object shapes, optimization and memory reclamation affect real application performance.","highlight":"Treat engine optimization as an observable implementation detail: measure representative workloads before changing code for presumed V8 behavior.","keyPoints":["The engine parses and compiles code; modern engines use multiple execution tiers and may optimize hot paths.","Objects with consistent property layouts are easier for engines to optimize; shape changes can reduce optimization opportunities.","Garbage collection reclaims unreachable memory, but reachable references can still cause leaks.","Use profiling and heap snapshots to distinguish allocation pressure from retained objects."],"sections":[["1. From source to execution","A JavaScript engine parses source into an internal representation, compiles or interprets it, and may optimize frequently executed code. V8 uses tiered execution and feedback from observed types and call patterns. The exact pipeline changes by release; the useful engineering model is that stable, hot code may be optimized and deoptimized when assumptions stop holding."],["2. Hidden classes and inline caches","V8 tracks object layouts using internal shape metadata often called hidden classes or Maps. Creating objects with properties in a consistent order tends to produce compatible shapes. Adding or deleting properties dynamically can cause shape transitions. Inline caches record what kinds of receivers have appeared at a call site; monomorphic sites are simpler to optimize than highly polymorphic ones. These are heuristics, not a rule to sacrifice clarity."],["3. Garbage collection and reachability","Garbage collection finds objects that can no longer be reached from roots such as active stack values and global references. Generational collectors exploit the observation that many objects die young; marking and sweeping are common conceptual phases. Collection timing is not a deterministic API. Releasing a variable does not guarantee immediate memory return to the operating system."],["4. Memory leak versus high allocation","A leak is memory that remains reachable when the application no longer needs it. A high-allocation workload may create many short-lived objects but still be collectible. Common retention causes include event listeners not removed, timers left running, closures retaining large objects, caches without bounds, and detached DOM nodes held by references."],["5. Diagnose with evidence","Reproduce the suspected growth with a repeatable user journey. Record a baseline heap snapshot, perform the journey repeatedly, force GC only when the profiler offers a diagnostic control, then compare snapshots by retained size and retaining paths. In performance profiles, distinguish scripting time, layout, paint, and garbage collection pauses. Avoid concluding a leak from one memory graph alone."],["6. Practical optimization discipline","Keep object construction predictable where it improves clarity, avoid unnecessary per-frame allocations in hot loops, bound caches, and clean up subscriptions. Benchmark before and after using the same browser/runtime, dataset, and interaction sequence. Validate that an optimization does not alter behavior or worsen maintainability."]],"syntaxNotes":[["Hidden class / Map","Engine-internal description of an object's property layout; not the same thing as JavaScript's Map collection."],["Inline cache","Feedback at a property access or call site that helps optimize repeated operations."],["Reachability","Whether an object can still be accessed from live roots; unreachable objects are eligible for collection."],["Retained size","Memory kept alive by an object, including objects reachable only through it."],["Heap snapshot","A point-in-time view of allocated objects and references used to investigate retention."],["Deoptimization","Leaving optimized code when its assumptions no longer hold; profiling is needed to establish whether it matters."]],"code":"// Prefer stable object construction when it matches the domain.\nfunction makePoint(x, y) {\n  return { x, y, visible: true };\n}\n\n// A bounded cache avoids unbounded retention.\nconst cache = new Map();\nconst MAX_ENTRIES = 200;\nfunction remember(key, value) {\n  if (cache.has(key)) cache.delete(key); // refresh insertion order\n  cache.set(key, value);\n  if (cache.size > MAX_ENTRIES) {\n    const oldestKey = cache.keys().next().value;\n    cache.delete(oldestKey);\n  }\n}","practice":"Use browser DevTools to profile a repeatable interaction that creates and removes at least 100 temporary UI items. Capture before/after heap snapshots, inspect retaining paths for any objects that remain, and fix one intentional retention bug (for example, an event listener or timer not cleaned up). Submit screenshots or notes of the evidence, the fix, and a benchmark that confirms behavior is unchanged.","knowledgeCheck":[{"question":"Does garbage collection free every object that your code no longer intends to use?","answer":"No. If a live reference still reaches the object, it remains reachable and cannot be collected."},{"question":"What is an inline cache used for?","answer":"It records feedback about observed receiver shapes at an operation site to help the engine optimize repeated access."},{"question":"What evidence supports calling growth a memory leak?","answer":"Repeated comparable runs show objects retained after they should be gone, with a retaining path that identifies the unintended reference."}],"sources":["https://v8.dev/blog/fast-properties","https://v8.dev/blog/trash-talk","https://developer.chrome.com/docs/devtools/memory-problems"]},{"title":"Advanced React: Fiber, concurrent rendering, Suspense and boundaries","lead":"Reason about render work, responsiveness, component composition and failure isolation in complex React interfaces.","highlight":"Concurrent rendering improves scheduling and responsiveness; it does not make application code execute in parallel or make expensive work free.","keyPoints":["Fiber represents render work as units that React can schedule and prioritize.","Transitions mark non-urgent updates; useDeferredValue can defer expensive dependent rendering.","Error boundaries isolate render-time failures; Suspense coordinates fallback UI for supported suspended work.","Compound components and render props are composition patterns with different API trade-offs."],"sections":[["1. Reconciliation and Fiber mental model","When props or state change, React computes a new UI description and reconciles it with the previous tree. Fiber is React's internal work representation, allowing rendering work to be split and scheduled. A render may be paused, restarted, or discarded before commit. The commit phase applies the accepted changes; effects run according to their lifecycle. Avoid depending on undocumented internal Fiber fields."],["2. Priority and transitions","Urgent updates include typing feedback and direct interactions. A large filtered view or route transition may be non-urgent. useTransition provides a pending flag and a way to mark state updates as transitions. useDeferredValue lets a slower subtree consume a previous value temporarily while the urgent input remains responsive. Neither hook speeds up the computation itself; they let React schedule the work more gracefully."],["3. Suspense and loading boundaries","Suspense displays a fallback when a descendant suspends using a supported Suspense-enabled data source or lazy loading. It is not a generic wrapper that automatically catches any fetch in a useEffect. Place boundaries around meaningful independent regions so one slow panel does not blank the entire page. Coordinate loading states with framework data-fetching conventions."],["4. Error boundaries","An error boundary catches errors thrown while rendering descendants and can show a recovery UI. It does not catch arbitrary event-handler exceptions, every asynchronous callback failure, or server errors by itself. Provide a reset/retry path when the underlying data or route can recover, and log enough context without exposing sensitive information."],["5. Composition: render props and compound components","Render props pass a function to a component so the caller controls part of the rendered output; they are flexible but can create nested callback APIs. Compound components share implicit state through context and let consumers compose parts such as Tabs.List and Tabs.Panel. Document required parent/child relationships, accessibility semantics, keyboard behavior, and what happens when a child is used outside its provider."],["6. Diagnose rather than memoize by reflex","Use React Profiler to identify repeated expensive renders and measure commit durations. First simplify state ownership and avoid unnecessary subscriptions. useMemo and useCallback are performance tools for measured cases, not correctness tools; memoization has its own complexity and dependency maintenance costs."]],"syntaxNotes":[["startTransition","Marks state updates as non-urgent so urgent interactions can be prioritized."],["useDeferredValue(value)","Returns a deferred version of a value that can lag behind during expensive rendering."],["Suspense fallback","UI shown while supported descendant work is suspended."],["Error boundary","Class-based boundary or framework-provided equivalent that catches descendant render errors and displays fallback UI."],["Compound component","A family of coordinated components that share state/context while exposing composable markup."],["Render prop","A function prop used to let a caller determine a component's rendered output."]],"code":"import { useDeferredValue, useState } from 'react';\n\nfunction SearchPanel({ items }) {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const results = items.filter(item =>\n    item.name.toLowerCase().includes(deferredQuery.toLowerCase())\n  );\n  const isStale = query !== deferredQuery;\n\n  return <section aria-busy={isStale}>\n    <label htmlFor=\"filter\">Filter items</label>\n    <input id=\"filter\" value={query} onChange={event => setQuery(event.target.value)} />\n    {isStale && <p role=\"status\">Updating results…</p>}\n    <ul>{results.map(item => <li key={item.id}>{item.name}</li>)}</ul>\n  </section>;\n}","practice":"Create a page with a text input and a deliberately expensive filtered list. Profile the baseline, then compare useDeferredValue or a transition for the non-urgent list update. Add a Suspense boundary around a lazy-loaded panel and an error boundary around a failure-prone widget. Document which errors each boundary catches, measure typing responsiveness, and verify keyboard/accessibility behavior.","knowledgeCheck":[{"question":"Does concurrent rendering mean React renders components on multiple CPU threads?","answer":"No. It is a scheduling model that can yield and prioritize work; it is not general parallel execution of component code."},{"question":"Will Suspense automatically show a fallback for every fetch inside useEffect?","answer":"No. Suspense works with supported suspending data sources and lazy loading; ordinary effect-based fetching needs its own loading state."},{"question":"What errors are not caught by a standard error boundary?","answer":"For example, errors in event handlers and arbitrary asynchronous callbacks are not caught by the render error boundary mechanism."}],"sources":["https://react.dev/reference/react/useTransition","https://react.dev/reference/react/useDeferredValue","https://react.dev/reference/react/Suspense","https://react.dev/reference/react/Component"]},{"title":"Advanced TypeScript: conditional, mapped and template literal types","lead":"Build expressive compile-time contracts and understand variance, declaration merging and the limits of type-level computation.","highlight":"Advanced types describe relationships at compile time; keep runtime validation and public APIs understandable to the people who maintain them.","keyPoints":["Conditional types branch on assignability and can distribute over unions.","Mapped types transform property sets; key remapping can rename or filter keys.","Template literal types construct string unions and infer embedded pieces.","Variance describes how generic types relate under subtyping; mutable positions can make assignments unsafe.","Declaration merging combines compatible declarations in specific namespaces."],"sections":[["1. Conditional types and distribution","A conditional type has the form T extends U ? X : Y. When the checked type is a naked type parameter, the conditional distributes over union members. This behavior is useful for filtering and transforming unions, but can surprise when you expected one combined check. Wrapping the checked type in a tuple, as [T] extends [U], suppresses distribution."],["2. Mapped types and key remapping","A mapped type iterates over keyof T and constructs a new property set. Modifiers can be added or removed with +?/-? and +readonly/-readonly. The as clause remaps keys, often using template literal types; remapping to never omits a key. Use these tools to derive coherent views from one source contract rather than duplicating every field manually."],["3. Template literal types","Template literal types combine literal strings and unions into new string unions. They can model event names, route patterns, or namespaced keys, and infer can extract a portion of a matching string. They are compile-time constraints, not runtime parsers: validate actual user-provided strings separately."],["4. Variance and mutability","Variance describes how substituting a subtype affects a generic type. A producer that only returns T can often be treated covariantly; a consumer that only accepts T can be contravariant under strict function checking. Mutable containers both read and write values, so treating them as freely covariant can be unsound. Understand the input/output positions of callbacks and APIs rather than memorizing one rule."],["5. Declaration merging and augmentation","TypeScript can merge certain declarations with the same name, such as interfaces, and supports module augmentation to extend types from a library. This is useful for adding request context types in Express, but the runtime object still must be attached by middleware. Keep augmentations narrow and document the package/version assumptions."],["6. Maintainable type-level design","Prefer named helper types, focused examples, and explicit public return types for complex APIs. Type-level recursion and huge unions can slow the compiler and produce unreadable diagnostics. Test types with compile-time assertions and include runtime tests for validators because type tests cannot prove incoming data is safe."]],"syntaxNotes":[["T extends U ? X : Y","Conditional type: choose X when T is assignable to U, otherwise Y."],["[T] extends [U]","Tuple wrapping prevents a conditional type from distributing over a union."],["keyof T / mapped type","Produces the keys of T and maps across them to create a derived object type."],["as in a mapped type","Remaps a property key; remapping it to never removes that property."],["`on${Capitalize<K>}`","Template literal type that constructs a new literal key from K."],["Variance","Describes how subtype relationships behave through generic input/output positions."]],"code":"type ApiResult<T> =\n  | { kind: 'ok'; data: T }\n  | { kind: 'error'; message: string };\n\ntype NullableKeys<T> = {\n  [K in keyof T as null extends T[K] ? K : never]: T[K]\n};\n\ntype EventName<K extends string> = `on${Capitalize<K>}`;\ntype UserEvent = EventName<'created' | 'deleted'>; // 'onCreated' | 'onDeleted'\n\ntype UnwrapPromise<T> = T extends Promise<infer U> ? U : T;\ntype A = UnwrapPromise<Promise<number>>; // number\n\ntype NonDistributive<T> = [T] extends [string] ? true : false;","practice":"Create a typed event-emitter contract with event names derived from a union, mapped listener signatures, and a conditional helper that extracts Promise result types. Add a mapped type that makes only nullable fields optional. Write type-level tests for single types and unions, including one case where distribution must be suppressed. Add a short note identifying which runtime values still require validation.","knowledgeCheck":[{"question":"Why can a conditional type return a union of branch results for a union input?","answer":"A conditional type with a naked type parameter distributes over each member of the union."},{"question":"What does remapping a mapped key to never do?","answer":"It omits that property from the resulting mapped type."},{"question":"Can a template literal type validate an HTTP request string at runtime?","answer":"No. It constrains TypeScript-checked source values only; runtime input still needs parsing and validation."}],"sources":["https://www.typescriptlang.org/docs/handbook/2/conditional-types.html","https://www.typescriptlang.org/docs/handbook/2/mapped-types.html","https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html","https://www.typescriptlang.org/docs/handbook/type-compatibility.html","https://www.typescriptlang.org/docs/handbook/declaration-merging.html"]},{"title":"Scalable API design: rate limits, idempotency, webhooks and versioning","lead":"Design resilient HTTP APIs that behave predictably under retries, bursts, asynchronous delivery and contract evolution.","highlight":"Distributed API correctness depends on explicit retry semantics, durable state and observable failure handling—not just choosing an HTTP route.","keyPoints":["Token-bucket rate limiting controls average rate while allowing a configured burst.","Idempotency keys let clients safely retry supported operations without duplicate effects.","Webhooks require signature verification, durable delivery attempts and consumer deduplication.","Versioning must define compatibility and a deprecation path."],"sections":[["1. Rate limiting with token bucket","A bucket stores up to capacity tokens. Tokens refill at a configured rate; each request consumes one or more. If insufficient tokens remain, reject or delay according to policy. A production limiter must define its key (user, API key, tenant, IP), storage, clock behavior, response headers and 429 retry guidance. In a multi-instance service, a process-local counter is not globally consistent; shared storage such as Redis or a gateway may be needed."],["2. Idempotency keys for retryable writes","A client sends a unique key for one logical operation. The server scopes it to the authenticated principal and operation, stores a request fingerprint and result, and returns the same outcome for a repeated matching request. Reuse of the same key with a different payload should be rejected. Store the idempotency record atomically with the business effect, commonly in one database transaction; define expiry and in-progress behavior."],["3. Webhook delivery is at-least-once in practice","A sender should sign a canonical request body with a secret, include a timestamp, and provide a stable event ID. Receivers verify signatures using constant-time comparison, reject stale timestamps within a defined tolerance, persist the event ID to deduplicate, and return success only after durable acceptance. Retries use backoff and a dead-letter or operator-replay path. Consumers must tolerate duplicates and out-of-order events."],["4. API versioning and compatibility","URI versioning (/v1/...) is visible and easy to route; header or media-type versioning keeps URLs stable but is less discoverable. Whichever approach is selected, define what constitutes a breaking change, how long old versions remain supported, how clients are informed, and how contract tests cover each version. Prefer additive optional fields when backward-compatible, but consider strict decoders and generated clients."],["5. Pagination and stable ordering","For large datasets, use cursor pagination with a deterministic ordering key and a tie-breaker such as id. Offset pagination can become expensive at deep offsets and may skip/duplicate rows under concurrent writes. Document page size limits, cursor opacity, filtering behavior, and whether cursors expire."],["6. Operational contract","Expose rate-limit and correlation metadata, collect latency and error metrics by route/version, and avoid logging raw idempotency keys if they could be sensitive. Test bursts, retries, duplicate webhook deliveries, invalid signatures, timeout recovery, and version compatibility under realistic concurrency."]],"syntaxNotes":[["429 Too Many Requests","Status for a request rejected by a rate limit; provide retry guidance when meaningful."],["Token bucket","Rate-limiting algorithm with a maximum burst capacity and a refill rate."],["Idempotency key","Client-supplied identifier for one logical operation, scoped and persisted by the server."],["Request fingerprint","Canonical digest or comparison representation used to detect same-key/different-payload misuse."],["Webhook signature","Cryptographic proof over the request content, verified before processing."],["Cursor pagination","Continuation token representing a stable position in an ordered result set."]],"code":"// Pseudocode for a transactional idempotent create operation.\nBEGIN;\n  INSERT INTO idempotency_records(principal_id, key, request_hash, state)\n  VALUES ($principal, $key, $hash, 'processing')\n  ON CONFLICT (principal_id, key) DO NOTHING;\n\n  -- If the key already exists: compare request_hash.\n  -- Same hash + completed: return stored response.\n  -- Different hash: reject key reuse.\n  -- New key: perform the business write and persist its response.\n  INSERT INTO tasks(owner_id, title) VALUES ($principal, $title)\n  RETURNING id;\n  UPDATE idempotency_records\n  SET state='completed', response_body=$response\n  WHERE principal_id=$principal AND key=$key;\nCOMMIT;","practice":"Extend the Phase 02 task API with a token-bucket rate limiter and idempotency support for task creation. Specify principal/key scope, same-key/different-body behavior, transaction boundaries, expiry and concurrent duplicate handling. Design a webhook event contract with signature, timestamp, event ID, retry/backoff and deduplication. Compare URI and header versioning and write compatibility tests for one old and one new client.","knowledgeCheck":[{"question":"Why is an in-memory per-process rate counter insufficient for a multi-instance deployment?","answer":"Each instance sees only its local requests, so a client can exceed the intended global limit by spreading requests across instances."},{"question":"What should happen when an idempotency key is repeated with a different request body?","answer":"Reject it as conflicting key reuse; do not return or apply an unrelated operation's stored result."},{"question":"Why must webhook consumers deduplicate event IDs?","answer":"Delivery retries can cause the same event to arrive more than once, so processing must avoid duplicate side effects."}],"sources":["https://redis.io/docs/latest/develop/use/patterns/rate-limiting/","https://www.rfc-editor.org/rfc/rfc9110","https://docs.stripe.com/api/idempotent_requests","https://www.rfc-editor.org/rfc/rfc7515"]},{"title":"Database depth: query plans, indexes, pooling, replicas and N+1","lead":"Read execution plans, design indexes from observed access patterns, and understand the operational trade-offs of pooling and read replicas.","highlight":"A query is not optimized because it looks elegant in ORM code; inspect the SQL, plan, row counts and workload behavior.","keyPoints":["EXPLAIN ANALYZE compares estimated and actual execution behavior; inspect rows, loops, buffers and timing.","Composite, partial and covering indexes serve different predicates and retrieval needs.","Connection pools cap concurrent database sessions and reduce connection setup overhead.","Read replicas can lag and do not automatically make reads safe for every consistency requirement.","N+1 queries multiply round trips; eager loading or batched queries can reduce them."],"sections":[["1. Read a query plan systematically","Start with the slow query and its actual parameter distribution. EXPLAIN shows the planner's chosen plan; EXPLAIN ANALYZE executes the statement and reports actual row counts and timings. Compare estimated versus actual rows, inspect repeated loops, scan type, join strategy, sort nodes, and buffer reads. A sequential scan is not inherently bad: for a small table or a query returning much of the table it may be cheaper than an index scan."],["2. Index choices: composite, partial and covering","A composite B-tree index can support filtering and ordering when its leading columns align with the query. A partial index includes only rows satisfying a predicate, useful when queries repeatedly target a selective subset such as active records. INCLUDE columns can cover selected reads without making those columns search keys. Every index adds write, storage and maintenance cost; verify usage and avoid redundant indexes."],["3. Statistics and plan stability","The planner estimates costs using table statistics. Stale or insufficient statistics can lead to poor row estimates and plans. Use ANALYZE appropriately and test representative parameter values; skewed data may make one plan unsuitable for all cases. Avoid hard-coding a plan based on a tiny development dataset."],["4. Connection pooling and PgBouncer","Opening a database connection has overhead and databases have finite connection capacity. A pool reuses connections and bounds concurrency. PgBouncer can pool many application client connections onto fewer server connections; transaction pooling changes session semantics, so features relying on session state or prepared statements must be checked against its configuration and version. Set pool sizes across all app instances, not just per process."],["5. Read replicas and consistency","A replica receives changes from the primary asynchronously in common configurations, so reads may lag. Route analytics or stale-tolerant reads to replicas only when the product can accept that delay. Read-after-write flows, authorization checks, and uniqueness decisions often need the primary or an explicit consistency strategy. Replicas improve read capacity but add operational complexity and do not remove primary write bottlenecks."],["6. Detect and fix N+1","An N+1 pattern performs one query for a parent list and then one query per parent for related data. Instrument query count and latency per request, inspect ORM logs or tracing spans, and reproduce with more than one parent row. Fix with a join/eager load, batch query, or DataLoader-style request-scoped batching; watch join duplication and payload growth."],["7. Constraints versus application checks","Application validation gives useful messages, but concurrent requests can pass the same check simultaneously. Database constraints are the final guard for uniqueness and referential integrity. Keep both: validate for clear feedback and constrain for correctness under races. Handle constraint violations deliberately rather than returning every database error as a 500."]],"syntaxNotes":[["EXPLAIN (ANALYZE, BUFFERS)","Executes a query and reports actual timing/row behavior plus buffer activity; use caution with write statements."],["Partial index WHERE","Indexes only rows meeting a predicate; query predicates must be compatible for planner use."],["INCLUDE","Adds non-key columns to an index for possible index-only retrieval."],["Pool max connections","Maximum simultaneous checked-out connections for a pool; aggregate across app instances."],["Replica lag","Delay between a primary commit and that change becoming visible on a replica."],["N+1","One query for a collection plus one additional query per returned parent record."]],"code":"-- Query pattern: newest open tasks for one owner.\nSELECT id, title, created_at\nFROM tasks\nWHERE owner_id = $1 AND status = 'open'\nORDER BY created_at DESC\nLIMIT 50;\n\n-- Candidate partial composite index; validate with EXPLAIN on real data.\nCREATE INDEX tasks_open_owner_created_idx\nON tasks (owner_id, created_at DESC)\nINCLUDE (title)\nWHERE status = 'open';\n\n-- ORM anti-pattern: loop that fetches each task's labels separately.\n-- Better: one joined/batched query for the page's task IDs.","practice":"Instrument the Phase 02 task list to record query count and request latency. Introduce an intentional N+1, reproduce it with 1, 10 and 50 tasks, then fix it with a join or batch load and compare counts/results. Capture EXPLAIN ANALYZE for a slow filter/sort query, propose a composite or partial index, and explain the plan change. Document connection-pool sizing across multiple app replicas and identify which reads must stay on the primary due to consistency.","knowledgeCheck":[{"question":"Is a sequential scan proof that PostgreSQL is missing an index?","answer":"No. It may be cheaper for small tables or queries returning many rows; assess selectivity, estimates, buffers and actual timings."},{"question":"Why can a read replica return stale data after a successful write?","answer":"Replication is often asynchronous, so the replica may not yet have replayed the committed change."},{"question":"How can you recognize N+1 in traces?","answer":"A request shows one parent-list query followed by a repeated related-data query for each parent item."}],"sources":["https://www.postgresql.org/docs/current/using-explain.html","https://www.postgresql.org/docs/current/indexes.html","https://www.pgbouncer.org/config.html","https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance"]},{"title":"Application security: JWT, OAuth PKCE, CSRF, XSS and secrets","lead":"Threat-model authentication and browser security boundaries, then implement safe token, input, database and secret-handling practices.","highlight":"Security is a set of independent controls: token validation does not replace authorization, output encoding, CSRF defenses or secure secret storage.","keyPoints":["JWTs are signed claims, not encrypted by default; validate signature, issuer, audience, expiry and algorithm policy.","Refresh-token rotation detects reuse and should revoke the token family when replay is detected.","OAuth authorization code flow with PKCE binds the code exchange to the initiating client.","CSRF abuses ambient browser credentials; XSS executes attacker-controlled script in the trusted origin.","Parameterized SQL separates data from executable query syntax; secrets must stay out of source and client bundles."],"sections":[["1. JWT structure and validation","A compact JWT commonly contains a header, payload and signature separated by dots. The payload is readable unless separately encrypted. A verifier must enforce an allowlisted algorithm and validate signature, issuer, audience, expiration and not-before claims as applicable. Never trust a decoded payload before signature verification. Keep access tokens short-lived and minimize sensitive claims."],["2. Refresh-token rotation and replay detection","Store refresh tokens as securely hashed identifiers or otherwise protect them at rest. On each successful refresh, invalidate the presented token and issue a new one linked to the same token family. If an already-rotated token is presented again, treat it as possible replay and revoke the family/session, then require re-authentication. Make rotation atomic so two concurrent refreshes cannot both succeed; define recovery for legitimate parallel tabs."],["3. OAuth 2.0 authorization code with PKCE","The client creates a high-entropy code verifier and derives a code challenge. It sends the challenge with the authorization request; the token exchange includes the original verifier. The authorization server checks that the verifier matches the challenge. Also validate state to bind the response to the initiating browser session and use exact redirect URI matching. PKCE reduces code interception risk but does not protect a compromised client."],["4. CSRF versus XSS","CSRF tricks a browser into sending an authenticated request using credentials automatically attached by the browser, often cookies. Mitigations include SameSite cookie policy, anti-CSRF tokens and origin checks appropriate to the app. XSS injects script into a trusted origin; mitigate with context-aware output encoding, safe templating, careful DOM APIs, sanitization for intentionally allowed HTML, and a restrictive Content Security Policy. CSRF tokens do not fix XSS."],["5. SQL injection and authorization","Build SQL with parameterized values rather than string concatenation. Parameters represent values, not arbitrary identifiers; dynamic table or sort names require a strict allowlist. Enforce authorization in the service/data-access path, scope queries by tenant/user, and use least-privilege database credentials. ORM use is not a guarantee if raw SQL is assembled unsafely."],["6. Secrets management and incident hygiene","Keep credentials out of Git, client bundles, logs, screenshots and error responses. Use environment injection or a secrets manager, restrict access by workload and environment, rotate exposed credentials, and avoid sharing production secrets with local development. Separate public configuration from secrets and plan how a leaked token or key is revoked."],["7. Security verification","Test expired, wrong-audience, wrong-issuer and invalid-signature tokens; refresh replay; missing state or wrong PKCE verifier; cross-site mutation attempts; encoded XSS payloads; SQL metacharacters; and cross-tenant resource IDs. Add dependency scanning and review authorization for every endpoint, not only UI navigation."]],"syntaxNotes":[["JWT claims","Registered or application-defined assertions in the token payload; validate relevant claims and do not assume they are secret."],["exp / iss / aud","Expiration, issuer and audience claims that a verifier should validate according to the application contract."],["PKCE verifier/challenge","A per-authorization high-entropy secret and its derived challenge used to bind the code exchange."],["SameSite cookie","Browser cookie attribute that restricts some cross-site sending; choose Strict/Lax/None based on the flow and pair with other controls."],["Parameterized query","SQL statement with placeholders and separately bound values, preventing values from becoming SQL syntax."],["Least privilege","Grant each component only the permissions needed for its function."]],"code":"// Parameterized query: the title is data, never concatenated into SQL.\nconst result = await db.query(\n  'INSERT INTO tasks(owner_id, title) VALUES ($1, $2) RETURNING id, title',\n  [authenticatedUser.id, validatedTitle]\n);\n\n// Cookie settings are illustrative; adapt to the authentication flow.\nres.cookie('session', sessionToken, {\n  httpOnly: true,\n  secure: true,\n  sameSite: 'lax',\n  path: '/',\n  maxAge: 15 * 60 * 1000\n});\n\n// Never place a private credential in a NEXT_PUBLIC_* variable.","practice":"Write a short threat model for the task application: assets, trust boundaries, attacker capabilities and abuse cases. Design a session/access-token flow with short-lived access tokens and atomic refresh rotation/replay detection. Describe OAuth PKCE state/verifier handling, CSRF and XSS controls, safe parameterized SQL, and server-only secret storage. Add tests for expired and wrong-audience tokens, refresh replay, cross-user access, malicious input and secret leakage in logs.","knowledgeCheck":[{"question":"Does a signed JWT hide its payload?","answer":"No. A typical signed JWT payload is encoded and readable; signing protects integrity, not confidentiality."},{"question":"What is the difference between CSRF and XSS?","answer":"CSRF abuses the browser's automatic credentials to induce a request; XSS runs attacker-controlled script in the trusted origin."},{"question":"Why rotate refresh tokens and detect reuse?","answer":"Rotation limits the lifetime of a stolen token; reuse of an already-rotated token can signal replay and trigger revocation of the token family."}],"sources":["https://www.rfc-editor.org/rfc/rfc7519","https://www.rfc-editor.org/rfc/rfc7636","https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Request_Forgery_Prevention_Cheat_Sheet.html","https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html","https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html"]}],
3: [{"title":"Docker production images and container hardening","lead":"Build a reproducible, lean, non-root container for the Next.js SaaS and verify the production runtime.","highlight":"Build once, run with external configuration, and test the production image—not only the development server.","keyPoints":["Multi-stage builds separate build tooling from runtime artifacts.","Frozen lockfile installs and careful layer ordering improve repeatability and cache reuse.","A minimal image, non-root user and clean context reduce attack surface.","Measure image size and scan the actual artifact."],"sections":[["Container model and layers","An image is an immutable filesystem plus metadata; a container is a running process isolated by the runtime. Dockerfile instructions create layers. Reordering stable steps before frequently changing source lets dependency layers be reused. Treat containers as disposable and keep durable state in managed services or explicit volumes."],["Build context and ignore rules","The build context is sent to the builder. Exclude .git, node_modules, generated output, local .env files, coverage and logs. Keep required lockfiles and safe placeholder examples. Do not rely on .dockerignore as the only secret control: inspect COPY instructions, build arguments, logs and final layers."],["Multi-stage Next.js build","Use a dependency stage with frozen installation, a build stage to compile, and a runtime stage with only production output. Next.js standalone output can reduce copied files, but copy paths depend on project configuration and package manager. Inspect generated output and include required static/public assets."],["Reproducible layers and base images","Use a maintained, deliberately selected base image and the package lockfile. Install with npm ci or the chosen manager's frozen mode. Copy manifests first, install, then copy source. Pinning a digest improves repeatability but requires a process to refresh security fixes."],["Runtime hardening","Run as a dedicated unprivileged user, grant write access only to required paths, use direct process startup and support graceful termination. Supply secrets at runtime, not in image layers. Configure meaningful health checks and resource limits; avoid root-only operations in the final stage."],["Measure and verify","Build and inspect size and layers. The syllabus target is below 150 MB for a Next.js app, but dependencies and assets affect the result; record the actual size and explain deviations. Scan image/dependencies and test startup, login, tenant isolation, CRUD and shutdown."],["Debug container failures","For exit-on-start, inspect logs and entrypoint paths. For missing assets, confirm standalone/static copy paths. For permission errors, identify the exact writable directory and grant narrow ownership. Distinguish startup delay from downstream readiness failures."]],"code":"FROM node:22-alpine AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nFROM node:22-alpine AS build\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\nFROM node:22-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nRUN addgroup -S app && adduser -S app -G app\nCOPY --from=build --chown=app:app /app/.next/standalone ./\nCOPY --from=build --chown=app:app /app/.next/static ./.next/static\nCOPY --from=build --chown=app:app /app/public ./public\nUSER app\nEXPOSE 3000\nCMD node server.js","syntaxNotes":[["FROM … AS","Starts a named build stage."],["COPY --from","Copies selected artifacts from an earlier stage."],["npm ci","Installs from package-lock.json and fails on manifest mismatch."],["--chown","Sets ownership of copied files."],["USER app","Runs the default process as the unprivileged app user."],["CMD","Defines the default process; exec-form array is generally preferred for signal delivery."],[".dockerignore","Filters files from the build context before transfer."]],"workedExample":{"title":"Worked example · Build and run the production image","code":"Build and run the production image\n\nFROM node:22-alpine AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nFROM node:22-alpine AS build\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\nFROM node:22-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nRUN addgroup -S app && adduser -S app -G app\nCOPY --from=build --chown=app:app /app/.next/standalone ./\nCOPY --from=build --chown=app:app /app/.next/static ./.next/static\nCOPY --from=build --chown=app:app /app/public ./public\nUSER app\nEXPOSE 3000\nCMD node server.js","explanation":["The example assumes standalone output is enabled and the build emits server.js; inspect the real artifact and adapt paths.","Keep local credentials out of the context and inject production values when the container starts.","Record image size in consistent units, inspect large layers and scan for vulnerabilities.","A successful build does not prove runtime correctness; test health, authentication, tenant denial and graceful shutdown."]},"practice":"Create the capstone Dockerfile and .dockerignore. Use frozen dependency installation, multi-stage build, non-root runtime and runtime-only secrets. Build/run the image, record size/layers and scan results, then test health, login, CRUD, cross-tenant denial and shutdown. Aim below 150 MB where feasible; explain measured trade-offs if the real dependency stack exceeds the target.","knowledgeCheck":[{"question":"Why use multi-stage builds?","answer":"They keep build tools and development dependencies out of the final runtime image."},{"question":"Where should production secrets be supplied?","answer":"Through the deployment runtime's secret/configuration mechanism, not baked into image layers."},{"question":"What does non-root execution improve?","answer":"It limits the privileges available to a compromised application process."}],"sources":["https://docs.docker.com/build/building/multi-stage/","https://docs.docker.com/build/cache/","https://docs.docker.com/build/building/best-practices/","https://nextjs.org/docs/app/building-your-application/deploying"]},{"title":"CI/CD with GitHub Actions and verified releases","lead":"Automate quality checks and promote a verified build through preview, staging and production with restricted permissions.","highlight":"Deploy only after required checks pass for the exact revision being released; retain traceability and recovery options.","keyPoints":["Run lint, type checks, tests and production build from locked dependencies.","Use least-privilege workflow permissions and protect production environments.","Preview environments require isolated test data and scoped secrets.","Promote an immutable artifact and retain release metadata."],"sections":[["Pipeline and gates","A baseline pipeline checks out source, installs from the lockfile, then runs lint, type checking, unit/integration tests and production build. Each stage must fail visibly. Deployment depends on successful checks for the same commit. Add container build and scan checks for an image-based release."],["Triggers and concurrency","Use pull_request for validation and protected-branch pushes for release. Never expose production secrets to untrusted fork PRs. Concurrency groups prevent competing releases; decide whether new runs cancel old ones or wait. Explicitly separate preview and production conditions."],["Reproducibility and caching","Commit the lockfile and use immutable install mode. Cache package downloads keyed by lockfile hash and platform. A cold-cache run must work. Cache is a speed optimization, not a correctness guarantee or a trusted execution artifact."],["Test layers","Unit tests cover pure logic; integration tests cover services, DB constraints and repositories; end-to-end tests cover login, tenant-scoped CRUD and denied access. Use isolated test data. Coverage is a diagnostic metric, not proof that assertions are meaningful."],["Preview and production security","Preview deployments should be temporary and use synthetic data. Production should have protected environment rules and scoped secrets. Prefer short-lived OIDC federation for cloud deployment when supported, with a narrow trust policy."],["Artifact promotion","Build an image once, tag it by commit and promote the same digest. Record commit SHA, image digest, migration version and deploy timestamp. Avoid rebuilding different bytes for production after tests passed."],["Failure and rollback","Failed checks stop promotion. If health regresses, halt rollout and restore a known-good artifact when schema/data remain compatible. Destructive migrations need forward-fix or recovery planning; code rollback alone may be unsafe."]],"code":"name: verify\non:\n  pull_request:\n  push:\n    branches: [main]\npermissions:\n  contents: read\njobs:\n  checks:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n          cache: npm\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run typecheck --if-present\n      - run: npm test\n      - run: npm run build","syntaxNotes":[["on","Declares workflow events."],["permissions","Scopes the workflow token; begin read-only and add only necessary access."],["jobs / steps","Jobs are execution units; steps run actions or shell commands in order."],["needs","Gates one job on successful completion of another."],["cache: npm","Caches package downloads; cold-cache correctness must remain."],["environment","Can attach approval rules and environment-scoped secrets."],["id-token: write","Allows OIDC token issuance when cloud federation is configured."]],"workedExample":{"title":"Worked example · A deploy job gated by verification","code":"A deploy job gated by verification\n\nname: verify\non:\n  pull_request:\n  push:\n    branches: [main]\npermissions:\n  contents: read\njobs:\n  checks:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n          cache: npm\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run typecheck --if-present\n      - run: npm test\n      - run: npm run build","explanation":["needs: checks ensures verification succeeds first.","The production environment can require approval and store environment-scoped credentials.","Grant id-token: write only if the deploy uses OIDC and restrict cloud trust to the intended repo/branch/environment.","The deploy script should use the verified artifact, check readiness and fail nonzero on errors."]},"practice":"Add CI with lint, typecheck, tests, build and image scan. Configure isolated PR previews, protected production environment, minimal token permissions and OIDC if supported. Prove a failing test blocks deployment, a cold-cache run succeeds, and each release is traceable to a commit and image digest. Document rollback and preview isolation.","knowledgeCheck":[{"question":"Should deployment proceed after a required test fails?","answer":"No. Make it depend on successful verification and fail closed."},{"question":"Why is a lockfile needed if CI caches packages?","answer":"The cache is disposable; the lockfile defines repeatable dependency resolution."},{"question":"What is least privilege for a workflow token?","answer":"Grant only the repository/deployment permissions required by the workflow."}],"sources":["https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions","https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication","https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment","https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect"]},{"title":"Automated migrations and zero-downtime database releases","lead":"Evolve PostgreSQL safely while old and new app versions overlap, with tested backfills, migration gates and recovery.","highlight":"A migration that works on an empty database can still break live traffic. Design schema changes for version compatibility and real data volume.","keyPoints":["Version and review migration files; do not rewrite applied history.","Expand-and-contract enables compatible rolling releases.","Backfill large tables in bounded, resumable batches.","Test from clean and populated prior-version databases."],"sections":[["Migration control","Treat migrations as immutable versioned history. Review generated SQL, constraint behavior and lock impact. Run migrations through a controlled release step rather than every app replica at startup. Record the migration version for each release and detect schema drift."],["Expand-and-contract","For a breaking rename/type change, first add a replacement field. Deploy compatible code that can work with both forms, backfill existing rows, verify, then switch reads/writes. Drop the old field only in a later release after all app instances, workers, reports and integrations stop using it."],["Bounded backfills","A huge update can hold locks, generate WAL, delay replicas and hurt latency. Process bounded batches using a stable cursor and retry-safe predicates. Track progress and allow pause/resume. Validate counts and domain invariants before switching traffic."],["Constraints and indexes","DDL may scan or lock large tables. Use concurrent index creation when appropriate and understand PostgreSQL's transaction restrictions and failure cleanup. Test against production-like data and monitor lock waits, latency and replica lag. Set abort thresholds before execution."],["Compatibility matrix","Document old/new application versions against each schema stage. During expansion, old app plus expanded schema must work; new app plus expanded schema must work. After contraction, only versions that no longer use removed fields may run. Include jobs and scripts."],["Rollback and forward recovery","Application rollback does not reverse committed data changes. Prefer compatible migrations that permit rollback during rollout. For irreversible transformations, retain verified backups and a forward-fix path. Rehearse restore procedures and define acceptable recovery point/time objectives."],["CI migration tests","Run migrations from empty and populated previous-version databases. Test repeat deploy, migration failure, old/new app compatibility and post-backfill invariants. Use disposable CI databases and synthetic data."]],"code":"-- Release A: additive expansion\nALTER TABLE accounts ADD COLUMN display_name text;\n-- Deploy compatible code that writes both old and new fields.\n-- Backfill rows in bounded batches; verify completeness.\n-- Release B: switch reads to display_name after validation.\n-- Release C, once all old consumers are retired:\nALTER TABLE accounts DROP COLUMN name;","syntaxNotes":[["Versioned migration","Ordered schema change tracked by the migration tool and source control."],["Expand-and-contract","Add compatible schema, migrate code/data, then remove obsolete schema later."],["Backfill","Populate or transform existing records after schema expansion."],["Idempotent step","A retry-safe operation that avoids duplicate or corrupt effects."],["CREATE INDEX CONCURRENTLY","Builds an index while allowing ordinary writes, with operational caveats."],["Schema drift","Difference between intended migration history and actual database structure."],["RPO / RTO","Acceptable data-loss window and acceptable recovery duration."]],"workedExample":{"title":"Worked example · A safe column rename release sequence","code":"A safe column rename release sequence\n\n-- Release A: additive expansion\nALTER TABLE accounts ADD COLUMN display_name text;\n-- Deploy compatible code that writes both old and new fields.\n-- Backfill rows in bounded batches; verify completeness.\n-- Release B: switch reads to display_name after validation.\n-- Release C, once all old consumers are retired:\nALTER TABLE accounts DROP COLUMN name;","explanation":["Keep the old column until all old versions and consumers are retired.","Dual-write behavior must be consistent and tested; consider failure between writes and use transactionally safe logic.","Backfill in chunks and measure lock waits, WAL, replica lag and request latency.","Verify no active row is missing the new value and compare domain-level correctness.","The sample is a sequence sketch; adapt SQL and test the actual deployment ordering."]},"practice":"Implement an expand-and-contract migration for one capstone schema change. Include migration files, version compatibility matrix, resumable batch backfill, validation queries, lock/lag monitoring, abort criteria and recovery. Test from empty and populated previous-version databases and demonstrate that failure does not silently leave the app unserviceable.","knowledgeCheck":[{"question":"Why delay dropping an old column?","answer":"Old app instances, workers and integrations may still depend on it during rolling deployment."},{"question":"Why batch a large backfill?","answer":"To limit locks and replication pressure and make work resumable."},{"question":"Does app rollback undo a data migration?","answer":"No. Use a safe reverse migration, verified restore or forward-fix plan."}],"sources":["https://www.prisma.io/docs/orm/prisma-migrate","https://www.postgresql.org/docs/current/sql-createindex.html","https://docs.github.com/en/actions/deployment/about-deployments/deploying-with-github-actions"]},{"title":"Observability and incident response","lead":"Instrument user-visible behavior and build an evidence-based workflow for diagnosing production failures.","highlight":"Logs, metrics and traces are complementary. Correlate them safely and define probes that do not amplify outages.","keyPoints":["Structured logs provide searchable event context without secret leakage.","Metrics expose rates, errors, latency and saturation.","Traces connect work across HTTP, database and cache boundaries.","Liveness and readiness serve different restart/routing decisions.","Incident response starts with impact, timeline, evidence and mitigation."],"sections":[["Structured logs","Emit machine-readable records with timestamp, severity, service/version, environment, request ID, route template, status and duration. Use stable event names. Redact credentials and sensitive payloads. Keep high-cardinality values out of metric labels."],["Metrics and SLIs","Track request rate, error ratio, latency percentiles and saturation such as CPU, memory, queue depth, DB pool waits and cache behavior. Define SLIs from user journeys. Alerts should be actionable and based on sustained impact, not every transient fluctuation."],["Distributed traces","A trace links spans across service boundaries. Instrument authentication, database and cache operations, and propagate context through supported libraries. Sample intentionally to manage cost. Do not attach tokens or sensitive content to spans."],["Health probes","Liveness indicates whether a process should restart; readiness indicates whether it should receive traffic. A transient DB outage should not automatically fail liveness and restart every instance. Add startup grace for slow initialization and keep public health output minimal."],["Incident triage","Confirm alert and user impact, affected routes/regions/tenants, and establish a timeline. Check deployment markers, logs, traces, DB connections, cache health and resource saturation. Form a testable hypothesis, mitigate the smallest safe scope, and verify recovery through user-visible signals."],["Runbooks and post-incident review","Every alert should identify an owner and runbook with first checks, dashboards, mitigation and escalation. Preserve evidence and communicate status. Review contributing factors without blame and create prevention tasks such as tests, safer rollout, capacity changes or alert tuning."],["Privacy and telemetry resilience","Restrict access, define retention, redact at ingestion and test redaction. Avoid letting telemetry failure crash core requests unless deliberately required. Balance sampling/cost with enough evidence to diagnose rare events."]],"code":"app.use((req, res, next) => {\n  const started = performance.now();\n  const requestId = crypto.randomUUID();\n  res.setHeader('x-request-id', requestId);\n  res.on('finish', () => logger.info({\n    event: 'http.request.completed', request_id: requestId,\n    method: req.method, route: req.route?.path || 'unmatched',\n    status_code: res.statusCode,\n    duration_ms: Math.round(performance.now() - started)\n  }));\n  next();\n});","syntaxNotes":[["Structured logging","Machine-readable key/value event records."],["Request ID","Correlation identifier connecting logs and traces; normalize externally supplied values."],["SLI / SLO","A measured service signal and its target over a defined window."],["p95 latency","Latency at or below which 95% of observations fall for a defined population/window."],["Trace / span","A trace groups related operations; a span describes one timed operation."],["Liveness / readiness","Restart health versus eligibility to receive traffic."],["High cardinality","Metric labels with many unique values that multiply time-series cost."]],"workedExample":{"title":"Worked example · Investigate a 5xx spike after release","code":"Investigate a 5xx spike after release\n\napp.use((req, res, next) => {\n  const started = performance.now();\n  const requestId = crypto.randomUUID();\n  res.setHeader('x-request-id', requestId);\n  res.on('finish', () => logger.info({\n    event: 'http.request.completed', request_id: requestId,\n    method: req.method, route: req.route?.path || 'unmatched',\n    status_code: res.statusCode,\n    duration_ms: Math.round(performance.now() - started)\n  }));\n  next();\n});","explanation":["First establish scope and timeline; do not assume the latest deploy caused it.","Metrics show scale, logs show event details, and traces locate slow/failing operations.","Check pool waits, query spans, Redis errors and resource saturation alongside app exceptions.","Rollback only if the current schema/data remains compatible with the previous app version.","Verify recovery over an observation window using error rate, p95 and synthetic user journeys."]},"practice":"Add structured logs, correlation IDs, latency/error metrics, traces around DB/cache calls and separate liveness/readiness endpoints. Build a dashboard for task creation/list journeys. Simulate a DB outage and write a runbook with impact checks, diagnostics, mitigation, verification and escalation. Add tests proving credentials and sensitive request fields are redacted.","knowledgeCheck":[{"question":"Why should liveness not fail on a transient database outage?","answer":"It may trigger restart loops that amplify the outage; readiness should handle traffic eligibility separately."},{"question":"What does p95 mean?","answer":"The 95th percentile latency for the selected population and observation window."},{"question":"How do logs, metrics and traces differ?","answer":"Logs give event details, metrics summarize behavior, and traces connect timed operations across a request."}],"sources":["https://opentelemetry.io/docs/concepts/observability-primer/","https://sre.google/sre-book/monitoring-distributed-systems/","https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/"]},{"title":"Cloud deployment, runtime config, CDN and rollout","lead":"Operate the container in a cloud runtime with secure configuration, health verification, cache policy and controlled traffic rollout.","highlight":"A public URL is only one acceptance item: verify security, readiness, traceability and recovery.","keyPoints":["Promote one immutable image and inject environment config at runtime.","Protect secrets, TLS, service identity and private DB connectivity.","Select rolling, canary or blue-green release strategy deliberately.","CDN policy must not share tenant-private responses.","Autoscaling must account for database pool multiplication."],"sections":[["Runtime configuration","Build one artifact and promote it through preview, staging and production. Inject database URL, session secret, allowed origins and service endpoints at runtime. Validate required values without printing secrets. Keep private server configuration out of client bundles."],["Cloud and network boundaries","Choose a container platform after checking runtime, CPU architecture, port binding, probes, scaling, storage and release mechanics. Prefer private DB networking, TLS and narrowly scoped service identities. Set resource limits and understand termination behavior."],["Release strategies","Rolling deploys replace instances gradually and require old/new schema compatibility. Blue-green deploys a parallel environment and switches traffic after checks, at extra temporary capacity. Canary releases expose a small traffic share first and expand only while safety signals remain healthy."],["CDN and HTTP caching","Cache content-hashed static assets aggressively because their URLs change with content. Personalized API responses should normally be private/no-store unless a reviewed design guarantees authorization-aware isolation. Define cache keys, vary dimensions and purge behavior; do not assume the CDN understands tenant identity."],["Scaling and DB capacity","Autoscaling app instances can multiply per-instance pools and exhaust PostgreSQL connections. Size pool limits using total replica count and database capacity. Observe queue depth and downstream limits, and test scale-out, scale-in and graceful shutdown."],["Post-deploy verification","Check readiness, errors, p95 latency, migration state, cache correctness and synthetic user journeys. Verify TLS/domain, secure headers, environment separation and tenant denial. Record commit SHA, image digest, migration version and approval; keep a known-good rollback target."],["Cost and resilience","Set budget alerts, log retention and resource ceilings. Define behavior when Redis or downstream services fail. Document backups, recovery objectives and escalation. Operational ownership is part of production readiness."]],"code":"const nextConfig = { output: 'standalone' };\nmodule.exports = nextConfig;\n\n// Personalized response:\n// Cache-Control: private, no-store\n// Hashed static asset:\n// Cache-Control: public, max-age=31536000, immutable","syntaxNotes":[["output: standalone","Next.js self-hosting mode emitting a minimal server bundle; include required static assets."],["Runtime environment","Settings supplied when the process starts, separate from the image build."],["private","Restricts response storage to private caches, not shared intermediaries."],["no-store","Tells caches not to store the response; suitable for sensitive personalized data."],["immutable","Use for versioned assets that will not change at the same URL."],["Canary rollout","Gradually sends limited traffic to a new version while monitoring safety signals."],["Graceful shutdown","Stops accepting new work and drains or safely cancels in-flight work."]],"workedExample":{"title":"Worked example · Production promotion and cache policy","code":"Production promotion and cache policy\n\nconst nextConfig = { output: 'standalone' };\nmodule.exports = nextConfig;\n\n// Personalized response:\n// Cache-Control: private, no-store\n// Hashed static asset:\n// Cache-Control: public, max-age=31536000, immutable","explanation":["Promote the same digest that passed CI so tested bytes equal deployed bytes.","The migration must support both current and candidate app versions.","Synthetic checks should include denied cross-tenant access, not only a successful login.","Default private API responses to no-store unless cache isolation has been proven.","Rollback must consider schema, background jobs and cache state, not just container health."]},"practice":"Deploy the production image to a cloud container runtime. Separate staging/production secrets, use TLS and private DB access, configure health probes and record release metadata. Define CDN rules for hashed assets and private APIs. Perform a controlled rollout, verify tenant-scoped CRUD and access denial, and rehearse rollback in staging. Document scaling limits, pool sizing, budgets and dependency outage behavior.","knowledgeCheck":[{"question":"Why avoid shared CDN caching for private tenant data?","answer":"A cache-key or authorization mistake could expose one tenant's response to another."},{"question":"Why promote the same image digest tested in CI?","answer":"It ensures the released bytes are identical to the verified artifact."},{"question":"What can app autoscaling do to DB connections?","answer":"It can multiply per-instance pools and exhaust database capacity."}],"sources":["https://nextjs.org/docs/app/building-your-application/deploying","https://12factor.net/config","https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control","https://docs.docker.com/engine/containers/resource_constraints/"]},{"title":"Redis sessions, cache-aside and invalidation","lead":"Add shared sessions and Redis caching while defining freshness, tenant key isolation and failure behavior.","highlight":"Caching is a consistency/security contract: decide what may be stale, who can access it and how invalidation recovers.","keyPoints":["Cache-aside loads the source of truth on misses and requires freshness handling.","Sessions need secure cookies, expiry, rotation and revocation.","Cache keys include tenant/user/query scope but never replace authorization.","Bound memory and TTLs; mitigate stampedes and monitor hit rate, evictions and origin load."],"sections":[["Why and where to cache","Caching reduces repeated work when data is reused and tolerates a defined freshness window. Browser, CDN, process-local, Redis and database caches differ in scope and invalidation. Measure first and identify the authoritative source; unnecessary caching adds complexity without improving the critical path."],["Cache-aside read path","Derive a stable key, check Redis, and return a hit only after normal authorization. On miss, query the source of truth, serialize a safe representation and store it with a TTL. On mutation, invalidate or refresh related keys. If invalidation fails after commit, stale entries can remain; plan retries, an outbox or versioned keys."],["Key design and tenant isolation","Include tenant, user/permission scope, filters, sort, locale and pagination in keys when they shape the response. Normalize inputs to avoid unlimited equivalent keys. Never put raw tokens or sensitive data in keys. A hard-to-guess key is not authorization; test cross-tenant isolation."],["TTL and stampede controls","Choose TTL from volatility and acceptable staleness. Set memory limits and eviction policy; watch evictions and key cardinality. Popular-key expiry can trigger many duplicate origin requests. Use request coalescing, bounded locks, TTL jitter or stale-while-revalidate only where stale data is safe."],["Redis-backed sessions","Use opaque session identifiers in Secure, HttpOnly cookies with suitable SameSite policy. Expire sessions, rotate identifiers after login/privilege changes and revoke on logout or compromise. Decide whether Redis outage fails closed and how failover affects sessions. Never expose session secrets to browser JavaScript."],["Reliable invalidation","Cache-aside is simpler than trying to atomically write PostgreSQL and Redis. A transactional outbox persists an invalidation event with the database write and publishes it with retries. Versioned key namespaces can invalidate logically, while old entries remain until TTL."],["Test and observe","Measure hit/miss, cache latency, memory, evictions, invalidation errors, key count and origin query reduction. Test cold/warm/expired cache, Redis outage, concurrent misses, invalidation failure, revocation and tenant boundaries. Ensure correctness when cache is empty."]],"code":"async function listTasks({ redis, repository, tenantId, userId }) {\n  const key = `tasks:v1:tenant:${tenantId}:user:${userId}:list`;\n  const cached = await redis.get(key);\n  if (cached !== null) return JSON.parse(cached);\n  const rows = await repository.listOwned({ tenantId, userId });\n  await redis.set(key, JSON.stringify(rows), { EX: 60 });\n  return rows;\n}\n\nasync function renameTask({ redis, repository, tenantId, userId, id, title }) {\n  const row = await repository.renameOwned({ tenantId, userId, id, title });\n  await redis.del(`tasks:v1:tenant:${tenantId}:user:${userId}:list`);\n  return row;\n}","syntaxNotes":[["Cache-aside","The app checks cache, loads origin on miss, then fills cache."],["TTL / EX","Redis EX sets key expiry in seconds."],["Key namespace","Prefix grouping related entries and supporting version-based invalidation."],["Cache stampede","Concurrent misses cause duplicate expensive origin requests."],["Request coalescing","Concurrent requests share one in-flight origin load."],["Transactional outbox","Persist event with DB write so downstream invalidation can be retried."],["Fail closed","Deny/pause when a required security control is unavailable rather than bypassing it."]],"workedExample":{"title":"Worked example · Invalidate after an owned task update","code":"Invalidate after an owned task update\n\nasync function listTasks({ redis, repository, tenantId, userId }) {\n  const key = `tasks:v1:tenant:${tenantId}:user:${userId}:list`;\n  const cached = await redis.get(key);\n  if (cached !== null) return JSON.parse(cached);\n  const rows = await repository.listOwned({ tenantId, userId });\n  await redis.set(key, JSON.stringify(rows), { EX: 60 });\n  return rows;\n}\n\nasync function renameTask({ redis, repository, tenantId, userId, id, title }) {\n  const row = await repository.renameOwned({ tenantId, userId, id, title });\n  await redis.del(`tasks:v1:tenant:${tenantId}:user:${userId}:list`);\n  return row;\n}","explanation":["The database remains authoritative; Redis must not become a conflicting second source of truth.","The query is tenant/user scoped; cache keys do not replace authorization checks.","An outbox makes invalidation retryable after commit; direct deletion can fail during outages.","Define the client response for committed writes with pending invalidation to avoid ambiguous retries.","Inject failures and concurrent updates to verify the cache converges to current DB state."]},"practice":"Add Redis cache-aside to task lists and Redis-backed sessions. Specify tenant/user/query key dimensions, TTLs, memory/eviction policy, mutation invalidation and outage behavior. Implement retryable invalidation, preferably outbox-based, and protect a hot key from stampedes. Test sessions/logout/rotation, cold/warm/expired cache, concurrent updates and tenant isolation; report hit ratio, origin query reduction and p95 before/after.","knowledgeCheck":[{"question":"Does a cache hit prove authorization?","answer":"No. Authorize independently and isolate cached data by tenant/user scope."},{"question":"What is the main cache-aside trade-off?","answer":"It is simple, but freshness, invalidation failure and recovery must be handled explicitly."},{"question":"What is a cache stampede?","answer":"Many concurrent misses trigger duplicate expensive origin work."}],"sources":["https://redis.io/docs/latest/develop/use/","https://redis.io/docs/latest/develop/data-types/strings/","https://microservices.io/patterns/data/transactional-outbox.html","https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie"]},{"title":"Production capstone: multi-tenant SaaS launch and handover","lead":"Integrate tenant isolation, RBAC, auditability, delivery automation, caching and observability into a reproducible production release.","highlight":"Completion requires evidence: clean setup, passing tests, safe tenant boundaries, verified deployment, telemetry and practiced recovery.","keyPoints":["Derive tenant scope from trusted membership and enforce it on every access path.","Use server-side RBAC and durable audit events for sensitive actions.","Ship immutable containers through CI gates with compatible migrations.","Prove cache correctness, health signals and incident response with controlled tests.","Publish architecture, threat model, runbooks and known limitations."],"sections":[["Product and tenant model","Document tenants, users, memberships, roles and resource ownership. Decide whether users can belong to multiple tenants and how active tenant selection is verified. Every query/mutation derives scope from trusted membership, not client-supplied tenant_id. Define platform support access and audit it."],["RBAC and object authorization","Create a role/action matrix (owner, admin, editor, viewer) and enforce each permission server-side for every route, action and background job. Hiding UI controls is not authorization. Test allowed/denied combinations, role changes, disabled accounts, stale sessions and guessed IDs."],["Database isolation","Use tenant_id on tenant-owned rows, composite constraints and tenant-aware indexes where appropriate. Consider PostgreSQL RLS as defense in depth. Set tenant context transaction-locally and test with the actual application DB role; table owners and privileged bypass roles can evade policies. Ensure pooled connections do not leak tenant context."],["Audit events","Persist actor, tenant, action, target, timestamp, request/trace ID and outcome for sensitive actions. Avoid secrets and unnecessary personal payloads. Define retention, access control and integrity needs. Audit records are durable business/security events, not interchangeable with debug logs."],["Delivery chain and schema safety","CI verifies lint, types, tests, build and image scan. Deploy only a verified immutable artifact. Use protected environments and scoped credentials. Apply compatible expand-and-contract migrations and define forward-fix/backup recovery."],["Operational readiness","Dashboard user success, errors, latency, DB pool pressure, Redis health, invalidation and deploy markers. Write runbooks for 500 spikes, DB/cache outage, suspected tenant leakage and failed migrations. Exercise an incident, capture evidence, mitigate safely and verify recovery."],["Release package and handover","Provide public URL if hosting exists, clean setup instructions, sanitized env template, architecture/data-flow diagram, threat model, role matrix, migration history, test report, image size/scan result, dashboard and runbooks. Seed synthetic demo data only. State limitations; do not claim certifications without independent audit."]],"code":"ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;\nALTER TABLE tasks FORCE ROW LEVEL SECURITY;\nCREATE POLICY tenant_tasks_policy ON tasks\nUSING (tenant_id = current_setting('app.tenant_id', true)::uuid)\nWITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);\n\nBEGIN;\nSELECT set_config('app.tenant_id', $1, true);\nSELECT id, title FROM tasks ORDER BY created_at DESC;\nCOMMIT;","syntaxNotes":[["RBAC","Maps roles to permissions and users to roles; enforce on the server."],["Tenant scope","Trusted tenant identity constraining tenant-owned data access."],["RLS","PostgreSQL policies filter rows available for reads and writes."],["FORCE ROW LEVEL SECURITY","Applies policies to table owners in normal paths; privileged bypass remains possible."],["set_config(..., true)","Sets a value transaction-locally to avoid pooled-connection context leakage."],["Audit event","Durable record of actor, action, target, scope, time and outcome."],["Release digest","Immutable artifact identifier proving which exact image was deployed."]],"workedExample":{"title":"Worked example · Prove tenant isolation","code":"Prove tenant isolation\n\nALTER TABLE tasks ENABLE ROW LEVEL SECURITY;\nALTER TABLE tasks FORCE ROW LEVEL SECURITY;\nCREATE POLICY tenant_tasks_policy ON tasks\nUSING (tenant_id = current_setting('app.tenant_id', true)::uuid)\nWITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);\n\nBEGIN;\nSELECT set_config('app.tenant_id', $1, true);\nSELECT id, title FROM tasks ORDER BY created_at DESC;\nCOMMIT;","explanation":["Create tenant Red/user Rhea/task R1 and tenant Blue/user Ben/task B1.","As Rhea, access R1 according to role; attempt B1 by guessed ID and expect denial without data disclosure.","Submit tenant_id=Blue while authenticated as Rhea; server must ignore/reject it and persist only within Red.","Repeat through APIs, server actions, search, exports and background jobs.","Run with production-like DB role and RLS enabled; inspect safe audit events."]},"practice":"Complete and package the production SaaS. Include tenant-aware schema/constraints and RLS or equivalent, server-side RBAC, audit events, Docker, GitHub Actions, safe migrations, Redis sessions/cache, structured telemetry, health checks, cloud deploy and monitoring. Provide normal/denial/concurrency/migration/outage tests, threat model, runbooks, release digest and clean setup. Demonstrate isolation using two synthetic tenants and explain trade-offs/limits.","knowledgeCheck":[{"question":"Is hiding an admin button sufficient?","answer":"No. The server must authorize every protected operation."},{"question":"Why test RLS with the actual app DB role?","answer":"Privileged owners/superusers may bypass policies, producing false confidence."},{"question":"What makes a release reproducible?","answer":"Locked dependencies, versioned migrations, automated checks, immutable artifact identity and documented deployment/verification."}],"sources":["https://www.postgresql.org/docs/current/ddl-rowsecurity.html","https://owasp.org/www-project-top-ten/","https://docs.github.com/en/actions","https://docs.docker.com/","https://opentelemetry.io/docs/"]}]
};

// Deepened Phase 02 content: foundations, project architecture, and testable build labs.
const phase02ReviewAdditions = [[["Runtime boundary validation","TypeScript annotations and interfaces are erased at runtime. Treat browser, database, and third-party payloads as unknown until a runtime schema validates them. A cast changes only the compiler's assumption; it cannot reject malformed JSON. Keep request DTOs separate from persistence records when their responsibilities differ."],["Control-flow narrowing and exhaustiveness","Use typeof, equality checks, in checks, and discriminant properties to narrow a union before using variant-specific fields. A switch over a discriminated union can use a never-typed default branch to reveal newly added variants that have not been handled."],["Generic constraints and utility types","Generics preserve relationships between input and output; constraints such as T extends { id: string } state the minimum capabilities required. Partial, Pick, Omit, and Readonly derive related compile-time shapes, but they do not validate runtime objects or replace explicit API contracts."],["Task-project type design","Model a task input separately from a stored task: input includes user-editable fields; the stored record also has identity, owner, timestamps, and completion state. Define result unions such as { ok: true, value } | { ok: false, issues } so callers must handle success and failure explicitly."],["Implementation lab and acceptance","Write a parser accepting unknown, validate non-empty titles and optional date format, and return a discriminated success/error result. Add tests for valid input, missing title, blank title, malformed date, and extra/unexpected values. Run strict typechecking; do not suppress errors with any or unchecked assertions."]],[["State snapshots and queued updates","A render sees a snapshot of props and state. Calling a setter schedules another render; it does not mutate the current handler's captured variable. When next state depends on prior state, use a functional updater. Derive counts and filtered arrays during render instead of duplicating them in state."],["Effect lifecycle and dependency correctness","Effects synchronize with external systems such as subscriptions and requests. Include every reactive value read by the effect, and return cleanup that removes listeners or aborts obsolete work. Do not use an effect merely to copy one piece of state into another; calculate derived values directly."],["Robust asynchronous UI","fetch resolves for HTTP error statuses, so check response.ok. Model loading, success, empty, and error states explicitly. Abort obsolete requests or ignore stale responses to prevent earlier results overwriting later ones. Convert errors into user-visible, accessible feedback rather than logging them only to the console."],["Optimistic updates need rollback","An optimistic toggle updates the view before the server responds. Preserve the prior value, restore it on failure, prevent conflicting duplicate submissions, and reconcile the client state with the server's authoritative response after success."],["Implementation lab and acceptance","Build a task list with controlled title input, add/toggle/delete actions, all/active/completed filters, and a derived remaining count. Include visible loading, empty, and error states; test rapid repeated toggles, failed requests, keyboard use, and recovery after retry."]],[["App Router route composition","Folders define route segments; page files define route UI and layouts share persistent UI. Place loading and error boundaries near the segment they protect. Verify direct navigation and refresh for each route, not only transitions from the home page."],["Server and Client Component boundary","Server Components are the default and can access server-side data without bundling credentials into browser code. Client Components are needed for state, event handlers, effects, and browser APIs; mark the module boundary with use client and keep it narrow. Do not pass secrets through client props."],["Caching is version- and configuration-sensitive","Choose static, dynamic, and revalidation behavior based on freshness and personalization requirements. Framework caching defaults and APIs can change between Next.js versions, so verify the installed version's official docs and test a production build. After a successful mutation, refresh or revalidate the affected route or data tag intentionally."],["Canonical architecture for the course project","Use Next.js App Router for the web UI, Server Components for suitable reads, validated Server Actions for authenticated mutations, Prisma for typed database access, and PostgreSQL for durable storage. Keep the Express lesson as a separate REST-service pattern exercise; do not implement duplicate CRUD stacks in the main capstone unless an external API client requires one."],["Implementation lab and acceptance","Create task list and detail routes, shared layout, loading and error UI, and a small client form. Validate and authorize mutations on the server, persist through the service/data layer, then revalidate the affected view. Confirm direct URL access, refresh, no client-side secrets, and rejected unauthorized writes."]],[["Thin routes and service boundaries","An HTTP handler translates method, path, headers, and validated input into an application-service call, then maps the result to a deliberate response. Put business rules in services and persistence in repositories so tests can isolate each responsibility."],["Middleware and centralized errors","Middleware order matters: parsing and request context must run before routes that depend on them. Authentication establishes identity; authorization checks access to the requested resource. Map known validation and not-found errors to documented 4xx responses; return generic 500 details to clients and retain diagnostics only in protected logs."],["HTTP method and status semantics","Use GET to read, POST to create, PATCH for documented partial updates, and DELETE to remove. Use 201 for resource creation and 204 when success intentionally has no body. Repeated POST requests may duplicate work; add idempotency keys when safe retries are required."],["Dependency injection and meaningful tests","Pass repositories, clocks, and external clients into services rather than hiding them in globals. Unit tests with fakes verify business rules; HTTP tests verify schema and status behavior; integration tests against a real test database verify SQL, constraints, and transaction semantics."],["Express is a companion pattern, not a second required stack","The primary Phase 02 application uses Next.js Server Actions. This Express exercise demonstrates a separate REST API boundary useful for mobile apps, partner integrations, or independently deployed services. If used in a real app, route the UI through that API and keep validation, authentication, authorization, and error contracts consistent."],["Implementation lab and acceptance","Implement GET and POST task endpoints with Zod parsing, an injected service, authentication, ownership checks, and centralized errors. Test valid input, malformed input, missing authentication, forbidden/cross-owner access, not found, and repository failure. Never rely on a client-only route guard."]],[["Define grain and enforce invariants","Decide what one row represents before choosing columns. Use primary keys, foreign keys, NOT NULL, UNIQUE, and CHECK constraints for invariants the database can enforce. Application validation improves feedback, but database constraints protect integrity across concurrent requests and alternate writers."],["Transactions and concurrency races","Transactions group related changes into an all-or-nothing unit. A read-then-write check can race with another transaction. Protect invariants with constraints, atomic updates, appropriate locks, or serializable transactions with retry where justified; keep transactions short."],["Indexes require measured justification","Indexes can accelerate selective filters, joins, and ordering, but consume storage and add write cost. Inspect representative query plans with EXPLAIN and measure safely with EXPLAIN ANALYZE. Document the access pattern an index supports; do not claim performance gains without before/after evidence."],["ORMs still generate database behavior","Prisma and other ORMs do not remove the need to understand SQL, relation loading, nullability, transaction boundaries, and migrations. Watch for N+1 query patterns and inspect generated SQL for joins, pagination, and bulk operations."],["Prisma migration workflow and tenant scoping","Define the Prisma schema, generate a development migration, and review its SQL. Apply reviewed migrations in deployment; do not use schema push as the production migration process. Every task read or write must include the authenticated owner id in the database predicate. Test cross-user IDs at the data-access layer."],["Implementation lab and acceptance","Create User and Task models with a foreign key, title constraint, timestamps, and owner-scoped access. Migrate from an empty database, test invalid inserts and cross-user access, and inspect the user-scoped list query plan. Document transaction behavior for a multi-step task operation."]]];
phase02ReviewAdditions.forEach((items,index)=>{const lesson=fullStackPhaseLessons[1]?.[index];if(!lesson)return;lesson.sections.push(...items.map((body)=>[body[0],body[1]]));lesson.knowledgeCheck=[...(lesson.knowledgeCheck||[]),{question:"What would you test to prove this topic works in the Phase 02 task application?",answer:items[items.length-1][1]}];lesson.keyPoints=[...(lesson.keyPoints||[]),"Apply the concept in the task application and verify its acceptance criteria."];});


// Phase 02 full lesson expansion: deeper instruction, syntax reference, practice, and checks.
const phase02Expansion = [{"sections":[["Runtime boundaries and strictness","TypeScript checks source relationships before execution; annotations are erased from emitted JavaScript. Network responses, local storage, and JSON.parse results are not validated by an interface. Treat external values as unknown, validate their structure and domain rules at the boundary, then pass validated data inward. Keep strictNullChecks enabled so missing values remain explicit."],["Discriminated unions and exhaustive handling","Represent finite states with literal unions. A discriminated union shares a literal field such as status, allowing the compiler to narrow each branch. Model loading, success, and failure as separate shapes instead of a loose object with many optional fields. In a switch, assign the default value to never so adding a new variant reveals every place that needs updating."],["Narrowing patterns","Use typeof for primitive types, Array.isArray for arrays, the in operator for property presence, and equality checks for literal values. A type guard can narrow a value only if its implementation truly verifies the claim. A type assertion such as value as User changes the compiler's belief; it does not inspect the value at runtime."],["Generic design and derived contracts","A generic type parameter preserves relationships between input and output. A constraint such as T extends {id:string} guarantees only the required capability while preserving extra properties of the caller's type. Pick, Omit, Partial, and Readonly derive compile-time shapes; they do not validate payloads or enforce authorization. Keep public DTOs separate from persistence records."]],"syntaxNotes":[["unknown","Accepts untrusted input but requires narrowing before operations; safer than any."],["T extends { id: string }","Constrains the generic to values with a string id while retaining their specific type."],["status: 'loading' | 'success'","A literal union used as a discriminator to model mutually exclusive states."],["never","Represents an impossible value; useful for compile-time exhaustive switch checks."],["Pick<T, K> / Omit<T, K>","Derive a type by selecting or excluding keys; compile-time only."],["Partial<T>","Makes properties optional in the type system; runtime validation is still required."]],"practice":"Implement Result<T> as a discriminated success/failure union, then write mapResult<T,U> and an exhaustive handler. Create a validator for unknown input that accepts only an object with a non-empty string id and role exactly 'admin' or 'member'. Test null, arrays, missing fields, wrong types, valid variants, and an unexpected role. Explain why an assertion is not validation.","knowledgeCheck":[{"question":"Does assigning fetched JSON to an interface validate it?","answer":"No. TypeScript types are erased at runtime. Validate external data before treating it as trusted."},{"question":"What benefit does a discriminated union provide?","answer":"It makes mutually exclusive states explicit and lets control-flow analysis narrow to the correct shape."},{"question":"What does a generic constraint guarantee?","answer":"It guarantees the minimum properties or operations required by the function while preserving the caller's more specific type."}]},{"sections":[["Render, state snapshots, and purity","A component describes UI from props and state. Keep render pure because React may call it repeatedly. A state setter schedules a later render; it does not change the variable captured by the current render. When next state depends on previous state, use the updater form, and replace arrays/objects immutably. Calculate derived values during render rather than duplicating them in state."],["Controlled forms and explicit UI states","A controlled input gets its value from React state and updates through onChange. Model submission states explicitly: idle, submitting, success, and error. Client validation provides fast feedback, but the server must validate again. Keep each editable value in one source of truth and show errors in text, not color alone."],["Effects synchronize external systems","Use effects for subscriptions, imperative integrations, and other synchronization with systems outside React—not as a default calculation mechanism. Dependencies must include reactive values read by the effect. Return cleanup to remove listeners or cancel work before re-synchronizing and at unmount. Development Strict Mode may run an extra setup/cleanup cycle to expose unsafe effects."],["Fetching and stale-request safety","fetch does not reject merely because the server returned 404 or 500; check response.ok. Validate the decoded response at runtime before using it as typed data. If a query changes quickly, cancel the previous request with AbortController or guard against stale results, so a slower old response cannot overwrite newer UI. Provide loading, error, empty, and success states."],["Local state versus server state","Menus and unsaved form text are local UI state. Remote data has freshness, caching, retry, pagination, and invalidation concerns. For larger applications, a query library may handle these concerns more consistently than hand-written effects. Test observable behavior such as pending states, failed requests, malformed payloads, and unmount cancellation."]],"syntaxNotes":[["useState","Returns a render's state snapshot and a setter that schedules a future render."],["setValue(previous => next)","Functional updater form; useful when the next value depends on queued previous state."],["useEffect(setup, dependencies)","Runs synchronization after commit; cleanup runs before re-setup and on unmount."],["AbortController","Provides a signal to cancel obsolete fetch requests."],["response.ok","Check this to handle HTTP error statuses; fetch does not throw for ordinary 4xx/5xx responses."],["Derived state","Prefer calculating values from existing props/state during render rather than mirroring them with an effect."]],"practice":"Build a controlled task form with title and priority, blank-title validation, submitting feedback, and success/error states. Implement useOnlineStatus with online/offline event listeners and cleanup. Test an old delayed search response arriving after a newer response, a 500 response, malformed response shape, empty results, and unmount during a pending request. Explain why derived values do not need effects.","knowledgeCheck":[{"question":"Why use a functional state update for an increment based on the prior value?","answer":"It composes updates against the latest queued state rather than relying on a potentially stale render snapshot."},{"question":"Does fetch throw on HTTP 404?","answer":"No. Inspect response.ok or status and handle unsuccessful HTTP responses explicitly."},{"question":"Why does an effect that subscribes to events need cleanup?","answer":"Cleanup prevents obsolete listeners from continuing after dependencies change or the component unmounts."}]},{"sections":[["App Router file conventions","Folders define route segments. page.tsx renders a route, layout.tsx shares persistent UI around child segments, loading.tsx supplies a loading boundary, and error.tsx handles errors for a segment. Keep route components focused on composing the page and move reusable business logic into server-side modules."],["Server and Client Components","App Router components are Server Components by default. They can fetch server-side data without shipping those dependencies to the browser. Add 'use client' only for state, effects, event handlers, or browser APIs; the directive establishes a client module boundary. Keep it narrow and never pass secrets or private server data into client props."],["Rendering, caching, and freshness","Static rendering suits content that can be shared and refreshed on a known cadence; dynamic rendering suits request-specific data such as a user's session. Cache decisions must reflect both freshness and privacy. Next.js caching behavior has varied by version, so verify the installed version's documentation and configure caching/revalidation intentionally."],["Server data and mutation workflow","A server page can await a data-access function and render a list. Distinguish an empty result from a failed request. A Server Action or Route Handler is still a server entry point: validate input, authenticate the caller, authorize the requested resource, call a service, and handle errors. After a successful mutation, revalidate the relevant path or tag."],["Secrets and authorization","Only intentionally public values belong in NEXT_PUBLIC environment variables. Keep service credentials server-only. Hiding an edit button in the client is not authorization; enforce access in the server-side service and scope queries by the authenticated user's identity. Validate ownership on every read and mutation."],["Integration walkthrough","For a task route, let the server page load the signed-in user's tasks. Use a small client form for input and pending feedback. The action validates the title, obtains owner identity from the session rather than the browser, persists through a service, and refreshes the route. Test both successful creation and cross-user access denial."]],"syntaxNotes":[["app/tasks/page.tsx","Defines the /tasks route's page component."],["'use client'","Module directive for client-side hooks and event handlers; place before imports."],["FormData","Submitted form values are runtime input and must be checked and validated."],["revalidatePath('/tasks')","Requests fresh route output after a successful mutation."],["NEXT_PUBLIC_","Marks environment values for client exposure; never use it for credentials."],["Server Action","Server-side mutation function, not an automatic security boundary."]],"practice":"Build a /tasks page with a server-rendered list and client form. Validate title length on the server, derive owner identity from the authenticated session, show pending/error/success/empty states, and revalidate after creation. Document the client boundary and data passed across it. Add tests proving one user cannot view or mutate another user's tasks.","knowledgeCheck":[{"question":"Why not mark every component as a Client Component?","answer":"That expands the client bundle and moves more code to the browser; server components can keep server-only access on the server."},{"question":"Are Server Actions inherently trusted?","answer":"No. Treat them as server entry points: validate, authenticate, authorize, and handle failures."},{"question":"Can a NEXT_PUBLIC variable hold a private API secret?","answer":"No. Values with that prefix are exposed to client code; keep secrets server-only."}]},{"sections":[["HTTP lifecycle and middleware order","Requests pass through middleware in registration order before reaching a route. JSON parsing must be registered before handlers that read req.body. Middleware can parse, authenticate, log safe metadata, or end a request. Keep middleware focused and avoid logging credentials or sensitive payloads."],["Resource contracts and status codes","Use consistent resource-oriented methods: GET reads, POST creates, PATCH partially updates, PUT replaces, DELETE removes. Specify request schemas, response shape, status codes, and retry semantics. Common statuses include 201 for creation, 400 for invalid input, 401 for missing/invalid authentication, 403 for authenticated but unauthorized callers, 404 for absent resources, and 500 for unexpected failures."],["Runtime validation with Zod","Path, query, headers, and JSON body are runtime values. Parse them with a schema at the boundary. Decide whether unknown object keys should be rejected or stripped. Syntactic validity is not the same as business validity or permission: a valid task ID does not prove the caller owns that task."],["Thin handlers and dependency injection","Keep HTTP translation in the route handler, use a service for the use case and domain rules, and isolate persistence in a repository. Pass dependencies into a router factory instead of constructing them invisibly. Tests can then inject a fake service and assert the contract without a live database."],["Centralized errors and secure responses","Map known validation, missing-resource, and conflict errors to safe client responses. Log unexpected failures on the server with a correlation ID; do not return stack traces, SQL details, tokens, or secrets. Express 5 forwards rejected async handlers to error middleware; Express 4 commonly requires explicit forwarding. Confirm the project's installed major version."],["Authentication and authorization","Authentication identifies the caller; authorization decides whether that caller may act on the specific resource. Scope queries and writes by the authenticated identity. Never trust an ownerId supplied by the browser, and check permissions for reads, updates, and deletes—not only creation."],["Contract testing and operations","Test valid input, missing fields, wrong types, malformed JSON, unauthenticated access, forbidden ownership, not-found cases, conflicts, and service failures. Also set body-size limits, safe CORS rules, appropriate rate limits, structured logs, and graceful shutdown for production."]],"syntaxNotes":[["express.json()","Parses JSON request bodies; register before routes that consume req.body."],["z.object(...).safeParse(...)","Runtime validation that returns a success/failure result without throwing for ordinary invalid input."],["req.params / req.query / req.body","Separate untrusted input channels; validate according to the route contract."],["201 Created","Typical success status for a resource creation endpoint."],["next(error)","Forwards an error to Express error middleware; avoid calling it after a response is sent."],["Dependency injection","Makes dependencies explicit and replaceable in tests."]],"practice":"Specify GET/POST/PATCH/DELETE contracts for tasks, including validation, authorization, status, response body, and failure cases. Implement POST using Zod and an injected service. Test valid input, blank title, unexpected key, unauthenticated caller, service rejection, and duplicate/conflict behavior. Confirm responses never expose internal exception messages.","knowledgeCheck":[{"question":"Why is a TypeScript request-body type not enough?","answer":"Types are erased and do not inspect incoming JSON; use runtime schema validation."},{"question":"Differentiate 401 and 403.","answer":"401 means valid authentication is missing; 403 means the authenticated caller is not permitted."},{"question":"What does injecting a service into a router enable?","answer":"Explicit dependencies and isolated tests using a fake service instead of a real database."}]},{"sections":[["Model the row grain and relationships","State what one row represents before defining columns. Identify entities, keys, and cardinalities. A task belongs to one user; tasks and labels are many-to-many, so use a junction table. Normalize repeated facts to reduce update anomalies, then denormalize only for measured performance needs."],["Constraints are database-enforced rules","A primary key identifies a row and is non-null. A foreign key enforces a valid reference. NOT NULL prevents missing values, UNIQUE prevents duplicate constrained values, and CHECK enforces a condition. CHECK alone generally does not reject NULL, so pair it with NOT NULL when absence is invalid. Choose ON DELETE behavior deliberately; cascading through dependent link rows may be suitable, while cascading valuable records may not be."],["Transactions and atomicity","A transaction groups related statements into an all-or-nothing unit. Commit persists the group; rollback discards it. Create a task and its label links in one transaction so partial state is not left behind. Do not report success before commit. Concurrent requests can still race, so use constraints, guarded updates, appropriate isolation, or row locks to protect invariants."],["Concurrency and safe retries","Read-then-write logic can race when another transaction changes the row between statements. Use a guarded UPDATE and inspect affected-row count, a unique constraint for uniqueness, or row locks when a multi-step decision needs them. Retry serialization failures or deadlocks only with a bounded policy and when the operation is safe to retry."],["Index for actual query patterns","Indexes can reduce lookup or sorting work but consume storage and add write overhead. A composite index on (owner_id, created_at DESC) may help a query filtering by owner and ordering newest-first. Column order matters: leading columns determine which query prefixes can use the index. Inspect EXPLAIN with representative data and measure before adding indexes."],["ORMs and migrations","An ORM does not remove the need to understand SQL, joins, constraints, transaction boundaries, and query plans. Watch for N+1 queries, unbounded result sets, accidental full-table writes, and schema drift. Version migrations and deploy compatible changes in stages: expand, backfill, switch application usage, then contract/remove old structures in a later release."],["Worked design: task labels","Use task_labels(task_id,label_id) with a composite primary key to prevent duplicate assignments. Insert the task and all links inside one transaction; if a referenced label is invalid, the foreign key rejects the link and the transaction rolls back the task too."]],"syntaxNotes":[["PRIMARY KEY","Unique row identifier and implicitly NOT NULL."],["FOREIGN KEY ... REFERENCES","Enforces referential integrity against a referenced key."],["CHECK and NULL","A CHECK expression that evaluates to NULL does not necessarily reject the row; add NOT NULL when required."],["BEGIN / COMMIT / ROLLBACK","Start, persist, or discard a transaction's changes."],["Composite index (a,b)","Column order influences which filters and sort patterns the index can support."],["EXPLAIN (ANALYZE, BUFFERS)","Shows an executed query plan and buffer activity; use care because ANALYZE actually runs the query."],["ON CONFLICT","Defines intentional behavior for uniqueness conflicts rather than silently ignoring all database errors."]],"practice":"Design normalized users, tasks, labels, and task_labels tables. State row grain, keys, foreign keys, nullability, uniqueness, checks, and deletion rules. Write a transaction that creates a task and two label links; demonstrate rollback on an invalid label. Write the query for a user's newest 20 tasks, propose an index, and use EXPLAIN to evaluate it. Add a concurrency test for duplicate label assignment and explain how the composite key protects integrity.","knowledgeCheck":[{"question":"Why use a transaction when creating a task and its labels?","answer":"It makes the related writes atomic, preventing a task from being committed without its required links if a later insert fails."},{"question":"Does every index improve performance?","answer":"No. Indexes cost storage and slow writes; the query planner may not use them. Measure representative query plans and workloads."},{"question":"What does an ORM not replace?","answer":"Understanding SQL behavior, constraints, transaction semantics, generated queries, and database performance."}]}];
phase02Expansion.forEach((extra, index) => {
  const lesson = fullStackPhaseLessons[1][index];
  lesson.sections.push(...extra.sections);
  lesson.syntaxNotes.push(...extra.syntaxNotes);
  lesson.practice = extra.practice;
  lesson.knowledgeCheck.push(...extra.knowledgeCheck);
});
// Replace short Phase 02 prompts with sequenced, verifiable implementation assignments.
const phase02LabGuides = ["Implementation lab · TypeScript contract and runtime parser\n1. Create src/domain/task.ts and define TaskInput (title, optional dueDate) plus Task (id, title, dueDate, completed, ownerId). 2. Create a Result<T> discriminated union with success and failure variants; keep error text safe and user-facing. 3. Write parseTaskInput(value: unknown): Result<TaskInput>. Check that the input is a non-null, non-array object, title is a trimmed non-empty string within a documented maximum, and dueDate is either absent or a valid ISO date string. 4. Write a switch that handles each Result variant and an exhaustive never assertion. 5. Add tests for valid input, null, array, missing title, blank title, too-long title, wrong date type, and impossible date. Acceptance: strict typecheck passes, invalid values are rejected before reaching domain code, and no assertion is used as a validation shortcut.","Implementation lab · React task list and request lifecycle\n1. Build a TaskList component with title input, submit button, list, filter controls, and a remaining-task count. 2. Keep only tasks, draft, filter, and request status as state; calculate filteredTasks and remainingCount during render. 3. Use a functional updater for toggles and immutable array updates for add/delete. 4. Fetch initial tasks in the existing app's data layer; show loading, empty, and error states and check response.ok. 5. Validate decoded response data before treating it as Task[]. 6. If the list can be refreshed or filters change the request, cancel obsolete work with AbortController or ignore stale responses. 7. Disable duplicate submits while pending and preserve the draft if the server rejects the create. Acceptance: rapid toggles do not lose updates, failed requests show a recoverable error, and the whole flow works by keyboard.","Implementation lab · Next.js route and server boundary\n1. Create /tasks and /tasks/[id] routes plus a shared layout and nearby loading.tsx/error.tsx boundaries. 2. Fetch the initial task list in a Server Component if the chosen data source supports server access; isolate filters and form events in a small Client Component with use client. 3. Define a server mutation (Server Action or Route Handler) and parse its input with a runtime schema. 4. Obtain the user identity from a trusted server-side session; never accept ownerId as authority from the submitted form. 5. Scope reads and updates to both task id and authenticated owner. 6. On success, refresh or revalidate the affected route using the API for the installed Next.js version. 7. Test direct URL open, browser refresh, invalid payload, unauthenticated request, and a second user's task id. Acceptance: no secret is imported into client code and every write enforces server-side authorization.","Implementation lab · Thin API with test seams\n1. Specify the four resource operations: GET /api/tasks, POST /api/tasks, PATCH /api/tasks/:id, DELETE /api/tasks/:id. Write request/response examples and status codes before implementation. 2. Add schema validation for path id, query options, and JSON bodies; reject unknown or malformed values according to the documented contract. 3. Create a TaskService with injected TaskRepository and authenticated principal; put ownership and domain rules in the service. 4. Keep Express handlers limited to parsing HTTP data, calling the service, and translating results to responses. 5. Add centralized error mapping for validation, unauthenticated, forbidden/not-found, and unexpected errors; do not return stack traces. 6. Unit-test the service with a fake repository, then add HTTP tests for status and response shape. Acceptance: tests prove one user's ID cannot read, update, or delete another user's task, and errors remain consistent.","Implementation lab · PostgreSQL schema, constraints, and query evidence\n1. Write down the grain: one row in tasks represents one task owned by one user. 2. Create users and tasks with primary keys, a non-null owner foreign key, non-empty title rule, completion flag, and timestamps; choose deletion behavior for the owner relationship and document it. 3. Add a migration and prove it applies to an empty local test database. 4. Implement owner-scoped list and mutation queries; do not fetch by task id alone and authorize afterward. 5. Add the index that matches the actual WHERE and ORDER BY used by the owner task list, then capture EXPLAIN (ANALYZE, BUFFERS) for representative synthetic data. 6. If creating a task also writes an audit row, wrap both writes in one transaction and test rollback on failure. Acceptance: constraints reject invalid rows, another owner cannot see the task, migrations are repeatable, and the index rationale cites observed query-plan evidence."];
phase02LabGuides.forEach((guide,index)=>{ if(fullStackPhaseLessons[1]?.[index]) fullStackPhaseLessons[1][index].practice=guide; });

// Phase 03 teaching expansion: guided steps and worked examples for all six lessons.
const phase03DeepDive = [{"sections":[["Step-by-step inspection lab","1) Open DevTools Performance and record a baseline interaction. 2) Repeat the same interaction with the same data volume. 3) Compare scripting, rendering and garbage-collection activity. 4) If memory rises, take heap snapshots after cleanup and inspect retained objects. 5) Identify the retaining path before changing code. 6) Repeat the exact scenario to confirm the fix."],["Worked reasoning: listener retention","Suppose a screen registers a window resize listener every time it mounts, but never removes it. Each listener closes over that screen's state and may keep related objects reachable. The correct lifecycle is symmetric: register in setup, unregister in cleanup, and ensure the callback reference is the same function. A memory snapshot can confirm whether old closures remain retained; a simple visual symptom alone cannot prove a leak."]],"workedExample":{"title":"Worked example · lifecycle-safe listener","code":"function mountPanel(onResize) {\n  const handleResize = () => onResize(window.innerWidth);\n  window.addEventListener('resize', handleResize);\n\n  return function unmountPanel() {\n    window.removeEventListener('resize', handleResize);\n  };\n}\n\nconst cleanup = mountPanel(width => console.log(width));\n// When the panel is removed:\ncleanup();","explanation":["The same handleResize function reference is passed to addEventListener and removeEventListener; a new anonymous function would not remove the original listener.","The returned cleanup makes ownership explicit: the code that subscribes also provides the matching teardown.","In a React effect, return this cleanup function from the effect setup. In a non-React UI, call it when the panel is disposed.","The console callback is illustrative only; production code should use structured diagnostics and avoid noisy logs."]}},{"sections":[["Step-by-step responsive rendering lab","1) Establish a baseline using React Profiler and record commits while typing. 2) Keep the input's immediate state update urgent. 3) Defer only the expensive dependent view. 4) Add an accessible busy/status indication while results lag. 5) Compare perceived input responsiveness and total work; scheduling may improve responsiveness without reducing the filter's CPU cost. 6) If the list remains slow, consider algorithmic improvements, virtualization, or moving work off the render path."],["Boundary placement and recovery design","Place Suspense and error boundaries around components that can fail or load independently. A fallback should preserve context and explain what is happening; a retry should reset the failed subtree or re-trigger the data operation. Avoid one giant boundary that replaces the entire application for a minor panel issue. Verify that the boundary's fallback itself does not throw."]],"workedExample":{"title":"Worked example · urgent input with deferred list","code":"import { useDeferredValue, useMemo, useState } from 'react';\n\nfunction Search({ items }) {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const results = useMemo(() => {\n    const normalized = deferredQuery.trim().toLowerCase();\n    return items.filter(item => item.name.toLowerCase().includes(normalized));\n  }, [items, deferredQuery]);\n\n  return (\n    <section aria-busy={query !== deferredQuery}>\n      <label htmlFor=\"search\">Search</label>\n      <input id=\"search\" value={query}\n        onChange={event => setQuery(event.target.value)} />\n      {query !== deferredQuery && <p role=\"status\">Updating results…</p>}\n      <ul>{results.map(item => <li key={item.id}>{item.name}</li>)}</ul>\n    </section>\n  );\n}","explanation":["The controlled input reads and updates the urgent query state so keystrokes can render promptly.","The list reads deferredQuery, which may temporarily lag while React works on the newer result set.","useMemo avoids repeating the filter when its inputs have not changed; it is an optimization, not a correctness requirement.","aria-busy and role=status expose the updating state to assistive technology.","For very large lists, deferring alone may not be enough; profile and consider virtualization or a more efficient search index."]}},{"sections":[["Step-by-step type transformation","1) Define the smallest source domain model. 2) Decide which properties are input-only, output-only or shared. 3) Use mapped and conditional types to derive the compile-time shape. 4) Add type assertions/tests for representative members and union behavior. 5) Write a runtime schema separately for incoming values. 6) Check editor/compiler diagnostics and keep the public alias readable."],["Design limit: compiler contract versus runtime contract","A compile-time type can prevent a developer from passing a misspelled property in checked code, but it cannot stop a caller, JavaScript client, browser extension or malicious request from sending malformed JSON. Keep the type inferred from or aligned with a runtime schema where practical, but do not confuse one with the other. Avoid overly clever recursive types when a simple interface plus a named helper is easier to maintain."]],"workedExample":{"title":"Worked example · event payload map","code":"type Events = {\n  created: { id: string; createdAt: Date };\n  removed: { id: string; reason?: string };\n};\n\ntype ListenerMap<E> = {\n  [K in keyof E as `on${Capitalize<string & K>}`]?:\n    (payload: E[K]) => void;\n};\n\ntype AppListeners = ListenerMap<Events>;\nconst listeners: AppListeners = {\n  onCreated: event => console.log(event.id, event.createdAt),\n  onRemoved: event => console.log(event.id, event.reason)\n};","explanation":["Events is the source mapping from event names to their payload types.","keyof E iterates the event names; the as clause constructs listener property names such as onCreated.","E[K] ties each callback parameter to the payload for its specific event name.","The optional modifier permits consumers to register only the event handlers they need.","The code provides compile-time checking only; if event payloads arrive over a network, validate them at runtime before dispatch."]}},{"sections":[["Step-by-step endpoint reliability design","1) Define the operation that must be safe to retry. 2) Scope the idempotency key to the authenticated principal and operation. 3) Canonicalize and fingerprint the validated request. 4) In one transaction, claim the key, apply the business effect and store the response. 5) On duplicates, compare fingerprints and return the stored result only for the same request. 6) Test two simultaneous requests using the same key."],["Webhook receiver sequence","Receive the raw request bytes, validate timestamp tolerance, verify the signature over the exact agreed byte representation, and then persist the event ID into a deduplication table with a unique constraint. Commit durable acceptance before returning success. Process the event asynchronously from a durable queue when the business action is slow. The sender may retry if the acknowledgement is lost, so duplicate processing must remain safe."]],"workedExample":{"title":"Worked example · idempotent request decision","code":"async function createTaskIdempotently({ principalId, key, payload, store, service }) {\n  const fingerprint = sha256(canonicalJson(payload));\n  return store.transaction(async tx => {\n    const existing = await tx.idempotency.find(principalId, key);\n    if (existing) {\n      if (existing.fingerprint !== fingerprint) {\n        throw new ConflictError('Idempotency key reused with different input');\n      }\n      if (existing.state === 'complete') return existing.response;\n      throw new InProgressError();\n    }\n\n    await tx.idempotency.insert({ principalId, key, fingerprint, state: 'processing' });\n    const task = await service.createTask(tx, principalId, payload);\n    const response = { status: 201, body: task };\n    await tx.idempotency.complete(principalId, key, response);\n    return response;\n  });\n}","explanation":["This is an application-level sketch; sha256, canonicalJson, store and service are injected abstractions that need real implementations and tests.","The unique database key on (principalId, key) is essential to make concurrent claims atomic; handle the unique-conflict path by reading the winning record.","The same key with a different fingerprint is rejected to prevent accidental or malicious cross-operation result reuse.","The task write and stored response must commit together; otherwise a retry could create a second task after a lost response.","Define how long completed keys are retained and how clients behave while the first request is still processing."]}},{"sections":[["Step-by-step plan reading","1) Capture the exact SQL and representative bind values. 2) Run EXPLAIN (ANALYZE, BUFFERS) in a safe test environment. 3) Compare estimated and actual row counts at each node. 4) Find repeated loops, expensive sorts and high buffer reads. 5) Propose one index or query rewrite based on the predicate/order. 6) Re-run against the same dataset and compare correctness, latency and write overhead."],["Pool and replica capacity exercise","Calculate the maximum possible app connections as instance count multiplied by pool maximum, then reserve capacity for migrations, monitoring and administration. A pool that is too small queues requests; a pool that is too large can overwhelm PostgreSQL. For replica routing, explicitly mark which reads tolerate lag and keep read-after-write and permission-sensitive checks on a consistent source unless a stronger strategy is implemented."]],"workedExample":{"title":"Worked example · query shape and index hypothesis","code":"-- Access pattern: a user's newest active tasks, bounded page.\nSELECT id, title, created_at\nFROM tasks\nWHERE owner_id = $1 AND status = 'active'\nORDER BY created_at DESC, id DESC\nLIMIT 25;\n\n-- Hypothesis: selective active subset, owner filter, newest-first order.\nCREATE INDEX tasks_active_owner_created_idx\nON tasks (owner_id, created_at DESC, id DESC)\nINCLUDE (title)\nWHERE status = 'active';\n\n-- Compare plans and buffers before/after with realistic data.\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT id, title, created_at\nFROM tasks\nWHERE owner_id = 42 AND status = 'active'\nORDER BY created_at DESC, id DESC\nLIMIT 25;","explanation":["The index order follows the equality filter first and then the requested ordering columns; the id tie-breaker makes ordering deterministic.","The partial predicate stores only active rows, which can reduce index size when active tasks are a subset and the query predicate matches.","INCLUDE(title) may permit index-only retrieval when visibility-map conditions allow it; it is not guaranteed.","Compare actual rows, buffers, sort nodes and execution time before and after; also measure insert/update overhead.","Use bind parameters in application SQL; the literal owner id here is only for a reproducible explain demonstration."]}},{"sections":[["Step-by-step authentication threat review","1) List protected assets and trust boundaries. 2) Trace where identity is established and how it reaches handlers. 3) For every operation, check resource-level authorization on the server. 4) Enumerate token validation rules and expiry behavior. 5) Review browser credential attachment and CSRF protections. 6) Trace untrusted input to HTML, SQL, logs and outbound requests. 7) Test abuse cases and confirm secrets never reach client output."],["Refresh rotation race and recovery","Two refresh requests can race with the same token. The server should serialize or atomically compare-and-swap the token record so only one rotation succeeds. A replayed old token can indicate theft, but parallel legitimate tabs can also trigger it; coordinate refreshes in the client where possible and define a safe re-authentication experience. Do not weaken replay detection by accepting unlimited reuse."],["Security test evidence","For each test, record the attacker-controlled input, expected status, expected side effect (usually none on denial), and log behavior. Include a negative authorization test using a real second user, not merely a mocked boolean. Confirm output encoding by checking that a payload is rendered as inert text, not executed. Rotate any credential accidentally committed or exposed; deleting it from the latest source alone does not invalidate it."]],"workedExample":{"title":"Worked example · server-side authorization before mutation","code":"async function renameTask({ request, taskId, newTitle, sessions, tasks }) {\n  const user = await sessions.requireUser(request);\n  const title = validateTaskTitle(newTitle);\n\n  // The lookup is scoped to the authenticated user, not a client-supplied owner id.\n  const task = await tasks.findOwnedById({ id: taskId, ownerId: user.id });\n  if (!task) throw new NotFoundError();\n\n  return tasks.rename({ id: task.id, ownerId: user.id, title });\n}","explanation":["Authentication resolves the user from a trusted session, not a request-body ownerId.","The ownership-scoped lookup avoids exposing whether another user's task exists; returning 404 for absent or unowned resources is one possible API policy.","Validation occurs before persistence, but the database/service should still enforce domain invariants and safe query parameterization.","The rename operation remains scoped by ownerId to reduce time-of-check/time-of-use risk; for sensitive operations, enforce ownership in the update statement itself.","Add tests for unauthenticated callers, own task, another user's task, invalid title, and concurrent deletion or ownership changes."]}}];
phase03DeepDive.forEach((extra, index) => {
  const lesson = fullStackPhaseLessons[2][index];
  lesson.sections.push(...extra.sections);
  lesson.workedExample = extra.workedExample;
});





// Post-audit fixes for the two examples that most directly connect to the app build.
fullStackPhaseLessons[1][1].code = "import { useEffect, useState } from 'react';\n\ntype SearchResponse = { results: string[] };\n\nexport function SearchBox() {\n  const [query, setQuery] = useState('');\n  const [results, setResults] = useState<string[]>([]);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n\n  useEffect(() => {\n    const controller = new AbortController();\n    async function load() {\n      if (!query.trim()) {\n        setResults([]);\n        setError('');\n        setLoading(false);\n        return;\n      }\n      setLoading(true);\n      setError('');\n      try {\n        const response = await fetch('/api/search?q=' + encodeURIComponent(query), { signal: controller.signal });\n        if (!response.ok) throw new Error('Search failed');\n        const data: SearchResponse = await response.json();\n        setResults(data.results);\n      } catch (reason) {\n        if (reason instanceof Error && reason.name === 'AbortError') return;\n        setError('Could not load results. Try again.');\n      } finally {\n        if (!controller.signal.aborted) setLoading(false);\n      }\n    }\n    void load();\n    return () => controller.abort();\n  }, [query]);\n\n  return (\n    <section aria-busy={loading}>\n      <label htmlFor=\"search\">Search</label>\n      <input id=\"search\" value={query} onChange={event => setQuery(event.target.value)} />\n      {loading && <p role=\"status\">Loading results…</p>}\n      {error && <p role=\"alert\">{error}</p>}\n      {!loading && !error && query.trim() && results.length === 0 && <p>No results found.</p>}\n      <ul>{results.map((item, index) => <li key={index}>{item}</li>)}</ul>\n    </section>\n  );\n}";
fullStackPhaseLessons[1][1].sections.push(["Read the sample critically","The SearchResponse annotation is compile-time only; production code must validate JSON at runtime before trusting it. Replace the illustrative array-index key with a stable record ID when available, and consider debouncing if each keystroke triggers expensive work."]);
fullStackPhaseLessons[1][1].knowledgeCheck.push({question:"Does the TypeScript SearchResponse annotation validate JSON returned by fetch?",answer:"No. The annotation is compile-time only. Validate untrusted response data at runtime, for example with a Zod schema, before treating it as SearchResponse."});
fullStackPhaseLessons[1][2].code = "// app/tasks/page.tsx — Server Component\nimport { getTasks } from '@/lib/tasks';\nimport { TaskForm } from './task-form';\n\nexport default async function TasksPage() {\n  const tasks = await getTasks();\n  return (\n    <main>\n      <h1>Tasks</h1>\n      <TaskForm />\n      <ul>{tasks.map(task => <li key={task.id}>{task.title}</li>)}</ul>\n    </main>\n  );\n}\n\n// app/tasks/task-form.tsx — Client Component\n'use client';\nimport { useActionState } from 'react';\nimport { createTask } from './actions';\n\nconst initialState = { message: '' };\nexport function TaskForm() {\n  const [state, formAction, pending] = useActionState(createTask, initialState);\n  return (\n    <form action={formAction}>\n      <label htmlFor=\"title\">Task title</label>\n      <input id=\"title\" name=\"title\" required maxLength={120} />\n      <button disabled={pending}>Add task</button>\n      <p role=\"status\" aria-live=\"polite\">{state.message}</p>\n    </form>\n  );\n}\n\n// app/tasks/actions.ts — Server Action module\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { z } from 'zod';\nimport { auth } from '@/lib/auth';\nimport { prisma } from '@/lib/prisma';\n\nconst CreateTask = z.object({ title: z.string().trim().min(1).max(120) });\nexport async function createTask(_previous: { message: string }, formData: FormData) {\n  const parsed = CreateTask.safeParse({ title: formData.get('title') });\n  if (!parsed.success) return { message: 'Enter a task title (1–120 characters).' };\n  const session = await auth();\n  if (!session?.user?.id) return { message: 'Sign in to add a task.' };\n  await prisma.task.create({ data: { title: parsed.data.title, ownerId: session.user.id } });\n  revalidatePath('/tasks');\n  return { message: 'Task added.' };\n}";
fullStackPhaseLessons[1][2].sections.push(["Expected errors belong in form state","For expected validation or authorization outcomes, return a safe result that the form can render instead of throwing an exception whose message may leak details. React's useActionState connects a Server Action's returned state to the form. Authentication and authorization must be checked inside every Server Action, and database reads must be scoped to the signed-in owner."]);
fullStackPhaseLessons[1][2].knowledgeCheck.push({question:"Why is the 'use client' directive shown at the top of a separate task-form.tsx file?",answer:"It defines a client module boundary. The page remains a Server Component, while the interactive form is a Client Component. The directive must be at the top of the client module."});
fullStackPhaseLessons[1][2].sources = [...new Set([...(fullStackPhaseLessons[1][2].sources || []),"https://nextjs.org/docs/app/getting-started/mutating-data","https://nextjs.org/docs/app/getting-started/error-handling"])];

// Complete the reference list for the introductory accessibility lesson.
guidedLessons[0].sources = ["https://www.w3.org/WAI/fundamentals/accessibility-intro/","https://www.w3.org/WAI/tutorials/page-structure/","https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML"];


// Additional lesson-level QA enrichment for early foundations and advanced systems topics.
const phase1Deepening = [[["Choose layout by relationship","Use Flexbox when items form one row or column and should distribute available space; use Grid when rows and columns are both part of the design. These are not competing global modes: a page can use Grid for its overall card matrix and Flexbox inside each card. Start with the content's natural size, then constrain only where the design requires it."],["Responsive sizing and overflow diagnosis","Prefer fluid widths such as minmax(0, 1fr), min(), max(), and clamp() over fixed pixel widths for content that must adapt. A common grid pattern is repeat(auto-fit, minmax(min(100%, 15rem), 1fr)). When a child unexpectedly overflows, inspect min-width:auto on flex/grid children, long unbreakable strings, and padding included under content-box sizing before adding overflow:hidden."]],[["Scope, closures, and side effects","A function creates a lexical scope. A closure retains access to variables from the scope where it was created, even after that outer function returns. This is useful for callbacks and private state, but retained closures can also keep objects alive longer than expected. Keep side effects—network calls, timers, and DOM changes—at explicit boundaries so they are easier to test."],["Promises and async/await failure paths","An async function always returns a Promise. await pauses that function until the promise settles; it does not block the entire JavaScript thread. Use try/catch around awaited operations when you can recover or add context, and use finally for cleanup. When running independent requests, Promise.all rejects if one rejects; use Promise.allSettled when you need every outcome."],["Worked practice sequence","First write a synchronous function that normalizes and validates a task title. Then write an async function that calls fetch, checks response.ok, parses the response, and returns a typed result. Test a successful response, a non-2xx response, invalid JSON, and a rejected network request. Explain which errors are expected user outcomes and which should be logged for diagnosis."]],[["Debug with a minimal reproduction","When a UI behaves unexpectedly, reduce the page to the smallest element and rule set that still reproduces the issue. Inspect computed styles and the box model, then change one variable at a time. For asynchronous bugs, log request identity and completion order; do not assume the last request started is the last request to finish."],["Avoid common async mapping traps","Array.map does not wait for an async callback. It returns an array of promises; await Promise.all(mappedPromises) when all results are required. Avoid async forEach when you need to await completion. For large workloads, do not launch unbounded requests: batch or limit concurrency and handle partial failure deliberately."],["Responsive and accessibility regression checks","Test at narrow, medium, and wide widths; use browser zoom; and check keyboard focus after layout changes. Ensure controls do not become clipped, overlap, or move into an illogical tab order. Prefer intrinsic sizing and flexible gaps. Add reduced-motion alternatives for nonessential animation and do not communicate state using color alone."]]];
phase1Deepening.forEach((items,index)=>{const lesson=guidedLessons[index+1];lesson.sections.push(...items);});
const phase3Deepening = [[["Optimization requires a measured bottleneck","JavaScript engines optimize hot code based on runtime feedback, but implementation details can change by engine version and workload. Treat hidden classes, inline caches, and deoptimization as explanatory models, not stable language guarantees. Profile a repeatable user journey before changing code; avoid premature micro-optimizations that make code harder to maintain."],["Experiment design","Record the workload, data size, device/browser, warm-up conditions, and measurement method. Compare repeated runs and look at distributions rather than one timing. A change that improves a synthetic loop may not improve the user-visible interaction if layout, network, or rendering dominates."]],[["Scheduling is not free performance","Concurrent rendering lets React prepare and interrupt non-urgent work; it does not make expensive calculations intrinsically cheaper. Keep urgent input updates responsive and defer only dependent expensive UI. Suspense handles supported asynchronous rendering boundaries; it is not a universal error handler, and event-handler failures need explicit handling."],["Boundary design and recovery","Place Suspense and error boundaries around independently recoverable regions. A useful fallback communicates what is loading or unavailable and offers a meaningful retry when possible. Test slow data, rejected data, and retry behavior; ensure a boundary does not hide a failure that should be surfaced to the user."]],[["Mapped and conditional types as transformations","Mapped types iterate over keys to derive a new object shape; conditional types select a result based on assignability. These are compile-time transformations, not runtime mappers. Keep derived types readable by naming intermediate types and prefer a small explicit interface when a clever type becomes harder to debug than the data model."],["Type-level API contracts","Use literal unions and template literal types to constrain known route names or event keys, but do not mistake a compile-time route type for authorization. Pair static contracts with runtime schema validation at network boundaries. Type tests can assert intended relationships, while runtime tests must still exercise actual parsing and behavior."]],[["Idempotency and retries","A client may retry after a timeout even when the server completed the original request. For operations that must not duplicate side effects, persist an idempotency key scoped to the authenticated principal and operation, associate it with a request fingerprint and outcome, and define expiry/retention. Reject reuse of the same key with a materially different payload."],["Webhooks and event delivery","Verify webhook signatures against the raw request bytes using the provider's documented algorithm, then deduplicate event IDs and process asynchronously. Assume delivery can be repeated and arrive out of order. Record processing state and make handlers safe to retry; do not treat a successful HTTP response as proof that downstream work completed."]],[["Read a query plan as evidence","EXPLAIN shows the planner's chosen operations and estimates; EXPLAIN ANALYZE executes the statement and reports actual work, so use it carefully with mutating statements and production data. Compare estimated and actual row counts, scan type, join strategy, sort, and buffers. Large estimate errors can point to stale statistics or correlated data."],["Connection pools and replicas","A pool limits concurrent database connections and reuses established sessions; pool size must be considered across all application instances, not just one process. Read replicas can reduce read pressure but may lag behind the primary. Route freshness-sensitive reads to the primary or explicitly handle eventual consistency; replicas do not replace query optimization."]],[["Threat modeling the actual trust boundary","List assets, actors, entry points, and trust boundaries before choosing tokens or middleware. Authentication establishes who is acting; authorization determines what that actor may do to a specific object. Enforce tenant and owner checks in server-side data access, and test horizontal access by substituting another user's record identifier."],["Token and browser security decisions","JWT is a token format, not a complete authentication system. Validate signature, issuer, audience, expiry, and intended algorithm using a maintained library and explicit configuration. For browser sessions, understand cookie flags and CSRF protections; for OAuth public clients, use Authorization Code with PKCE. Never place long-lived secrets in browser bundles or logs."]]];
const phase3Examples = [{"title":"Worked example · profile before optimizing","code":"// Measure the same interaction before and after a change.\nperformance.mark('filter-start');\nconst visible = tasks.filter(task => task.title.includes(query));\nperformance.mark('filter-end');\nperformance.measure('task-filter', 'filter-start', 'filter-end');\n// Inspect repeated measurements in DevTools; this alone is not a full benchmark.","explanation":["The marks bound the specific operation being measured.","Repeat the same data and interaction to compare like with like.","Use the browser Performance panel to identify whether JavaScript is actually the bottleneck; this small measurement does not capture all rendering or network cost."]},{"title":"Worked example · defer expensive results","code":"const deferredQuery = useDeferredValue(query);\nconst results = useMemo(\n  () => filterTasks(tasks, deferredQuery),\n  [tasks, deferredQuery]\n);\nreturn <section aria-busy={query !== deferredQuery}>…</section>;","explanation":["The input should remain bound to the urgent query state; only the expensive dependent result view uses the deferred value.","useMemo may skip repeated calculations when dependencies are unchanged, but does not guarantee a faster algorithm.","The busy state tells users and assistive technology that results may be catching up."]},{"title":"Worked example · derive a constrained update type","code":"type Task = { id: string; title: string; done: boolean };\ntype TaskPatch = Partial<Pick<Task, 'title' | 'done'>>;\nfunction applyPatch(task: Task, patch: TaskPatch): Task {\n  return { ...task, ...patch };\n}","explanation":["Pick limits the editable fields; Partial makes those selected fields optional.","The id is deliberately excluded so callers cannot change identity through this patch shape.","This is only a compile-time shape. Validate incoming JSON at runtime before calling applyPatch."]},{"title":"Worked example · deduplicate a retried command","code":"const existing = await store.findByKey(userId, idempotencyKey);\nif (existing) {\n  if (existing.fingerprint !== fingerprint) throw new ConflictError();\n  return existing.response;\n}\n// In one transaction, reserve the unique key and persist the operation result.","explanation":["The lookup is scoped to the authenticated user, preventing cross-user key collisions.","A repeated key with the same request fingerprint can return the recorded outcome.","The unique reservation and operation result need transactional handling to close races between simultaneous retries."]},{"title":"Worked example · inspect an index hypothesis","code":"EXPLAIN (ANALYZE, BUFFERS)\nSELECT id, title, created_at\nFROM tasks\nWHERE owner_id = 42\nORDER BY created_at DESC\nLIMIT 25;","explanation":["The predicate and ordering describe a concrete user-scoped list access pattern.","A composite index beginning with owner_id and then created_at may help, but the planner decides based on statistics and selectivity.","Compare actual rows, timing, and buffer reads before and after the index on representative data."]},{"title":"Worked example · authorize before mutating","code":"const session = await auth();\nif (!session?.user?.id) return { error: 'Sign in required' };\nconst task = await repository.findById(taskId);\nif (!task || task.ownerId !== session.user.id) {\n  return { error: 'Task not found' };\n}\nreturn repository.update(task.id, safePatch);","explanation":["The user identity comes from the server-verified session, not a userId supplied by the browser.","The lookup and owner comparison happen server-side before the write.","A generic not-found response can avoid disclosing whether another user's record exists; enforce the same ownership predicate in the update query to avoid a time-of-check/time-of-use race."]}];
phase3Deepening.forEach((items,index)=>{const lesson=fullStackPhaseLessons[2][index];lesson.sections.push(...items);lesson.workedExample=phase3Examples[index];});


// Production-phase acceptance criteria make the capstone assessable, not just aspirational.
const phase4Acceptance = [[["Image verification checklist","After building, inspect the final image rather than trusting the Dockerfile: confirm the runtime user is non-root, no development dependencies or source secrets are present, the process receives termination signals, and the configured port matches the platform. Scan the image and review findings; a clean scan is not proof that the application itself is secure."],["Release acceptance","Build the image in CI from a clean checkout, tag it with an immutable commit identifier, run tests against that exact artifact, and deploy the same artifact to the target environment. Record image digest, build provenance, rollback reference, and the person or system that approved promotion."]],[["Protect the deployment workflow","Give workflow jobs only the permissions they need, pin third-party actions to reviewed immutable references where practical, and keep deployment credentials out of source and logs. Use protected environments and approvals for production. Avoid building a different artifact after tests pass; promote the verified artifact."],["Pipeline acceptance","Demonstrate that a failing lint, typecheck, unit test, or production build blocks release. Confirm secrets are unavailable to untrusted pull-request code, production deploy requires the intended gate, and a failed deployment leaves the previous healthy version serving traffic."]],[["Safe schema evolution","Use expand-and-contract when old and new application versions may overlap: add a nullable or backward-compatible structure, deploy code that can tolerate both shapes, backfill in bounded batches, switch reads/writes, then remove obsolete columns in a later release. A database rollback may be unsafe after new-format writes; plan a forward fix and data recovery path."],["Migration release acceptance","Test migration from a realistic prior schema with production-like volume, measure lock and runtime impact, and verify application compatibility during rolling deployment. Record preflight checks, backup/restore assumptions, stop conditions, and the forward-repair procedure."]],[["Operational signals and alert quality","Choose user-facing service-level indicators such as request success rate, latency, and saturation, then define objectives and alert thresholds that correspond to actionable symptoms. Correlate structured logs with request/trace IDs. Alerts should identify impact and a next action; avoid paging on every transient error or on metrics nobody can respond to."],["Incident exercise","Run a short tabletop: detect a spike, assess affected routes and users, compare the release timeline, inspect correlated traces/logs, mitigate or roll back, and communicate status. Record a timeline and follow-up actions without blaming individuals. Verify dashboards and alert routes before launch."]],[["Configuration and rollout safety","Separate deploy-time configuration from the artifact and validate required variables at startup. Enforce TLS, restrict database and cache network access, and set explicit cache-control policies so personalized responses are not accidentally shared by a CDN. Use staged rollout or canary when supported, and define health criteria for promotion."],["Deployment acceptance","Prove that missing required configuration fails safely, secrets do not appear in client bundles or logs, health/readiness checks reflect dependencies correctly, and rollback restores a known-good release. Test a personalized response with caching disabled or correctly varied for the authenticated user."]],[["Cache correctness and failure behavior","A cache is an optimization, not the source of truth. Set TTLs based on acceptable staleness, define invalidation on every write path, and prevent cache stampedes with request coalescing or bounded refresh. Decide what the application does when Redis is unavailable; do not silently turn a cache outage into data loss or bypass authorization."],["Redis acceptance","Test cache hit, miss, expiration, invalidation after update/delete, concurrent cold-key requests, and Redis outage. Verify session cookies are secure and session IDs rotate at authentication boundaries. Never use a cache key that omits tenant or user scope when the value is private."]],[["Capstone security and correctness gates","Before launch, prove tenant isolation with adversarial tests that substitute tenant IDs and object IDs. Enforce authorization in server-side queries and mutations, add database constraints where possible, and audit sensitive actions without logging tokens or private payloads. Include accessibility, error-state, backup/restore, and dependency-update checks in the release checklist."],["Operational handover and evidence","Deliver an architecture diagram, local setup guide, environment-variable inventory, migration procedure, dashboards, alert ownership, incident runbook, backup/restore evidence, and rollback instructions. Attach test reports and measured performance baselines. Mark any unverified requirement explicitly; do not call the capstone production-ready solely because it deploys."]]];
phase4Acceptance.forEach((items,index)=>{const lesson=fullStackPhaseLessons[3][index];lesson.sections.push(...items);lesson.practice=(lesson.practice||"")+"\n\nAcceptance evidence: "+items[1][1];});


// Surface the acceptance criteria in the visible practice prompt as well as the lesson body.
const phase02PracticeCriteria = [
  "Acceptance: strict typecheck passes; valid and invalid unknown inputs are handled explicitly, and no any cast is used to suppress errors.",
  "Acceptance: the form, filters, and task actions work with keyboard input; loading, empty, failure, retry, and rapid-update behavior are handled.",
  "Acceptance: routes work on direct navigation and refresh; mutations validate and authorize server-side; private data is not exposed to client code.",
  "Acceptance: documented API status/error cases pass tests; user ownership is enforced for reads and writes; failures are safely logged and returned.",
  "Acceptance: migrations apply from an empty database; constraints reject invalid rows; owner-scoped reads are tested; the index has a documented query-plan rationale."
];
phase02PracticeCriteria.forEach((criteria,index)=>{const lesson=fullStackPhaseLessons[1][index];lesson.practice=(lesson.practice||"")+"\n\n"+criteria;});
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
  const priorProject = phaseStudy.querySelector(".phase-project-brief");
  if (priorProject) priorProject.remove();
  const priorAssessment = phaseStudy.querySelector(".phase-assessment");
  if (priorAssessment) priorAssessment.remove();
  if (phase.projectBrief) {
    const brief = makeElement("section", "study-reader-block phase-project-brief");
    brief.append(makeElement("h4", "", "Project brief · Required build"));
    brief.append(makeElement("p", "", phase.projectBrief.outcome));
    for (const [heading, entries] of [["Required features", phase.projectBrief.requiredFeatures], ["Submission deliverables", phase.projectBrief.deliverables], ["Acceptance criteria", phase.projectBrief.acceptance]]) {
      brief.append(makeElement("h5", "", heading));
      const list = makeElement("ul", "detail-list");
      entries.forEach(entry => list.append(makeElement("li", "", entry)));
      brief.append(list);
    }
    phaseStudy.append(brief);
  }
  if (Array.isArray(phase.assessment)) {
    const assessment = makeElement("section", "study-reader-block phase-assessment");
    assessment.append(makeElement("h4", "", "Assessment rubric"));
    const table = makeElement("table", "assessment-table");
    const head = makeElement("tr");
    ["Dimension", "Weight", "Evidence expected"].forEach(label => head.append(makeElement("th", "", label)));
    table.append(head);
    phase.assessment.forEach(([dimension, weight, evidence]) => {
      const row = makeElement("tr");
      [dimension, weight, evidence].forEach(value => row.append(makeElement("td", "", value)));
      table.append(row);
    });
    assessment.append(table);
    phaseStudy.append(assessment);
  }
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

let phaseTwoLessons = {fullstack:[],python:[],excel:[],powerbi:[]};

function openGuidedLesson(topicIndex = 0, track, phase = track?.phases?.[0], phaseIndex = 0) {
  if (!track || !track.id || !phase) return;
  activeStudyContext = { trackId: track.id, phaseIndex, topicIndex };
  const authoredLesson = phaseIndex === 0
    ? (track.id === "fullstack" ? guidedLessons[topicIndex] : foundationLessons[track.id]?.[topicIndex])
    : (phaseIndex === 1 ? (track.id === "fullstack" ? (fullStackPhaseLessons[1]?.[topicIndex] || phaseTwoLessons.fullstack[topicIndex]) : phaseTwoLessons[track.id]?.[topicIndex]) : (phaseIndex === 2 && track.id === "fullstack" ? fullStackPhaseLessons[2]?.[topicIndex] : (phaseIndex === 3 && track.id === "fullstack" ? fullStackPhaseLessons[3]?.[topicIndex] : null)));
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
  const eyebrow = makeElement("p", "eyebrow", `${authoredLesson ? "GUIDED LESSON" : "TOPIC STUDY SCAFFOLD"} · ${track?.name || "FOUNDATIONS"}`);
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
    const cleanSectionTitle = String(sectionTitle).replace(/^\s*\d+(?:\.\d+)*[.)]?\s*/, "");
    lessonReader.append(makeElement("h5", "", `${index + 1}. ${cleanSectionTitle}`));
    lessonReader.append(makeElement("p", "", sectionBody));
  });
  if (lesson.code) {
    const pre = makeElement("pre", "lesson-code");
    pre.append(makeElement("code", "", lesson.code.replace(/\\n/g, "\n")));
    lessonReader.append(pre);
  }
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

  // Persist a lightweight resume pointer so learners can return to their last topic.
  const resumeRecord = {trackId: track.id, phaseIndex, topicIndex, title: lesson.title, savedAt: Date.now()};
  try { window.localStorage.setItem(resumeStorageKey, JSON.stringify(resumeRecord)); } catch (_) {}
  const learningTools = makeElement("section", "lesson-tools");
  const toolHeader = makeElement("div", "lesson-tools-heading");
  toolHeader.append(makeElement("strong", "", "Your study tools"), makeElement("span", "muted", "Saved on this device"));
  const toolActions = makeElement("div", "lesson-tool-actions");
  const bookmarkButton = makeElement("button", "secondary-action lesson-bookmark", "☆ Save for review");
  bookmarkButton.type = "button";
  let bookmarks = [];
  try { bookmarks = JSON.parse(readSaved(bookmarkStorageKey) || "[]"); if (!Array.isArray(bookmarks)) bookmarks = []; } catch (_) {}
  const isBookmarked = bookmarks.some(item => item.key === activeLessonKey);
  bookmarkButton.textContent = isBookmarked ? "★ Saved for review" : "☆ Save for review";
  bookmarkButton.setAttribute("aria-pressed", String(isBookmarked));
  bookmarkButton.addEventListener("click", () => {
    let current = [];
    try { current = JSON.parse(readSaved(bookmarkStorageKey) || "[]"); if (!Array.isArray(current)) current = []; } catch (_) {}
    const exists = current.some(item => item.key === activeLessonKey);
    current = exists ? current.filter(item => item.key !== activeLessonKey) : [...current, {key:activeLessonKey, trackId:track.id, phaseIndex, topicIndex, title:lesson.title}];
    try { window.localStorage.setItem(bookmarkStorageKey, JSON.stringify(current)); } catch (_) {}
    bookmarkButton.textContent = exists ? "☆ Save for review" : "★ Saved for review";
    bookmarkButton.setAttribute("aria-pressed", String(!exists));
    lessonFeedback.textContent = exists ? "Removed from your review list." : "Added to your review list.";
    renderSavedReviews();
  });
  toolActions.append(bookmarkButton);
  learningTools.append(toolHeader, toolActions);
  lessonReader.append(learningTools);
  const pager = makeElement("div", "lesson-pager");
  const previous = makeElement("button", "secondary-action", "← Previous topic");
  const next = makeElement("button", "primary-action", "Next topic →");
  previous.type = next.type = "button";
  const topics = phase.topics || [];
  previous.disabled = topicIndex <= 0;
  next.disabled = topicIndex >= topics.length - 1;
  previous.addEventListener("click", () => openGuidedLesson(topicIndex - 1, track, phase, phaseIndex));
  next.addEventListener("click", () => openGuidedLesson(topicIndex + 1, track, phase, phaseIndex));
  pager.append(previous, next);
  lessonReader.append(pager);

  const actions = makeElement("div", "lesson-actions");
  actions.append(completeLessonButton);
  lessonReader.append(actions, lessonFeedback);
  lessonReader.hidden = false;
  activeLessonKey = `learning-studio.lesson.${track.id}.phase${phaseIndex + 1}.topic${topicIndex}`;
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
  renderTracks(searchInput?.value || "");
  renderHomePaths();
  renderResumeCard();
});

function renderProgress() {
  const lessonIds = ["fullstack", "python", "excel", "powerbi"].flatMap(trackId => {
    const track = tracks.find(item => item.id === trackId);
    const phaseIndexes = trackId === "fullstack" ? [0, 1, 2, 3] : [0, 1];
    return phaseIndexes.flatMap(phaseIndex => {
      const count = track?.phases?.[phaseIndex]?.topics?.length || 0;
      return Array.from({ length: count }, (_, topicIndex) =>
        `learning-studio.lesson.${trackId}.phase${phaseIndex + 1}.topic${topicIndex}`
      );
    });
  });
  const completedCount = lessonIds.filter(id => readSaved(id) === "complete").length;
  const byTrack = document.querySelector("#progress-track-list");
  if (byTrack) {
    byTrack.replaceChildren();
    ["fullstack","python","excel","powerbi"].forEach(trackId => {
      const track=tracks.find(item=>item.id===trackId); if(!track)return;
      const phaseIndexes=trackId==="fullstack"?[0,1,2,3]:[0,1], ids=[];
      phaseIndexes.forEach(pi=>(track.phases[pi]?.topics||[]).forEach((_,ti)=>ids.push("learning-studio.lesson."+trackId+".phase"+(pi+1)+".topic"+ti)));
      const done=ids.filter(key=>readSaved(key)==="complete").length,pct=ids.length?Math.round(done/ids.length*100):0;
      const row=makeElement("article","progress-track-row"),meta=makeElement("div","progress-track-meta");
      meta.append(makeElement("strong","",track.name),makeElement("small","",done+" / "+ids.length+" tracked topics"));
      const bar=makeElement("div","progress-track-meter"),fill=makeElement("span","");fill.style.width=pct+"%";bar.append(fill);
      row.append(meta,bar,makeElement("span","progress-track-percent",pct+"%"));byTrack.append(row);
    });
  }
  const completed = document.querySelector("#progress-completed");
  const available = document.querySelector("#progress-available");
  const meter = document.querySelector(".progress-meter");
  const fill = document.querySelector("#progress-meter-fill");
  const status = document.querySelector("#progress-status");
  const lessonState = document.querySelector("#progress-lesson-state");
  if (!completed || !meter || !fill || !status || !lessonState) return;
  if (available) available.textContent = String(lessonIds.length);
  completed.textContent = String(completedCount);
  const homeCompleted = document.querySelector("#home-completed-total");
  const homeTracks = document.querySelector("#home-track-total");
  if (homeCompleted) homeCompleted.textContent = String(completedCount);
  if (homeTracks) homeTracks.textContent = String(tracks.length || 4);
  meter.setAttribute("aria-valuemax", String(lessonIds.length));
  meter.setAttribute("aria-valuenow", String(completedCount));
  fill.style.width = `${lessonIds.length ? (completedCount / lessonIds.length) * 100 : 0}%`;
  let resume = null; try { resume = JSON.parse(readSaved(resumeStorageKey) || "null"); } catch (_) {}
  lessonState.textContent = resume ? "In progress" : (completedCount ? "Learning started" : "Not started");
  status.textContent = completedCount === lessonIds.length
    ? "All available guided lessons are complete."
    : `${completedCount} of ${lessonIds.length} available guided lessons completed.`;
}


function renderSavedReviews() {
  const panel = document.querySelector("#saved-review-list");
  if (!panel) return;
  panel.replaceChildren();
  let bookmarks = [];
  try { bookmarks = JSON.parse(readSaved(bookmarkStorageKey) || "[]"); if (!Array.isArray(bookmarks)) bookmarks = []; } catch (_) {}
  if (!bookmarks.length) {
    panel.append(makeElement("p", "muted", "No saved lessons yet. Use “Save for review” inside a lesson to build your review list."));
    return;
  }
  bookmarks.forEach(item => {
    const track = tracks.find(entry => entry.id === item.trackId);
    const phase = track?.phases?.[item.phaseIndex];
    if (!track || !phase || !phase.topics[item.topicIndex]) return;
    const row = makeElement("article", "saved-review-item");
    const meta = makeElement("div", "");
    meta.append(makeElement("strong", "", item.title || phase.topics[item.topicIndex]));
    meta.append(makeElement("small", "", track.name + " · Phase " + (item.phaseIndex + 1)));
    const open = makeElement("button", "secondary-action", "Review →");
    open.type = "button";
    open.addEventListener("click", () => openGuidedLesson(item.topicIndex, track, phase, item.phaseIndex));
    row.append(meta, open);
    panel.append(row);
  });
}

function renderResumeCard() {
  const heading = document.querySelector("#active-track-title");
  const card = document.querySelector(".active-learning-card");
  const button = document.querySelector("#browse-curriculum");
  if (!heading || !card || !button) return;
  let record = null;
  try { record = JSON.parse(readSaved(resumeStorageKey) || "null"); } catch (_) {}
  const track = tracks.find(item => item.id === record?.trackId);
  const phase = track?.phases?.[record?.phaseIndex];
  if (!track || !phase || !Number.isInteger(record.topicIndex) || !phase.topics[record.topicIndex]) {
    heading.textContent = "Choose your next learning track";
    button.textContent = "Browse curriculum →";
    button.onclick = () => showView("curriculum");
    return;
  }
  heading.textContent = record.title || phase.topics[record.topicIndex];
  const copy = card.querySelector("p");
  if (copy) copy.textContent = "Pick up where you left off. Your review saves and completion status stay in this browser.";
  button.textContent = "Continue learning →";
  button.onclick = () => openGuidedLesson(record.topicIndex, track, phase, record.phaseIndex);
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

fetch(new URL("data/curriculum.json?v=20260926-python-zero-start", document.baseURI), { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error("Curriculum could not be loaded.");
    return response.json();
  })
  .then(async data => {
    if (!Array.isArray(data.tracks) || data.tracks.length !== 4) throw new Error("Curriculum data is incomplete or invalid.");
    const response = await fetch(new URL("data/phase2-lessons.json", document.baseURI), { cache: "no-store" });
    if (!response.ok) throw new Error("Phase 02 lessons could not be loaded.");
    const lessonData = await response.json();
    for (const trackId of ["python", "excel", "powerbi"]) {
      const expected = data.tracks.find(track => track.id === trackId)?.phases?.[1]?.topics?.length;
      const authored = lessonData.tracks?.[trackId];
      if (!Array.isArray(authored) || authored.length !== expected) throw new Error("Phase 02 lesson count is invalid for " + trackId + ".");
      phaseTwoLessons[trackId] = authored;
    }
    tracks = data.tracks;
    renderTracks();
    renderHomePaths();
    renderProgress();
    renderResumeCard();
    renderSavedReviews();
  })
  .catch(error => {
    trackRoot.textContent = `${error.message} Please refresh or check the published curriculum file.`;
    console.error(error);
  });