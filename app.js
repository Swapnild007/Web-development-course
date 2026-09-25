const trackRoot = document.querySelector("#tracks");
const searchInput = document.querySelector("#search");
const dialog = document.querySelector("#phase-dialog");
const title = document.querySelector("#dialog-title");
const description = document.querySelector("#dialog-description");
const phaseList = document.querySelector("#phase-list");

let tracks = [];

function renderTracks(filter = "") {
  const q = filter.trim().toLowerCase();
  const shown = tracks.filter(track =>
    [track.name, track.description, ...track.phases].join(" ").toLowerCase().includes(q)
  );
  document.querySelector("#track-count").textContent = `${shown.length} ${shown.length === 1 ? "track" : "tracks"}`;
  trackRoot.replaceChildren();
  if (!shown.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No matching tracks. Try another search.";
    trackRoot.append(empty);
    return;
  }
  for (const track of shown) {
    const card = document.createElement("article");
    card.className = "track-card";
    card.style.setProperty("--accent", track.accent);
    card.style.setProperty("--tint", track.tint);
    const top = document.createElement("div");
    top.className = "card-top";
    const icon = document.createElement("span");
    icon.className = "track-icon";
    icon.textContent = track.icon;
    const count = document.createElement("span");
    count.className = "phase-count";
    count.textContent = "4 PHASES";
    top.append(icon, count);
    const heading = document.createElement("h3");
    heading.textContent = track.name;
    const copy = document.createElement("p");
    copy.textContent = track.description;
    const bottom = document.createElement("div");
    bottom.className = "card-bottom";
    const note = document.createElement("span");
    note.textContent = "Beginner to advanced";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "open-track";
    button.textContent = "View roadmap →";
    button.addEventListener("click", () => openRoadmap(track));
    bottom.append(note, button);
    card.append(top, heading, copy, bottom);
    trackRoot.append(card);
  }
}

function openRoadmap(track) {
  title.textContent = track.name;
  description.textContent = track.description;
  phaseList.replaceChildren();
  track.phases.forEach((phase, index) => {
    const item = document.createElement("div");
    item.className = "phase";
    const number = document.createElement("span");
    number.className = "phase-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const body = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = phase;
    const sub = document.createElement("p");
    sub.textContent = index === 3 ? "Production project and capstone" : "Concepts, guided practice, and applied work";
    body.append(heading, sub);
    item.append(number, body);
    phaseList.append(item);
  });
  dialog.showModal();
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
    tracks = data.tracks;
    renderTracks();
  })
  .catch(error => {
    trackRoot.textContent = error.message + " Please run this site through a local web server.";
    console.error(error);
  });