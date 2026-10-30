# Groundwork

A lightweight design and production toolkit for professional e-learning in Articulate Rise 360.

**Goal:** make clear, engaging, accessible learning experiences without a complex system to maintain.

Groundwork has three jobs:
1. **Design** — choose a visual treatment that helps learners understand the content.
2. **Components** — reuse tested patterns when they fit, while allowing purposeful new designs.
3. **Production** — generate and test self-contained HTML/CSS/JS blocks for Rise.

## Current status

This is a clean rebuild. The visual foundation is being developed before migrating any legacy code.

- [DESIGN.md](DESIGN.md) — visual principles and provisional direction
- [AGENTS.md](AGENTS.md) — instructions for coding agents, including Codex
- [CLAUDE.md](CLAUDE.md) — short pointer for Claude Code

The previous `groundwork-for-rise` repository remains the reference for existing working components. Do not bulk-copy its design rules or archived components.

## Approach

**Keep the system simple. Let the designs be sophisticated.**

Use native Rise blocks where they meet the learning need. Custom blocks should remain straightforward to inspect, preview, export, and revise. Explore and validate design ideas before turning them into reusable components.

See the [design experiments](experiments/index.html) before starting the technical migration.

## Flashcards export pilot

The new Flashcards preserve the current showcase design and use the original Python **content → render → preview/paste** workflow. Python 3.10+ is the only build requirement; no packages or learner runtime dependencies are required. Use `py` instead of `python` if that is how Python is installed on your machine.

1. Edit [the Explore preset](library/presets/flashcards--explore.json), [the Recall preset](library/presets/flashcards--recall.json), or [the course example](courses/demo/review-concepts/block.json).
2. Generate a browser preview from that content:
   ```powershell
   python make-rise.py preview courses/demo/review-concepts
   ```
   Open the generated file in `library/previews/`. It embeds the exact paste document in an iframe, with an outer white/ice-blue background toggle. No server is required.
3. Generate the self-contained HTML:
   ```powershell
   python make-rise.py paste courses/demo/review-concepts
   python make-rise.py paste courses/demo/review-concepts --copy
   ```
   The second command also copies the **HTML text** to the Windows clipboard. Paste it into Rise's Code Block **Add code** editor. Files are written to `exports/*--paste.html`; no ZIP is generated. `render SOURCE` writes the same HTML to stdout. `preview` without a source regenerates all pilot examples; `check` validates their content and assets.

Presets contain editable data directly; course `block.json` uses `{ "component": "flashcards", "data": { ... } }`. Each card has `front.heading` and `back.text`; `front.text`, either face's `label`, and front artwork are optional. Set `front.icon` to a local `assets/icons/` SVG name or `front.artwork` to an image path relative to the JSON file. Icons and artwork are embedded, never fetched. Artwork is decorative; put any instructional meaning in the visible text.

`use` selects contextual Explore/Recall action wording, not a different design. Optional `revealLabel` and `returnLabel` override that wording. `tracking` controls local viewed feedback and defaults to false; it does not send Rise completion or persist between page loads. Titles and instructions are optional. Content fields are plain text (newlines supported), not executable HTML.

Implementation lives in `components/flashcards.css` and `components/flashcards.js`; foundations and fonts are read from their current experimental locations without moving or altering them. The exporter embeds the three required font faces, their licence notices, component CSS/JS and referenced artwork. Edit content and regenerate rather than editing generated files. This is a working pilot; Rise-specific integration and completion remain unverified until tested inside Rise.

## Lesson 2 definition

The Standard definition uses `components/definition.css` and editable content in `courses/scs101/lesson-2/standard/block.json`. Copy is plain text; `emphasis` identifies one exact phrase to render in bold. The complete definition is always visible.

```powershell
python make-rise.py preview courses/scs101/lesson-2/standard
python make-rise.py paste courses/scs101/lesson-2/standard --copy
```

The paste command generates `exports/scs101--lesson-2--standard--paste.html`, embedding CSS, fonts and font licences. Every completed custom component requires a self-contained paste-ready export and browser review of that export. The preview embeds the same document for review against white and ice-blue backgrounds.

## Expandable list

`components/expandable-list.css` follows the existing accordion treatment. Independent HTML `details`/`summary` controls provide keyboard operation and multiple open rows without JavaScript. Content lives in `courses/scs101/lesson-2/what-standards-cover/block.json`; each row has a heading, visible summary, explanation, example code, italicized example title and example text. Reuse the `expandable-list` component with another row set as needed.

```powershell
python make-rise.py preview courses/scs101/lesson-2/what-standards-cover
python make-rise.py paste courses/scs101/lesson-2/what-standards-cover --copy
```

The final export is `exports/scs101--lesson-2--what-standards-cover--paste.html`. Browser checks are in `tests/check-expandable-list-browser.cjs` (pass an installed Playwright module path as its first argument).

## Lesson 2 Knowledge Check

The selected Lesson 1 Knowledge Check was individually migrated from the previous repository without modifying it. Its markup, sequential question flow, incorrect-answer retries, feedback, Next/Finish controls and restart behaviour live in `components/knowledge-check.html`, `.css` and `.js`. Lesson 2 uses the requested blue selection/surround, green correct and red incorrect states. Mobile result labels wrap below the answer text.

Edit `courses/scs101/lesson-2/knowledge-check/block.json`, then run `python make-rise.py paste courses/scs101/lesson-2/knowledge-check` and `python make-rise.py preview courses/scs101/lesson-2/knowledge-check`. The selected template supports two questions with three answers each. Text is escaped; answer order is preserved. Fonts and font licences, CSS and JavaScript are embedded in the export. `tests/check-knowledge-check-browser.cjs` checks the actual export (pass a local Playwright module path).

Completion retains the Lesson 1 `{type: "complete"}` parent message after Finish. Local testing verifies message emission; Rise completion handling must be verified inside Rise. Progress is local to the current document and resets on reload.
