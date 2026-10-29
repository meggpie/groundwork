import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
export default class WaFormatBytes extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.value = 0;
    this.unit = "byte";
    this.display = "short";
  }
  static get styles() {
    return [];
  }
  render() {
    if (isNaN(this.value)) {
      return "";
    }
    const bitPrefixes = ["", "kilo", "mega", "giga", "tera"];
    const bytePrefixes = ["", "kilo", "mega", "giga", "tera", "peta"];
    const prefix = this.unit === "bit" ? bitPrefixes : bytePrefixes;
    const index = Math.max(0, Math.min(Math.floor(Math.log10(this.value) / 3), prefix.length - 1));
    const unit = prefix[index] + this.unit;
    const valueToFormat = parseFloat((this.value / Math.pow(1000, index)).toPrecision(3));
    return this.localize.number(valueToFormat, {
      style: "unit",
      unit,
      unitDisplay: this.display
    });
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaFormatBytes.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatBytes.prototype, "unit", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatBytes.prototype, "display", undefined);
WaFormatBytes = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-format-bytes")
], WaFormatBytes);
