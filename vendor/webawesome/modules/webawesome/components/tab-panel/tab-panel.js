import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./tab-panel.styles.js";
let id = 0;
export default class WaTabPanel extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.attrId = ++id;
    this.componentId = `wa-tab-panel-${this.attrId}`;
    this.name = "";
    this.active = false;
    this.role = "tabpanel";
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    this.id = (this.id || "").length > 0 ? this.id : this.componentId;
  }
  handleActiveChange() {
    this.setAttribute("aria-hidden", this.active ? "false" : "true");
  }
  render() {
    return html`
      <slot
        part="base"
        class=${classMap({
      "tab-panel": true,
      "tab-panel-active": this.active
    })}
      ></slot>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTabPanel.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTabPanel.prototype, "active", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTabPanel.prototype, "role", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("active")
], WaTabPanel.prototype, "handleActiveChange", null);
WaTabPanel = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-tab-panel")
], WaTabPanel);
