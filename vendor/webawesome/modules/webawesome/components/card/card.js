import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { HasSlotController } from "../../internal/slot.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import sizeStyles from "../../styles/component/size.styles.js";
import styles from "./card.styles.js";
export default class WaCard extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "footer", "header", "media", "header-actions", "footer-actions", "actions");
    this.appearance = "outlined";
    this.withHeader = false;
    this.withMedia = false;
    this.withFooter = false;
    this.withHeaderActions = false;
    this.withFooterActions = false;
    this.orientation = "vertical";
  }
  static css = [sizeStyles, styles];
  willUpdate(changedProperties) {
    this.withHeader = this.hasSlotController.test("header", "withHeader");
    this.withMedia = this.hasSlotController.test("media", "withMedia");
    this.withFooter = this.hasSlotController.test("footer", "withFooter");
    super.willUpdate(changedProperties);
  }
  render() {
    if (this.orientation === "horizontal") {
      return html`
        <slot name="media" part="media" class="media"></slot>
        <div part="body" class="body"><slot></slot></div>
        <slot name="actions" part="actions" class="actions"></slot>
      `;
    }
    const hasHeaderActions = this.hasSlotController.test("header-actions", "withHeaderActions");
    const hasFooterActions = this.hasSlotController.test("footer-actions", "withFooterActions");
    return html`
      <slot name="media" part="media" class="media"></slot>

      <div
        part="header"
        class=${classMap({
      header: true,
      "has-actions": hasHeaderActions
    })}
      >
        <slot name="header"></slot>
        <slot name="header-actions"></slot>
      </div>

      <div part="body" class="body"><slot></slot></div>

      <div
        part="footer"
        class=${classMap({
      footer: true,
      "has-actions": hasFooterActions
    })}
      >
        <slot name="footer"></slot>
        <slot name="footer-actions"></slot>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCard.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-header", type: Boolean, reflect: true })
], WaCard.prototype, "withHeader", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-media", type: Boolean, reflect: true })
], WaCard.prototype, "withMedia", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-footer", type: Boolean, reflect: true })
], WaCard.prototype, "withFooter", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-header-actions", type: Boolean, reflect: true })
], WaCard.prototype, "withHeaderActions", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-footer-actions", type: Boolean, reflect: true })
], WaCard.prototype, "withFooterActions", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCard.prototype, "orientation", undefined);
WaCard = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-card")
], WaCard);
WaCard.disableWarning?.("change-in-update");
