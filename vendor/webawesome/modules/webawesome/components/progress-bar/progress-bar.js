import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { clamp } from "../../internal/math.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import styles from "./progress-bar.styles.js";
export default class WaProgressBar extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.value = 0;
    this.indeterminate = false;
    this.label = "";
  }
  static css = styles;
  willUpdate(changedProperties) {
    if (this.style == null) {
      this.setStyleProperty("--percentage", `${clamp(this.value, 0, 100)}%`);
    }
    super.willUpdate(changedProperties);
  }
  updated(changedProperties) {
    if (changedProperties.has("value")) {
      requestAnimationFrame(() => {
        this.style.setProperty("--percentage", `${clamp(this.value, 0, 100)}%`);
      });
    }
    super.updated(changedProperties);
  }
  render() {
    return html`
      <div
        part="base progress-bar"
        class="progress-bar"
        role="progressbar"
        title=${ifDefined(this.title)}
        aria-label=${this.label.length > 0 ? this.label : this.localize.term("progress")}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${this.indeterminate ? "0" : this.value}
      >
        <div part="indicator" class="indicator">
          ${!this.indeterminate ? html` <slot part="label" class="label"></slot> ` : ""}
        </div>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaProgressBar.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaProgressBar.prototype, "indeterminate", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaProgressBar.prototype, "label", undefined);
WaProgressBar = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-progress-bar")
], WaProgressBar);
