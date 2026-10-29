# Groundwork — agent instructions

This repository is a lightweight Rise 360 design-and-production toolkit. Read [DESIGN.md](DESIGN.md) before making visual decisions.

## How to work

Infer the request mode:
- **Explore:** Develop and compare appropriate concepts. Existing implementations are references, not constraints.
- **Refine:** Improve a design while preserving effective, approved aspects.
- **Build:** Implement a selected design as a working Rise block with a preview and requested export.
- **Maintain:** Fix defects without silently changing approved visuals or behaviours.

Start with the learning need. Prefer native Rise when sufficient. Never force content into an existing component merely to maximize reuse.

## Technical defaults

Use plain HTML, CSS and JavaScript without introducing a framework or runtime dependencies unless there is a demonstrated need. Keep individual components understandable. Reuse shared utilities for genuinely repeated behaviour. Maintain accessible semantics, focus states, keyboard operation, readable contrast, responsive layout and reduced-motion support where applicable.

For production blocks, test rendering, meaningful interaction states and keyboard/mobile behaviour. Verify Rise-specific completion in Rise: local browser previews alone cannot prove it.

## Change control

Do not bulk-migrate files or legacy instructions from the previous `groundwork-for-rise` repository. Existing production components are references until individually selected for migration. Never change the old repository or deployed lesson implementations as part of the rebuild.

Do not generate extensive extra policy documents. Keep one authority for each decision:
- `DESIGN.md`: principles and provisional visual direction
- `AGENTS.md`: workflow and engineering expectations
- component source: specific component implementation

When a review changes a preference, update the relevant current guidance instead of adding another permanent exception. Explain any substantial new dependency, abstraction or maintenance cost before adding it.

## First milestone

Create visual trials for an open icon row, a contained worked example and a bespoke organizational-relationship diagram. Review the output together before migrating the old production engine or declaring component styles approved.
