import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { WaAccordionItemCollapsedEvent } from "../../events/accordion-item-collapsed.js";
import { WaAccordionItemExpandedEvent } from "../../events/accordion-item-expanded.js";
import { WaAccordionItemTriggerEvent } from "../../events/accordion-item-trigger.js";
import { animate, parseDuration } from "../../internal/animate.js";
import { waitForEvent } from "../../internal/event.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import styles from "./accordion-item.styles.js";
export default class WaAccordionItem extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.animationGeneration = 0;
    this.localize = new LocalizeController(this);
    this.isAnimating = false;
    this.label = "";
    this.expanded = false;
    this.disabled = false;
    this.headingLevel = "3";
    this.iconPlacement = "end";
    this.appearance = "outlined";
  }
  static css = styles;
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.body.style.height = this.expanded ? "auto" : "0";
  }
  updated() {
    this.customStates.set("animating", this.isAnimating);
  }
  handleTriggerClick() {
    if (this.disabled)
      return;
    this.dispatchEvent(new WaAccordionItemTriggerEvent({ item: this }));
  }
  handleTriggerKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleTriggerClick();
    }
  }
  async handleExpandedChange() {
    this.animationGeneration++;
    const generation = this.animationGeneration;
    if (this.expanded) {
      this.isAnimating = true;
      const duration = parseDuration(getComputedStyle(this.body).getPropertyValue("--show-duration") || "200ms");
      const easing = getComputedStyle(this.body).getPropertyValue("--easing") || "ease";
      await animate(this.body, [
        { height: "0", opacity: "0" },
        { height: `${this.body.scrollHeight}px`, opacity: "1" }
      ], { duration, easing });
      if (this.animationGeneration !== generation)
        return;
      this.body.style.height = "auto";
      this.isAnimating = false;
      this.dispatchEvent(new WaAccordionItemExpandedEvent);
    } else {
      this.isAnimating = true;
      const duration = parseDuration(getComputedStyle(this.body).getPropertyValue("--hide-duration") || "200ms");
      const easing = getComputedStyle(this.body).getPropertyValue("--easing") || "ease";
      await animate(this.body, [
        { height: `${this.body.scrollHeight}px`, opacity: "1" },
        { height: "0", opacity: "0" }
      ], { duration, easing });
      if (this.animationGeneration !== generation)
        return;
      this.body.style.height = "0";
      this.isAnimating = false;
      this.dispatchEvent(new WaAccordionItemCollapsedEvent);
    }
  }
  async expand() {
    if (this.expanded || this.disabled)
      return;
    this.expanded = true;
    return waitForEvent(this, "wa-accordion-item-expanded");
  }
  async collapse() {
    if (!this.expanded || this.disabled)
      return;
    this.expanded = false;
    return waitForEvent(this, "wa-accordion-item-collapsed");
  }
  async toggle() {
    return this.expanded ? this.collapse() : this.expand();
  }
  focus(options) {
    this.triggerButton?.focus(options);
  }
  renderHeadingWrapper(content) {
    const level = parseInt(this.headingLevel, 10);
    switch (level >= 1 && level <= 6 ? level : 3) {
      case 1:
        return html`<h1 part="heading">${content}</h1>`;
      case 2:
        return html`<h2 part="heading">${content}</h2>`;
      case 4:
        return html`<h4 part="heading">${content}</h4>`;
      case 5:
        return html`<h5 part="heading">${content}</h5>`;
      case 6:
        return html`<h6 part="heading">${content}</h6>`;
      default:
        return html`<h3 part="heading">${content}</h3>`;
    }
  }
  render() {
    const isRtl = !this.hasUpdated ? this.dir === "rtl" : this.localize.dir() === "rtl";
    const button = html`
      <button
        part="button"
        type="button"
        id="trigger"
        aria-expanded=${this.expanded ? "true" : "false"}
        aria-controls="panel"
        aria-disabled=${this.disabled ? "true" : "false"}
        tabindex=${this.disabled ? "-1" : "0"}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeyDown}
      >
        <slot name="label" part="label">${this.label}</slot>
        <span part="icon">
          <slot name="icon">
            <wa-icon library="system" variant="solid" name=${isRtl ? "chevron-left" : "chevron-right"}></wa-icon>
          </slot>
        </span>
      </button>
    `;
    return html`
      <div part="base accordion-item">
        ${this.headingLevel === "none" ? button : this.renderHeadingWrapper(button)}
        <div
          part="panel"
          id="panel"
          class=${classMap({ body: true, animating: this.isAnimating })}
          role="region"
          aria-labelledby="trigger"
        >
          <slot part="content" class="content"></slot>
        </div>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".body")
], WaAccordionItem.prototype, "body", undefined);
__legacyDecorateClassTS_3r173x8m([
  query('[part~="button"]')
], WaAccordionItem.prototype, "triggerButton", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaAccordionItem.prototype, "isAnimating", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaAccordionItem.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaAccordionItem.prototype, "expanded", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaAccordionItem.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "heading-level", reflect: true })
], WaAccordionItem.prototype, "headingLevel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "icon-placement", reflect: true })
], WaAccordionItem.prototype, "iconPlacement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaAccordionItem.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("expanded", { waitUntilFirstUpdate: true })
], WaAccordionItem.prototype, "handleExpandedChange", null);
WaAccordionItem = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-accordion-item")
], WaAccordionItem);
