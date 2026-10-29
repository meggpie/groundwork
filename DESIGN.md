# Groundwork visual design foundation

**Status: working direction, not a locked component specification.**

## Purpose

Groundwork helps create clear, engaging and accessible professional learning in Rise 360. The design should support understanding, rather than making all content look alike.

**Keep the system simple. Let the designs be sophisticated.**

## Principles

1. **Design for understanding.** Identify what learners must recognize, relate, compare, decide or practise, then select the simplest suitable representation.
2. **Consistency without uniformity.** Share typography, accessibility, visual hierarchy and interaction conventions. Allow different compositions and levels of visual expression.
3. **Purposeful variety.** Use open layouts, contained treatments and custom diagrams according to their instructional role. Avoid repetitive cards and needless decorative interactions.
4. **Professional with personality.** Aim for a contemporary editorial/product-design sensibility: readable, precise, warm, polished and not sterile.
5. **Design in context.** Review each block beside its surrounding Rise content; judge spacing, background transitions, density and visual rhythm across the lesson.
6. **Accessible by default.** Maintain readable type, sufficient contrast, explicit labels, keyboard operation, visible focus and mobile usability. Do not communicate meaning by colour alone.
7. **Simple to maintain.** Add a reusable abstraction only after a recurring need is demonstrated. Prefer plain HTML, CSS and JavaScript for custom blocks.

## Visual direction to test

These are **starting points**, not new prohibitions. Evaluate them against real examples before locking specific values.

- **Type:** Archivo headings, Atkinson Hyperlegible Next body, IBM Plex Mono selectively for numbers.
- **Core colour candidates:** dark blue `#104C8F`, ice `#E7EDF4`, ink `#1D2030`, white and gold `#DAA82F`. These preserve continuity with the existing system, but are subject to visual testing.
- **Illustration candidates:** cobalt `#3656BD`, plum `#705B83`, jade `#3FBE90`, warm coral `#D9866B`. Choose a restrained subset for each illustration, checking contrast and meaning.
- **Shape:** softened corners; test 12px standard and 20px feature treatments. Square or open forms remain available when appropriate.
- **Depth:** test one soft resting shadow. Use elevation for hierarchy, not on every surface; avoid automatically layering strong borders and shadows.
- **Diagrams:** tailor geometry to the relationships. Make labels close to what they describe, use clear connectors, and allow dark panels for meaningful endpoints or emphasis.
- **Illustrations:** contemporary flat line-and-fill artwork with consistent visual weight. Colour and detail should illuminate, not compete with, the teaching.

## Three visual approaches

- **Open:** icon rows, short sequences, simple comparisons and labels without unnecessary containers.
- **Contained:** worked examples, prompts, practice activities and grouped information that benefits from a distinct surface.
- **Purpose-built:** relationship diagrams, hierarchies, timelines and other explanatory visuals whose composition should follow the subject.

These are **approaches, not component classes**.

## Decision process

1. Identify the exact learning purpose and the explanation immediately surrounding the proposed visual.
2. Decide if native Rise already handles it effectively.
3. Choose an open, contained or purpose-built representation; use a tested component only if its structure fits.
4. Consider the whole lesson composition, accessibility, mobile behaviour and amount of reading required.
5. Explore/refine visually before treating a component as approved.
6. Build and test; preserve approved production implementations unless a change is requested.

## Initial design trials

Test the direction with:
1. An open four-item model-code icon row.
2. A contained professional worked example.
3. A CBHCC–committees–NRC relationship diagram, including shared priorities, reciprocal planning/recommendations, ongoing NRC support, and final publication.

Assess the three together for hierarchy, balance, variation, legibility and course cohesion.

## Avoid instruction drift

Keep current principles here, operational rules in `AGENTS.md`, and component implementation details beside source files. Do not append historical prohibitions each time feedback changes a visual preference. Revise the relevant principle or approved component specification instead. Experimental values are not permanent tokens until approved.
