import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
export default class WaFormatDate extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.date = new Date;
    this.hourFormat = "auto";
  }
  static get styles() {
    return [];
  }
  render() {
    const date = new Date(this.date);
    const hour12 = this.hourFormat === "auto" ? undefined : this.hourFormat === "12";
    if (isNaN(date.getMilliseconds())) {
      return;
    }
    const displayDate = this.localize.date(date, {
      weekday: this.weekday,
      era: this.era,
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
      minute: this.minute,
      second: this.second,
      timeZoneName: this.timeZoneName,
      timeZone: this.timeZone,
      hour12
    });
    return html`<time datetime=${date.toISOString()}>${displayDate}</time>`;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "date", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "weekday", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "era", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "year", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "month", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "day", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "hour", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "minute", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaFormatDate.prototype, "second", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "time-zone-name" })
], WaFormatDate.prototype, "timeZoneName", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "time-zone" })
], WaFormatDate.prototype, "timeZone", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hour-format" })
], WaFormatDate.prototype, "hourFormat", undefined);
WaFormatDate = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-format-date")
], WaFormatDate);
