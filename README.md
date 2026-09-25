# Web Development Course Studio

A mobile-first learning app for four tracks: Full-stack Web Development, Python, Excel, and Power BI.

## Run locally

Open `index.html` in a browser, or serve this folder with any static HTTP server.

## Publish with GitHub Pages

In repository **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/(root)`, then save.

## Curriculum and learning content

`data/curriculum.json` defines the four tracks, four phases per track, topic sequence, phase projects, and checkpoints. Phase 01 has authored guided lessons for all four tracks. The lesson reader supports explanations, code examples, syntax notes, worked examples, revealable knowledge checks, practice tasks, and official reference links.

Later phases currently use the syllabus-based study scaffold unless a topic has a dedicated authored lesson. Do not interpret the full four-phase curriculum outline as proof that every later lesson is already written.

## Current architecture and progress

- Static HTML, CSS, and JavaScript; no build step.
- Curriculum data in `data/curriculum.json`.
- Responsive interface with track search and phase/topic navigation.
- Lesson completion is stored in browser local storage on the current device/browser.
- This app does not currently sync progress across devices or accounts.
