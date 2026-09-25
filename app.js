"use strict";

const trackRoot = document.querySelector("#tracks");
const searchInput = document.querySelector("#search");
const dialog = document.querySelector("#phase-dialog");
const title = document.querySelector("#dialog-title");
const description = document.querySelector("#dialog-description");
const phaseList = document.querySelector("#phase-list");
const trackCount = document.querySelector("#track-count");
const views = [...document.querySelectorAll(".view")];
const navButtons = [...document.querySelectorAll(".nav-item")];

let tracks = [];

function showView(viewName) {
  views.forEach(view => {
    const isActive = view.id === `${viewName}-view`;
    view.hidden = !isActive;
    view.classList.toggle("active", isActive);
  });
  navButtons.forEach(button => {
    const isActive = button.dataset.view === viewName;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (viewName !== "curriculum" && dialog.open) dialog.close();
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
    details.append(summary, content);
    phaseList.append(details);
  });

  if (track.id === "powerbi") {
    phaseList.prepend(makeElement("p", "sequence-note", "Learning sequence: " + getSequenceNote()));
  }
  dialog.style.maxHeight = "calc(100dvh - 32px)";
  dialog.style.overflowY = "auto";
  dialog.showModal();
}

function getSequenceNote() {
  return "Complete Excel Phase 3 before Power BI Phase 2. Full-stack and Python can be studied in parallel from day one.";
}

document.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
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