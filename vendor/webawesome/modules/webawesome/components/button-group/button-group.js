import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./button-group.styles.js";
export default class WaButtonGroup extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.disableRole = false;
    this.hasOutlined = false;
    this.label = "";
    this.orientation = "horizontal";
  }
  static css = [styles];
  handleLabelChange() {
    if (this.internals) {
      this.internals.role = this.disableRole ? "presentation" : "group";
      this.internals.ariaLabel = this.disableRole ? null : this.label || null;
    }
  }
  handleFocus(event) {
    const button = findButton(event.target);
    button?.classList.add("button-focus");
  }
  handleBlur(event) {
    const button = findButton(event.target);
    button?.classList.remove("button-focus");
  }
  handleMouseOver(event) {
    const button = findButton(event.target);
    button?.classList.add("button-hover");
  }
  handleMouseOut(event) {
    const button = findButton(event.target);
    button?.classList.remove("button-hover");
  }
  render() {
    return html`
      <slot
        part="base"
        class="button-group"
        @focusout=${this.handleBlur}
        @focusin=${this.handleFocus}
        @mouseover=${this.handleMouseOver}
        @mouseout=${this.handleMouseOut}
      ></slot>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("slot")
], WaButtonGroup.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaButtonGroup.prototype, "disableRole", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaButtonGroup.prototype, "hasOutlined", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaButtonGroup.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaButtonGroup.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch(["label", "disableRole"])
], WaButtonGroup.prototype, "handleLabelChange", null);
WaButtonGroup = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-button-group")
], WaButtonGroup);
function findButton(el) {
  const selector = "wa-button, wa-radio-button";
  return el.closest(selector) ?? el.querySelector(selector);
}
