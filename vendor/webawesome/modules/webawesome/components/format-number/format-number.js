import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
export default class WaFormatNumber extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.value = 0;
    this.type = "decimal";
    this.withoutGrouping = false;
    this.currency = "USD";
    this.currencyDisplay = "symbol";
  }
  static get styles() {
    return [];
  }
  render() {
    if (isNaN(this.value)) {
      return "";
    }
    return this.localize.number(this.value, {
      style: this.type,
      currency: this.currency,
      currencyDisplay: this.currencyDisplay,
      useGrouping: !this.withoutGrouping,
      minimumIntegerDigits: this.minimumIntegerDigits,
      minimumFractionDigits: this.minimumFractionDigits,
      maximumFractionDigits: this.maximumFractionDigits,
      minimumSignificantDigits: this.minimumSignificantDigits,
      maximumSignificantDigits: this.maximumSignificantDigits
    });
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaFormatNumber.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatNumber.prototype, "type", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-grouping", type: Boolean })
], WaFormatNumber.prototype, "withoutGrouping", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatNumber.prototype, "currency", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "currency-display" })
], WaFormatNumber.prototype, "currencyDisplay", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "minimum-integer-digits", type: Number })
], WaFormatNumber.prototype, "minimumIntegerDigits", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "minimum-fraction-digits", type: Number })
], WaFormatNumber.prototype, "minimumFractionDigits", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "maximum-fraction-digits", type: Number })
], WaFormatNumber.prototype, "maximumFractionDigits", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "minimum-significant-digits", type: Number })
], WaFormatNumber.prototype, "minimumSignificantDigits", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "maximum-significant-digits", type: Number })
], WaFormatNumber.prototype, "maximumSignificantDigits", undefined);
WaFormatNumber = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-format-number")
], WaFormatNumber);
