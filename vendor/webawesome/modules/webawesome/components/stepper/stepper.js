import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { WaBeforeStepChangeEvent } from "../../events/before-step-change.js";
import { WaStepChangeEvent } from "../../events/step-change.js";
import { announce } from "../../internal/live-announcer.js";
import { parseSpaceDelimitedTokens } from "../../internal/parse.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import visuallyHidden from "../../styles/component/visually-hidden.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../step/step.js";
import styles from "./stepper.styles.js";
export default class WaStepper extends WebAwesomeElement {
  static css = [visuallyHidden, styles];
  constructor() {
    super();
    this.localize = new LocalizeController(this);
    this.isStacked = false;
    this.activeIndex = 0;
    this.stepCount = 0;
    this.active = "";
    this.orientation = "horizontal";
    this.linear = false;
    this.clickable = false;
    this.label = "";
    if (!isServer) {
      this.addEventListener("click", this.handleClick);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    if (isServer)
      return;
    this.updateComplete.then(() => {
      this.handleSlotChange();
      this.mutationObserver = new MutationObserver((mutations) => {
        const isOwnMutation = mutations.some((mutation) => mutation.target.closest?.("wa-stepper") === this);
        if (isOwnMutation)
          this.syncSteps();
      });
      this.mutationObserver.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["name", "completed", "loading", "disabled", "variant"]
      });
    });
    this.resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        for (const entry of entries) {
          this.updateStacking(entry.borderBoxSize[0].inlineSize);
        }
      });
    });
    this.resizeObserver.observe(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }
  handleSlotChange() {
    if (this.didSSR) {
      const pending = this.getAllSteps().filter((step) => step.didSSR && !step.hasUpdated).map((step) => step.updateComplete);
      if (pending.length > 0) {
        Promise.allSettled(pending).then(() => this.handleSlotChange());
        return;
      }
    }
    this.syncSteps();
  }
  getAllSteps() {
    if (!this.defaultSlot)
      return [];
    return this.defaultSlot.assignedElements().filter((el) => el.localName === "wa-step");
  }
  getLinearBoundaryIndex(steps) {
    const firstIncompleteIndex = steps.findIndex((step) => !step.completed);
    return firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex;
  }
  isReachable(step, steps = this.getAllSteps()) {
    if (step.disabled)
      return false;
    if (!this.linear)
      return true;
    return steps.indexOf(step) <= this.getLinearBoundaryIndex(steps);
  }
  syncSteps() {
    const steps = this.getAllSteps();
    if (steps.length === 0)
      return;
    let activeStep = steps.find((step) => step.name === this.active);
    if (!activeStep) {
      if (this.active) {
        console.warn(`A step named "${this.active}" could not be found. Falling back to the first step.`, this);
      }
      activeStep = steps[0];
    }
    const boundaryIndex = this.getLinearBoundaryIndex(steps);
    this.activeIndex = steps.indexOf(activeStep);
    this.stepCount = steps.length;
    this.updateStacking(this.getBoundingClientRect().width);
    const isVertical = this.orientation === "vertical" || this.isStacked;
    steps.forEach((step, index) => {
      step.position = index + 1;
      step.active = step === activeStep;
      step.locked = this.linear && index > boundaryIndex;
      step.clickable = this.clickable;
      const previous = steps[index - 1];
      step.connectorStartVariant = previous?.completed ? previous.variant : undefined;
      step.toggleAttribute("data-wa-step-vertical", isVertical);
    });
    this.customStates.set("completed", steps.every((step) => step.completed));
    this.customStates.set("loading", steps.some((step) => step.loading));
    this.customStates.set("stacked", isVertical);
  }
  handleStateChange() {
    this.syncSteps();
  }
  updateStacking(width) {
    if (this.orientation !== "auto" || !this.stepsEl) {
      this.isStacked = false;
      return;
    }
    const stepCount = this.getAllSteps().length;
    const fontSize = parseFloat(getComputedStyle(this).fontSize);
    const gap = parseFloat(getComputedStyle(this.stepsEl).columnGap) || 0;
    const minRowWidth = stepCount * fontSize * 6 + Math.max(0, stepCount - 1) * gap;
    this.isStacked = width < minRowWidth;
  }
  goTo(name) {
    const steps = this.getAllSteps();
    const target = steps.find((step) => step.name === name);
    if (!target || !this.isReachable(target, steps))
      return;
    const previousStep = steps.find((step) => step.active) ?? null;
    if (target === previousStep)
      return;
    const detail = { name: target.name, previousName: previousStep?.name ?? null, step: target, previousStep };
    const changeEvent = new WaBeforeStepChangeEvent(detail);
    this.dispatchEvent(changeEvent);
    if (changeEvent.defaultPrevented)
      return;
    this.active = target.name;
    this.updateComplete.then(() => {
      this.dispatchEvent(new WaStepChangeEvent(detail));
      this.announceActiveStep();
    });
  }
  announceActiveStep() {
    announce(this.localize.term("stepXOfY", this.activeIndex + 1, this.stepCount), "polite");
  }
  next() {
    const steps = this.getAllSteps();
    const activeIndex = steps.findIndex((step) => step.active);
    const next = steps[activeIndex + 1];
    if (next)
      this.goTo(next.name);
  }
  previous() {
    const steps = this.getAllSteps();
    const activeIndex = steps.findIndex((step) => step.active);
    const previous = activeIndex > 0 ? steps[activeIndex - 1] : undefined;
    if (previous)
      this.goTo(previous.name);
  }
  handleClick(event) {
    if (!this.clickable)
      return;
    const step = event.target.closest("wa-step");
    if (!step || step.closest("wa-stepper") !== this || step.disabled)
      return;
    this.goTo(step.name);
  }
  render() {
    const label = this.label || this.localize.term("steps");
    const body = html`
      ${this.stepCount > 0 ? html`
            <span part="summary" class="wa-visually-hidden">
              ${this.localize.term("stepXOfY", this.activeIndex + 1, this.stepCount)}
            </span>
          ` : ""}
      <ol part="steps" class="steps" role="list">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </ol>
    `;
    return this.clickable ? html`<nav part="stepper" class="stepper" aria-label=${label}>${body}</nav>` : html`<div part="stepper" class="stepper" role="group" aria-label=${label}>${body}</div>`;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".steps")
], WaStepper.prototype, "stepsEl", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot")
], WaStepper.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaStepper.prototype, "isStacked", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaStepper.prototype, "activeIndex", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaStepper.prototype, "stepCount", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaStepper.prototype, "active", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaStepper.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaStepper.prototype, "linear", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaStepper.prototype, "clickable", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaStepper.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch(["active", "linear", "clickable", "orientation", "isStacked"], { waitUntilFirstUpdate: true })
], WaStepper.prototype, "handleStateChange", null);
WaStepper = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-stepper")
], WaStepper);
if (!isServer) {
  document.addEventListener("click", (event) => {
    const invoker = event.target.closest("[data-stepper]");
    if (!(invoker instanceof Element))
      return;
    const [command, id, ...rest] = parseSpaceDelimitedTokens(invoker.getAttribute("data-stepper") || "");
    if (!id)
      return;
    const root = invoker.getRootNode();
    const stepper = root.getElementById(id);
    if (stepper?.localName !== "wa-stepper") {
      console.warn(`A stepper with an ID of "${id}" could not be found in this document.`);
      return;
    }
    if (command === "next") {
      stepper.next();
    } else if (command === "previous") {
      stepper.previous();
    } else if (command === "goto" && rest.length > 0) {
      stepper.goTo(rest.join(" "));
    }
  });
}
