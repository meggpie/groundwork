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

See the initial design-foundation pull request before starting the technical migration.
