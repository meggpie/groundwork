import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { styleMap } from "../../../lit/lit/directives/style-map.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import styles from "./progress-ring.styles.js";
export default class WaProgressRing extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.value = 0;
    this.label = "";
  }
  static css = styles;
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("value")) {
      const radius = parseFloat(getComputedStyle(this.indicator).getPropertyValue("r"));
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - this.value / 100 * circumference;
      this.indicatorOffset = `${offset}px`;
    }
  }
  render() {
    return html`
      <div
        part="base progress-ring"
        class="progress-ring"
        role="progressbar"
        aria-label=${this.label.length > 0 ? this.label : this.localize.term("progress")}
        aria-describedby="label"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${this.value}"
        style=${styleMap({ "--percentage": this.value / 100 })}
      >
        <svg class="image">
          <circle part="track" class="track"></circle>
          <circle
            part="indicator"
            class="indicator"
            style=${styleMap({ "stroke-dashoffset": this.indicatorOffset })}
          ></circle>
        </svg>

        <slot id="label" part="label" class="label"></slot>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".indicator")
], WaProgressRing.prototype, "indicator", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaProgressRing.prototype, "indicatorOffset", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaProgressRing.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaProgressRing.prototype, "label", undefined);
WaProgressRing = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-progress-ring")
], WaProgressRing);
WaProgressRing.disableWarning?.("change-in-update");
