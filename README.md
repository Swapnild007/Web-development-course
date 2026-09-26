# Web Development Course Studio

A mobile-first learning app for four tracks: Full-stack Web Development, Python, Excel, and Power BI.

## Run locally

Serve this folder with a static HTTP server, then open its local HTTP address in a browser. The app fetches JSON curriculum files, so opening `index.html` directly as a `file://` URL may be blocked by browser security.

## Publish with GitHub Pages

In repository **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/(root)`, then save.

## Curriculum and learning content

`data/curriculum.json` defines the four tracks, four phases per track, topic sequence, phase projects, and checkpoints. Full-stack Web Development has authored guided lessons across all four phases. Phase 02 lessons have been expanded with concept explanations and implementation labs. Python, Excel, and Power BI have authored Phase 01 lessons and Phase 02 lesson data; their Phases 3–4 remain syllabus scaffolds. For any topic without a dedicated lesson, the reader displays a short study scaffold rather than a complete tutorial. The lesson reader supports explanations, code examples, syntax notes, worked examples, revealable knowledge checks, practice tasks, and reference links.

## Current architecture and progress

- Static HTML, CSS, and JavaScript; no build step.
- Curriculum data in `data/curriculum.json`.
- Responsive interface with track search and phase/topic navigation.
- Lesson completion is stored in browser local storage on the current device/browser.
- This app does not currently sync progress across devices or accounts.
