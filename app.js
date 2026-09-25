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
const lessonKey = "learning-studio.lesson.fullstack.phase1.semantic-html";
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

function openPhaseStudy(track, phase, index) {
  studyTitle.textContent = `Phase ${index + 1} · ${phase.title}`;
  studyDescription.textContent = `${track.name} · Study focus`;
  studyTopics.replaceChildren();
  phase.topics.forEach((topic, topicIndex) => {
    const item = makeElement("article", "study-topic");
    item.append(makeElement("span", "study-topic-number", `TOPIC GROUP ${String(topicIndex + 1).padStart(2, "0")}`));
    item.append(makeElement("p", "study-topic-copy", topic));
    if (track.id === "fullstack" && index === 0 && topicIndex === 0) {
      const lessonButton = makeElement("button", "topic-lesson-action", "Open guided lesson →");
      lessonButton.type = "button";
      lessonButton.addEventListener("click", openGuidedLesson);
      item.append(lessonButton);
    } else {
      item.append(makeElement("small", "lesson-pending", "Detailed lesson content not authored yet"));
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

function openGuidedLesson() {
  lessonReader.hidden = false;
  lessonNotes.value = readSaved(notesKey);
  lessonFeedback.textContent = "";
  const completed = readSaved(lessonKey) === "complete";
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
    window.localStorage.setItem(lessonKey, "complete");
    event.currentTarget.textContent = "Lesson completed ✓";
    lessonFeedback.textContent = "Completion saved on this device.";
  } catch (error) {
    lessonFeedback.textContent = "Could not save completion in this browser.";
  }
});

function getSequenceNote() {
  return "Complete Excel Phase 3 before Power BI Phase 2. Full-stack and Python can be studied in parallel from day one.";
}

document.querySelector(".close").addEventListener("click", () => showView("curriculum"));
searchInput.addEventListener("input", event => renderTracks(event.target.value));

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