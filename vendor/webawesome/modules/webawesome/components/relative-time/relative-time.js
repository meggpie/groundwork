import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, state } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
const availableUnits = [
  { max: 2760000, value: 60000, unit: "minute" },
  { max: 72000000, value: 3600000, unit: "hour" },
  { max: 518400000, value: 86400000, unit: "day" },
  { max: 2419200000, value: 604800000, unit: "week" },
  { max: 28512000000, value: 2592000000, unit: "month" },
  { max: 1 / 0, value: 31536000000, unit: "year" }
];
export default class WaRelativeTime extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.isoTime = "";
    this.relativeTime = "";
    this.date = new Date;
    this.format = "long";
    this.numeric = "auto";
    this.sync = false;
    this.referenceDate = null;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.updateTimeout);
  }
  willUpdate(changedProperties) {
    const now = this.referenceDate || new Date;
    const then = new Date(this.date);
    if (isNaN(then.getMilliseconds())) {
      this.relativeTime = "";
      this.isoTime = "";
      return super.willUpdate(changedProperties);
    }
    const diff = then.getTime() - now.getTime();
    const { unit, value } = availableUnits.find((singleUnit) => Math.abs(diff) < singleUnit.max);
    this.isoTime = then.toISOString();
    this.relativeTime = this.localize.relativeTime(Math.round(diff / value), unit, {
      numeric: this.numeric,
      style: this.format
    });
    clearTimeout(this.updateTimeout);
    if (this.sync) {
      let nextInterval;
      if (unit === "minute") {
        nextInterval = getTimeUntilNextUnit("second");
      } else if (unit === "hour") {
        nextInterval = getTimeUntilNextUnit("minute");
      } else if (unit === "day") {
        nextInterval = getTimeUntilNextUnit("hour");
      } else {
        nextInterval = getTimeUntilNextUnit("day");
      }
      this.updateTimeout = setTimeout(() => this.requestUpdate(), nextInterval);
    }
  }
  render() {
    if (this.relativeTime === "" && this.isoTime === "") {
      return "";
    }
    return html`<time datetime=${this.isoTime}>${this.relativeTime}</time>`;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaRelativeTime.prototype, "isoTime", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaRelativeTime.prototype, "relativeTime", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaRelativeTime.prototype, "date", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaRelativeTime.prototype, "format", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaRelativeTime.prototype, "numeric", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaRelativeTime.prototype, "sync", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaRelativeTime.prototype, "referenceDate", undefined);
WaRelativeTime = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-relative-time")
], WaRelativeTime);
function getTimeUntilNextUnit(unit) {
  const units = { second: 1000, minute: 60000, hour: 3600000, day: 86400000 };
  const value = units[unit];
  return value - Date.now() % value;
}
