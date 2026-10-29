# Groundwork — agent instructions

This repository is a lightweight Rise 360 design-and-production toolkit. Read [DESIGN.md](DESIGN.md) before making visual decisions.

## How to work

Infer the request mode from the user's goal; do not ask them to select a mode:
- **Explore:** Develop and compare appropriate concepts. Existing implementations are references, not constraints.
- **Refine:** Improve a design while preserving effective, approved aspects.
- **Build:** Implement a selected design as a working Rise block with a preview and requested export.
- **Maintain:** Fix defects without silently changing approved visuals or behaviours.

Preserve the supplied technical facts and terminology. Use Groundwork custom components by default for instructional visuals and interactions; use native Rise when specifically requested or necessary for course-level functionality. Never force content into an existing component merely to maximize reuse. Do not treat an experimental design as an approved production template.

When creating or substantially revising an instructional visual, use **Understand → Compose → Inspect → Refine**:
- **Understand:** Identify what the learner should understand: the central relationship, distinction or mental model.
- **Compose:** Arrange elements to make relationships and reading order clear.
- **Inspect:** Evaluate the rendered design as a whole for weak hierarchy, disconnected elements, excessive containers, awkward spacing, unnecessary text or competing emphasis.
- **Refine:** Address the most significant issue affecting comprehension or composition before presenting the result; preserve elements that already work.

Apply this through design judgment, not mechanical checks. Inspect the rendered design and refine meaningful problems before delivery. Keep review proportional to the complexity of the task, and avoid unnecessary changes to elements that already work. If rendering or browser inspection is unavailable, state the limitation rather than claim visual verification.

## Technical defaults

Use plain HTML, CSS and JavaScript without introducing a framework or runtime dependencies unless there is a demonstrated need. Keep individual components understandable. Reuse shared utilities for genuinely repeated behaviour. Maintain accessible semantics, focus states, keyboard operation, readable contrast, responsive layout and reduced-motion support where applicable.

For production blocks, also test meaningful interaction states and keyboard/mobile behaviour, and review the output in a realistic lesson context against its intended white and ice-blue Rise backgrounds. Verify Rise-specific completion in Rise: local browser previews alone cannot prove it.

## Change control

Do not bulk-migrate files or legacy instructions from the previous `groundwork-for-rise` repository. Existing production components are references until individually selected for migration. Never change the old repository or deployed lesson implementations as part of the rebuild.

Prefer the smallest implementation and fewest new files that meet the request. Do not create a generic component engine for a one-off graphic. Do not generate extensive extra policy documents. Keep one authority for each decision:
- `DESIGN.md`: principles and provisional visual direction
- `AGENTS.md`: workflow and engineering expectations
- component source: specific component implementation

When a review changes a preference, update the relevant current guidance instead of adding another permanent exception. Explain any substantial new dependency, abstraction or maintenance cost before adding it.
