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
