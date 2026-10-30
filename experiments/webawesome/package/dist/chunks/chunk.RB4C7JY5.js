/*! Copyright 2026 Fonticons, Inc. - https://webawesome.com/license */
import {
  divider_styles_default
} from "./chunk.Q5SV6XNO.js";
import {
  HasSlotController
} from "./chunk.RWNXKUCF.js";
import {
  watch
} from "./chunk.PZAN6FPN.js";
import {
  WebAwesomeElement
} from "./chunk.AOKMSJXD.js";
import {
  __decorateClass
} from "./chunk.7VGCIHDG.js";

// src/components/divider/divider.ts
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
var WaDivider = class extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "[default]");
    this.orientation = "horizontal";
    this.withLabel = false;
    this.labelPlacement = "center";
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "separator");
  }
  willUpdate(changedProperties) {
    this.withLabel = this.hasSlotController.test("[default]", "withLabel");
    super.willUpdate(changedProperties);
  }
  handleVerticalChange() {
    this.setAttribute("aria-orientation", this.orientation);
  }
  handleSlotChange() {
    if (this.internals) {
      this.internals.ariaLabel = this.textContent?.trim() || null;
    }
  }
  render() {
    return html`
      <div part="label" class="label">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
};
WaDivider.css = divider_styles_default;
__decorateClass([
  property({ reflect: true })
], WaDivider.prototype, "orientation", 2);
__decorateClass([
  property({ attribute: "with-label", type: Boolean, reflect: true })
], WaDivider.prototype, "withLabel", 2);
__decorateClass([
  property({ attribute: "label-placement", reflect: true })
], WaDivider.prototype, "labelPlacement", 2);
__decorateClass([
  watch("orientation")
], WaDivider.prototype, "handleVerticalChange", 1);
WaDivider = __decorateClass([
  customElement("wa-divider")
], WaDivider);

export {
  WaDivider
};
