import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import sizeStyles from "../../styles/component/size.styles.js";
import variantStyles from "../../styles/component/variants.styles.js";
import styles from "./callout.styles.js";
export default class WaCallout extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.variant = "brand";
    this.size = "m";
  }
  static css = [styles, variantStyles, sizeStyles];
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  render() {
    return html`
      <div part="icon">
        <slot name="icon"></slot>
      </div>

      <div part="message">
        <slot></slot>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCallout.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCallout.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCallout.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaCallout.prototype, "handleSizeChange", null);
WaCallout = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-callout")
], WaCallout);
