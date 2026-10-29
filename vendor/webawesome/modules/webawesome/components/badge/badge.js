import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import variantStyles from "../../styles/component/variants.styles.js";
import styles from "./badge.styles.js";
export default class WaBadge extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.variant = "brand";
    this.appearance = "accent";
    this.pill = false;
    this.attention = "none";
  }
  static css = [variantStyles, styles];
  render() {
    return html`
      <span part="start">
        <slot name="start"></slot>
      </span>

      <span part="base badge" role="status">
        <slot></slot>
      </span>

      <span part="end">
        <slot name="end"></slot>
      </span>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaBadge.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaBadge.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaBadge.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaBadge.prototype, "attention", undefined);
WaBadge = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-badge")
], WaBadge);
