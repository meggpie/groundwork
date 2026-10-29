# Groundwork — agent instructions

This repository is a lightweight Rise 360 design-and-production toolkit. Read [DESIGN.md](DESIGN.md) before making visual decisions.

## How to work

Infer the request mode from the user's goal; do not ask them to select a mode:
- **Explore:** Develop and compare appropriate concepts. Existing implementations are references, not constraints.
- **Refine:** Improve a design while preserving effective, approved aspects.
- **Build:** Implement a selected design as a working Rise block with a preview and requested export.
- **Maintain:** Fix defects without silently changing approved visuals or behaviours.

Preserve the supplied technical facts and terminology. Prefer native Rise when sufficient. Never force content into an existing component merely to maximize reuse. Do not treat an experimental design as an approved production template.

When creating or substantially revising an instructional visual, use **Understand → Compose → Inspect → Refine**:
- **Understand:** Identify what the learner should understand: the central relationship, distinction or mental model.
- **Compose:** Arrange elements to make relationships and reading order clear.
- **Inspect:** Evaluate the rendered design as a whole for weak hierarchy, disconnected elements, excessive containers, awkward spacing, unnecessary text or competing emphasis.
- **Refine:** Address the most significant issue affecting comprehension or composition before presenting the result; preserve elements that already work.

Apply this through design judgment, not mechanical checks. Inspect the rendered design and refine meaningful problems before delivery. Keep review proportional to the complexity of the task, and avoid unnecessary changes to elements that already work. If rendering or browser inspection is unavailable, state the limitation rather than claim visual verification.

## Technical defaults

**Web Awesome is the component foundation; Groundwork is its theme.** Build blocks from Web Awesome components (`<wa-button>`, `<wa-card>`, `<wa-badge>`, `<wa-callout>`, `<wa-details>`, `<wa-tab-group>`, `<wa-dialog>`, `<wa-icon>` …) and style custom parts with Web Awesome and Groundwork tokens (`var(--wa-…)`, `var(--gw-…)`). Don't hand-build a control Web Awesome already provides, and don't add hex values, font stacks or radii to a block: if a value is missing, add it to `theme/groundwork.css`. Custom layouts and diagrams are expected; they share the foundation rather than replacing it.

- **Source:** a block is one normal HTML document (`blocks/<name>.html`, or a course folder): `<title>`, the block's own `<style>`, markup inside `<section class="gw-block">`, and block JavaScript as `<script type="module">`. Don't link the theme or library; the packer adds them.
- **Icons:** Lucide names, `<wa-icon name="book-open">`. List icons that JavaScript inserts in `data-gw-icons="a b"` (and components it creates in `data-gw-components`).
- **Completion:** call `window.gwComplete()` once the learner has done what the block requires.
- **Pack:** `bun tools/pack.ts <source.html>` writes `exports/<name>.html`, a single self-contained file to paste into a Rise code block. It embeds only the components and icons the block uses, the theme and the fonts, and refuses anything loaded from the network. Deliver that file.
- **Check:** open the packed file in a browser with network blocked; test desktop (about 920px), laptop and 390px widths, keyboard use and completion.
- Free components only (see `vendor/README.md`). Use plain HTML, CSS and JavaScript around them; don't add frameworks or other runtime dependencies unless there is a demonstrated need.

Keep individual components understandable. Reuse shared utilities for genuinely repeated behaviour. Maintain accessible semantics, focus states, keyboard operation, readable contrast, responsive layout and reduced-motion support where applicable.

For production blocks, also test meaningful interaction states and keyboard/mobile behaviour, and review the output in a realistic lesson context. Verify Rise-specific completion in Rise: local browser previews alone cannot prove it.

## Change control

Do not bulk-migrate files or legacy instructions from the previous `groundwork-for-rise` repository. Existing production components are references until individually selected for migration. Never change the old repository or deployed lesson implementations as part of the rebuild.

Prefer the smallest implementation and fewest new files that meet the request. Do not create a generic component engine for a one-off graphic. Do not generate extensive extra policy documents. Keep one authority for each decision:
- `DESIGN.md`: principles and provisional visual direction
- `AGENTS.md`: workflow and engineering expectations
- `theme/groundwork.css`: the actual colour, type, shape and depth values
- component source: specific component implementation

When a review changes a preference, update the relevant current guidance instead of adding another permanent exception. Explain any substantial new dependency, abstraction or maintenance cost before adding it.
