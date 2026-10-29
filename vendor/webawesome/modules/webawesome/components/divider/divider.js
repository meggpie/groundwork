import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { HasSlotController } from "../../internal/slot.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./divider.styles.js";
export default class WaDivider extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "[default]");
    this.orientation = "horizontal";
    this.withLabel = false;
    this.labelPlacement = "center";
  }
  static css = styles;
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
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDivider.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-label", type: Boolean, reflect: true })
], WaDivider.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "label-placement", reflect: true })
], WaDivider.prototype, "labelPlacement", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("orientation")
], WaDivider.prototype, "handleVerticalChange", null);
WaDivider = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-divider")
], WaDivider);
