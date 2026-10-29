# Groundwork

A lightweight design and production toolkit for professional e-learning in Articulate Rise 360.

**Goal:** make clear, engaging, accessible learning experiences without a complex system to maintain.

Groundwork has three jobs:
1. **Design** — choose a visual treatment that helps learners understand the content.
2. **Components** — reuse tested patterns when they fit, while allowing purposeful new designs.
3. **Production** — generate and test self-contained HTML/CSS/JS blocks for Rise.

## How it works

Blocks are built with the **Web Awesome** component library, styled by the **Groundwork theme** (our colours and fonts). Ask Claude for a block in plain words; it writes the block and gives you one HTML file to paste into a Rise code block. Nothing loads from the internet.

- `theme/groundwork.css` — Groundwork colours, fonts, corners and shadows (the only place these values live)
- `gallery/gallery.html` — every available component, live, in the Groundwork theme (pack it to view: `bun tools/pack.ts gallery/gallery.html`)
- `blocks/` — block sources (`flashcards.html` is the first trial)
- `tools/pack.ts` — makes the paste file: `bun tools/pack.ts blocks/flashcards.html` → `exports/flashcards.html`
- `vendor/` — Web Awesome and Lucide icons, committed so packing needs no installs
- [DESIGN.md](DESIGN.md) — visual principles and provisional direction
- [AGENTS.md](AGENTS.md) — instructions for coding agents, including Codex
- [CLAUDE.md](CLAUDE.md) — short pointer for Claude Code

The previous `groundwork-for-rise` repository remains the reference for existing working components. Do not bulk-copy its design rules or archived components.

## Approach

**Keep the system simple. Let the designs be sophisticated.**

Use native Rise blocks where they meet the learning need. Custom blocks should remain straightforward to inspect, preview, export, and revise. Explore and validate design ideas before turning them into reusable components.

See the [design experiments](experiments/index.html) before starting the technical migration.
