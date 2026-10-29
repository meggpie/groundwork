import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { WaAccordionAfterCollapseEvent } from "../../events/accordion-after-collapse.js";
import { WaAccordionAfterExpandEvent } from "../../events/accordion-after-expand.js";
import { WaAccordionCollapseEvent } from "../../events/accordion-collapse.js";
import { WaAccordionExpandEvent } from "../../events/accordion-expand.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import"../accordion-item/accordion-item.js";
import styles from "./accordion.styles.js";
export default class WaAccordion extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.mode = "multiple";
    this.iconPlacement = "end";
    this.headingLevel = "3";
    this.appearance = "outlined";
  }
  static css = styles;
  getAllItems() {
    return this.defaultSlot.assignedElements({ flatten: true }).filter((el) => el.tagName.toLowerCase() === "wa-accordion-item");
  }
  getFocusableItems() {
    return this.getAllItems().filter((item) => !item.disabled);
  }
  ownsItem(item) {
    return item.closest("wa-accordion") === this;
  }
  handleSlotChange() {
    if (this.didSSR) {
      const promises = [];
      this.getAllItems().forEach((item) => {
        if (item.didSSR && !item.hasUpdated) {
          promises.push(item.updateComplete);
        }
      });
      if (promises.length > 0) {
        Promise.allSettled(promises).then(() => {
          this.handleSlotChange();
        });
        return;
      }
    }
    this.syncIconPlacement();
    this.syncHeadingLevel();
    this.syncAppearance();
  }
  handleKeyDown(event) {
    const items = this.getFocusableItems();
    if (!items.length)
      return;
    const path = event.composedPath();
    const closestItem = path.find((el) => el instanceof Element && el.tagName.toLowerCase() === "wa-accordion-item");
    if (!closestItem || !this.ownsItem(closestItem))
      return;
    const currentIndex = items.findIndex((item) => item === closestItem);
    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowUp":
        event.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }
    items[nextIndex].focus();
  }
  syncIconPlacement() {
    this.getAllItems().forEach((item) => item.iconPlacement = this.iconPlacement);
  }
  syncHeadingLevel() {
    this.getAllItems().forEach((item) => item.headingLevel = this.headingLevel);
  }
  syncAppearance() {
    this.getAllItems().forEach((item) => item.appearance = this.appearance);
  }
  async handleItemTrigger(event) {
    const { item } = event.detail;
    if (!this.ownsItem(item))
      return;
    event.stopPropagation();
    if (item.disabled)
      return;
    if (item.expanded) {
      if (this.mode === "single")
        return;
      const waCollapse = new WaAccordionCollapseEvent({ item });
      this.dispatchEvent(waCollapse);
      if (waCollapse.defaultPrevented)
        return;
      await item.collapse();
      this.dispatchEvent(new WaAccordionAfterCollapseEvent({ item }));
    } else {
      if (this.mode === "single" || this.mode === "single-collapsible") {
        this.getAllItems().filter((i) => i !== item && i.expanded).forEach((i) => i.collapse());
      }
      const waExpand = new WaAccordionExpandEvent({ item });
      this.dispatchEvent(waExpand);
      if (waExpand.defaultPrevented)
        return;
      await item.expand();
      this.dispatchEvent(new WaAccordionAfterExpandEvent({ item }));
    }
  }
  expandAll() {
    if (this.mode === "single" || this.mode === "single-collapsible")
      return;
    this.getAllItems().filter((item) => !item.disabled && !item.expanded).forEach((item) => item.expand());
  }
  collapseAll() {
    this.getAllItems().filter((item) => item.expanded).forEach((item) => item.collapse());
  }
  render() {
    return html`
      <slot
        @slotchange=${this.handleSlotChange}
        @wa-accordion-item-trigger=${this.handleItemTrigger}
        @keydown=${this.handleKeyDown}
      ></slot>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("slot")
], WaAccordion.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaAccordion.prototype, "mode", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "icon-placement", reflect: true })
], WaAccordion.prototype, "iconPlacement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "heading-level", reflect: true })
], WaAccordion.prototype, "headingLevel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaAccordion.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("iconPlacement", { waitUntilFirstUpdate: true })
], WaAccordion.prototype, "syncIconPlacement", null);
__legacyDecorateClassTS_3r173x8m([
  watch("headingLevel", { waitUntilFirstUpdate: true })
], WaAccordion.prototype, "syncHeadingLevel", null);
__legacyDecorateClassTS_3r173x8m([
  watch("appearance", { waitUntilFirstUpdate: true })
], WaAccordion.prototype, "syncAppearance", null);
WaAccordion = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-accordion")
], WaAccordion);
