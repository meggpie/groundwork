# Groundwork — agent instructions

This repository is a lightweight Rise 360 design-and-production toolkit. Read [DESIGN.md](DESIGN.md) before making visual decisions.

## How to work

Infer the request mode from the user's goal; do not ask them to select a mode:
- **Explore:** Develop and compare appropriate concepts. Existing implementations are references, not constraints.
- **Refine:** Improve a design while preserving effective, approved aspects.
- **Build:** Implement a selected design as a working Rise block with a preview and requested export.
- **Maintain:** Fix defects without silently changing approved visuals or behaviours.

Start with the learning need and preserve the supplied technical facts and terminology. Prefer native Rise when sufficient. Never force content into an existing component merely to maximize reuse. Do not treat an experimental design as an approved production template.

## Technical defaults

Use plain HTML, CSS and JavaScript without introducing a framework or runtime dependencies unless there is a demonstrated need. Keep individual components understandable. Reuse shared utilities for genuinely repeated behaviour. Maintain accessible semantics, focus states, keyboard operation, readable contrast, responsive layout and reduced-motion support where applicable.

For production blocks, test rendering, meaningful interaction states and keyboard/mobile behaviour, and visually review the output in a realistic lesson context. Verify Rise-specific completion in Rise: local browser previews alone cannot prove it.

## Change control

Do not bulk-migrate files or legacy instructions from the previous `groundwork-for-rise` repository. Existing production components are references until individually selected for migration. Never change the old repository or deployed lesson implementations as part of the rebuild.

Prefer the smallest implementation and fewest new files that meet the request. Do not create a generic component engine for a one-off graphic. Do not generate extensive extra policy documents. Keep one authority for each decision:
- `DESIGN.md`: principles and provisional visual direction
- `AGENTS.md`: workflow and engineering expectations
- component source: specific component implementation

When a review changes a preference, update the relevant current guidance instead of adding another permanent exception. Explain any substantial new dependency, abstraction or maintenance cost before adding it.

## First milestone

Create three **standalone, disposable visual prototypes** in `experiments/`: an open icon row, a contained worked example and a bespoke organizational-relationship diagram. Use simple HTML/CSS for these; do not first recreate the old engine or invent a reusable diagram framework. Review the prototypes together before approving the visual direction, migrating components, or establishing production tokens.
