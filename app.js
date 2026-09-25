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
const lessonNotes = document.querySelector("#lesson-notes");
const lessonFeedback = document.querySelector("#lesson-feedback");
const lessonKey = "learning-studio.lesson.fullstack.phase1";
const notesKey = lessonKey + ".notes";
const trackCount = document.querySelector("#track-count");
const views = [...document.querySelectorAll(".view")];
const navButtons = [...document.querySelectorAll(".nav-item")];

let tracks = [];

function showView(viewName) {
  const navViewName = viewName === "phase" ? "curriculum" : viewName;
  views.forEach(view => {
    const isActive = view.id === (viewName === "phase" ? "phase-page" : `${viewName}-view`);
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

function openPhaseStudy(track, phase, index) {
  studyTitle.textContent = `Phase ${index + 1} · ${phase.title}`;
  studyDescription.textContent = `${track.name} · Study focus`;
  studyTopics.replaceChildren();
  phase.topics.forEach((topic, topicIndex) => {
    const item = makeElement("article", "study-topic");
    item.append(makeElement("span", "study-topic-number", `TOPIC GROUP ${String(topicIndex + 1).padStart(2, "0")}`));
    item.append(makeElement("p", "study-topic-copy", topic));
    if (track.id === "fullstack" && index === 0 && guidedLessons[topicIndex]) {
      const lessonButton = makeElement("button", "topic-lesson-action", "Study this topic →");
      lessonButton.type = "button";
      lessonButton.addEventListener("click", () => openGuidedLesson(topicIndex));
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
  const backButton = document.querySelector("#back-to-phase");
  lessonReader.replaceChildren(backButton);
  const eyebrow = makeElement("p", "eyebrow", "GUIDED LESSON · FULL-STACK FOUNDATIONS");
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
  const notesLabel = makeElement("label", "lesson-notes-label", "My notes");
  notesLabel.htmlFor = "lesson-notes";
  lessonReader.append(notesLabel, lessonNotes);
  const actions = makeElement("div", "lesson-actions");
  actions.append(document.querySelector("#save-lesson-notes"), document.querySelector("#complete-lesson"));
  lessonReader.append(actions, lessonFeedback);
  lessonReader.hidden = false;
  lessonNotes.value = readSaved(notesKey);
  lessonFeedback.textContent = "";
  const completed = readSaved(lessonKey + "." + topicIndex) === "complete";
  document.querySelector("#complete-lesson").textContent = completed ? "Lesson completed ✓" : "Mark lesson complete";
  lessonReader.scrollIntoView({ block: "start", behavior: "auto" });
}
function readSaved(key) {
  try { return window.localStorage.getItem(key) || ""; }
  catch (error) { return ""; }
}

document.querySelector("#back-to-phase").addEventListener("click", () => {
  lessonReader.hidden = true;
  phaseStudy.scrollTop = 0;
});
document.querySelector("#save-lesson-notes").addEventListener("click", () => {
  try {
    window.localStorage.setItem(notesKey, lessonNotes.value);
    lessonFeedback.textContent = "Notes saved on this device.";
  } catch (error) {
    lessonFeedback.textContent = "Could not save notes in this browser. You can copy them before leaving.";
  }
});
document.querySelector("#complete-lesson").addEventListener("click", event => {
  try {
    window.localStorage.setItem(lessonKey + "." + (document.querySelector("#lesson-title")?.dataset.topicIndex || "0"), "complete");
    event.currentTarget.textContent = "Lesson completed ✓";
    lessonFeedback.textContent = "Completion saved on this device.";
  } catch (error) {
    lessonFeedback.textContent = "Could not save completion in this browser.";
  }
  renderProgress();
});

function renderProgress() {
  const total = Object.keys(guidedLessons).length;
  const completedCount = Object.keys(guidedLessons)
    .filter(topicIndex => readSaved(lessonKey + "." + topicIndex) === "complete").length;
  const completed = document.querySelector("#progress-completed");
  const available = document.querySelector("#progress-available");
  const meter = document.querySelector(".progress-meter");
  const fill = document.querySelector("#progress-meter-fill");
  const status = document.querySelector("#progress-status");
  const lessonState = document.querySelector("#progress-lesson-state");
  if (!completed || !meter || !fill || !status || !lessonState) return;
  if (available) available.textContent = String(total);
  completed.textContent = String(completedCount);
  meter.setAttribute("aria-valuemax", String(total));
  meter.setAttribute("aria-valuenow", String(completedCount));
  fill.style.width = `${total ? (completedCount / total) * 100 : 0}%`;
  lessonState.textContent = readSaved(lessonKey + ".0") === "complete" ? "Completed ✓" : "Not started";
  status.textContent = completedCount === total
    ? "All four authored Full-stack Phase 1 topic lessons are complete."
    : `${completedCount} of ${total} authored Full-stack Phase 1 topic lessons completed.`;
}
function getSequenceNote() {
  return "Complete Excel Phase 3 before Power BI Phase 2. Full-stack and Python can be studied in parallel from day one.";
}

document.querySelector(".close").addEventListener("click", () => showView("curriculum"));
searchInput.addEventListener("input", event => renderTracks(event.target.value));
renderProgress();

fetch("./data/curriculum.json")
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