# Web Development Course Studio

A mobile-first learning app for four tracks: Full-stack Web Development, Python, Excel, and Power BI.

## Run locally

Open `index.html` in a browser, or serve this folder with any static HTTP server.

## Publish with GitHub Pages

In repository **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/(root)`, then save.

## Curriculum and learning content

`data/curriculum.json` defines four tracks, four phases per track, topic sequence, phase projects, and checkpoints. Full-stack Web Development has dedicated guided lesson content across all four phases. Phase 02's authored lessons are expanded with additional concept walkthroughs and implementation labs; the reader prefers that expanded material when opening those topics.

Python, Excel, and Power BI have dedicated Phase 01 guided lessons and authored Phase 02 lesson material. Their Phases 3–4 currently provide syllabus topics, projects, and checkpoints with a general study scaffold rather than fully authored topic-by-topic teaching lessons. Do not interpret a phase outline or topic count as proof that each topic has a complete lesson.

The lesson reader supports explanations, syntax notes, code examples, worked examples, practice tasks, revealable knowledge checks, and official reference links. Treat framework behavior—especially caching and revalidation—as version-specific and check the official documentation for the version used in your project.

## Current architecture and progress

- Static HTML, CSS, and JavaScript; no build step or package manifest.
- Curriculum data in `data/curriculum.json`.
- Responsive interface with track search and phase/topic navigation.
- Lesson completion is stored locally in the browser on the current device.
- The repository's content and source can be checked without a build; a browser/device smoke test is a separate validation step.
