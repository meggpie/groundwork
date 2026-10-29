import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { WaRemoveEvent } from "../../events/remove.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import sizeStyles from "../../styles/component/size.styles.js";
import variantStyles from "../../styles/component/variants.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../button/button.js";
import styles from "./tag.styles.js";
export default class WaTag extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.variant = "neutral";
    this.appearance = "filled-outlined";
    this.size = "m";
    this.pill = false;
    this.withRemove = false;
  }
  static css = [styles, variantStyles, sizeStyles];
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  handleRemoveClick() {
    this.dispatchEvent(new WaRemoveEvent);
  }
  render() {
    return html`
      <slot part="content" class="content"></slot>

      ${this.withRemove ? html`
            <wa-button
              part="remove-button"
              exportparts="base:remove-button__base"
              class="remove"
              appearance="plain"
              size=${this.size}
              @click=${this.handleRemoveClick}
              tabindex="-1"
            >
              <wa-icon name="xmark" library="system" variant="solid" label=${this.localize.term("remove")}></wa-icon>
            </wa-button>
          ` : ""}
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTag.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTag.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTag.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaTag.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTag.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-remove", type: Boolean })
], WaTag.prototype, "withRemove", undefined);
WaTag = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-tag")
], WaTag);
