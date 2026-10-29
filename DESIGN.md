# Groundwork visual design foundation

**Status: initial visual exploration reviewed.** The principles below guide new work. The prototypes are design references, not production templates; exact values remain provisional until tested in Rise.

## Purpose

Groundwork helps create clear, engaging and accessible professional learning in Rise 360. The design should support understanding, rather than making all content look alike.

**Keep the system simple. Let the designs be sophisticated.**

## Principles

1. **Design for understanding.** Design explanatory visuals around the understanding they need to create, not simply the information they contain. Identify what learners must recognize, relate, compare, decide or practise; make the central idea or relationship apparent at first glance, with hierarchy directing attention to the most important concept or distinction.
2. **Consistency without uniformity.** Share typography, accessibility, visual hierarchy and interaction conventions. Allow different compositions and levels of visual expression.
3. **Purposeful variety.** Compose a coherent whole, not a collection of individually styled elements. Make related elements feel related through proximity, alignment, grouping or connectors. Open space, shared backgrounds, cards, pills and colour are tools for communicating relationships, not requirements. Choose open layouts, contained treatments or custom diagrams according to their instructional role.
4. **Professional with personality.** Aim for a contemporary editorial/product-design sensibility: readable, precise, warm, polished and not sterile. Keep instructional components compact and scannable through concise labels, strong hierarchy and purposeful spacing; preserve necessary explanation and comfortable text sizes.
5. **Design in context.** Design desktop-first for Rise 360, including laptop viewing. Review each block beside its surrounding Rise content; complement the lesson’s explanation rather than unnecessarily repeat it, and judge spacing, background transitions, density and visual rhythm. Keep mobile layouts readable and functional, preserving the meaning of relationships when rearranging them.
6. **Accessible by default.** Maintain readable type, sufficient contrast, explicit labels, keyboard operation, visible focus and mobile usability. Do not communicate meaning by colour alone.
7. **Simple to maintain.** Add a reusable abstraction only after a recurring need is demonstrated. Prefer plain HTML, CSS and JavaScript for custom blocks.

## Foundation

Blocks are built on **Web Awesome**, themed with Groundwork's colours and fonts in `theme/groundwork.css`. Web Awesome provides consistent controls, spacing, states, focus and accessibility; Groundwork decides how they look and how each visual is composed. Use the library for anything that is a control or a standard surface, and reserve custom design effort for composition and explanatory visuals.

## Visual direction

These are **starting points**, not new prohibitions. Evaluate them against real examples before locking specific values.

- **Type:** Archivo headings, Atkinson Hyperlegible Next body (17px in blocks), IBM Plex Mono selectively for numbers.
- **Colour roles:** ink carries text and structure; dark blue is for actions, links and focus, and for dark panels that mark a situation or an endpoint. When related items differ, give each its own illustration hue (as in the model-codes trial) instead of making everything blue. Gold marks a conclusion or what matters most.
- **Icons:** Lucide line icons, coloured with the item's hue or ink.
- **Core colour candidates:** dark blue `#104C8F`, ice `#E7EDF4`, ink `#1D2030`, white and gold `#DAA82F`. These preserve continuity with the existing system, but are subject to visual testing.
- **Illustration candidates:** cobalt `#3656BD`, plum `#705B83`, jade `#3FBE90`, warm coral `#D9866B`. Use expressive illustration colours purposefully, choosing a restrained subset for each illustration and checking contrast and meaning. The trials’ exact combinations are not a required palette for every component.
- **Shape:** rounded corners are part of the visual direction where a surface is useful. Choose their scale for the composition; the prototypes’ radii are not universal rules. Preserve open layouts and avoid unnecessary nested containers.
- **Depth:** subtle drop shadows are part of the visual direction. Apply elevation where it clarifies grouping or interaction rather than automatically to every element. Avoid combining heavy borders with heavy shadows.
- **Diagrams:** tailor geometry to the actual relationships; do not invent or oversimplify roles, sequence or authority. Keep labels close to their referents, use clear connectors, and allow dark panels for meaningful endpoints or emphasis.
- **Illustrations:** contemporary flat line-and-fill artwork with consistent visual weight. Colour and detail should illuminate, not compete with, the teaching.

## Three visual approaches

- **Open:** icon rows, short sequences, simple comparisons and labels without unnecessary containers.
- **Contained:** worked examples, prompts, practice activities and grouped information that benefits from a distinct surface.
- **Purpose-built:** relationship diagrams, hierarchies, timelines and other explanatory visuals whose composition should follow the subject.

These are **design approaches, not new component classes**. Do not turn each approach into its own rendering engine.

## Decision process

1. Identify the understanding the visual should create and how it complements the surrounding explanation.
2. Decide if native Rise already handles it effectively.
3. Choose and arrange a representation so relationships and reading order are clear; use a tested component only if its structure fits.
4. Consider the whole lesson composition, accessibility, mobile behaviour and amount of reading required.
5. Inspect the rendered composition as a whole and refine meaningful problems before treating it as approved.
6. Build and test; preserve approved production implementations unless a change is requested.

## Initial design trials

The reviewed standalone trials are preserved in [experiments/](experiments/index.html):
1. An open four-item model-code icon row.
2. A contained professional worked example.
3. A CBHCC–committees–NRC relationship diagram, including shared priorities, reciprocal planning/recommendations, ongoing NRC support, and final publication.

These trials support the principles above, not universal layouts, dimensions or colour combinations. Choose each composition for its instructional purpose; numbered steps, for example, suit the reviewed worked example but are not required for every worked example. Promote a treatment to the reusable library only when it proves useful beyond its initial example.

## Accessibility checks

Test meaningful text and graphics in context, including mobile widths. Target WCAG AA contrast for normal text (4.5:1), large text (3:1), and meaningful graphical elements (3:1). Gold, jade and coral can work well as fills or accents but are generally too low-contrast for small text on white. Never rely on colour alone to convey meaning.

## Avoid instruction drift

Keep current principles here, operational rules in `AGENTS.md`, and component implementation details beside source files. Do not append historical prohibitions each time feedback changes a visual preference. Revise the relevant principle or approved component specification instead. Experimental values are not permanent tokens until approved. When production tokens exist, keep their actual hex values and dimensions in one code location; this guide should explain the choices rather than duplicate code-level settings.
