import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./tab.styles.js";
let id = 0;
export default class WaTab extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.attrId = ++id;
    this.componentId = `wa-tab-${this.attrId}`;
    this.panel = "";
    this.active = false;
    this.disabled = false;
    this.tabIndex = 0;
    this.slot = "nav";
    this.role = "tab";
  }
  static css = styles;
  handleActiveChange() {
    this.setAttribute("aria-selected", this.active ? "true" : "false");
  }
  handleDisabledChange() {
    this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
    if (this.disabled && !this.active) {
      this.tabIndex = -1;
    } else {
      this.tabIndex = 0;
    }
  }
  render() {
    this.id = this.id?.length > 0 ? this.id : this.componentId;
    return html`
      <div
        part="base tab"
        class=${classMap({
      tab: true,
      "tab-active": this.active
    })}
      >
        <slot></slot>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".tab")
], WaTab.prototype, "tab", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTab.prototype, "panel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTab.prototype, "active", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTab.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaTab.prototype, "tabIndex", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTab.prototype, "slot", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTab.prototype, "role", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("active")
], WaTab.prototype, "handleActiveChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled")
], WaTab.prototype, "handleDisabledChange", null);
WaTab = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-tab")
], WaTab);
