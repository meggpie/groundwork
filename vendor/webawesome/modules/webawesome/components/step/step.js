import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, nothing } from "../../../lit/lit/index.js";
import { customElement, property, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { HasSlotController } from "../../internal/slot.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import variantStyles from "../../styles/component/variants.styles.js";
import visuallyHidden from "../../styles/component/visually-hidden.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import"../spinner/spinner.js";
import styles from "./step.styles.js";
export default class WaStep extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.hasSlotController = new HasSlotController(this, "description");
    this.name = "";
    this.completed = false;
    this.loading = false;
    this.disabled = false;
    this.variant = "brand";
    this.attention = "none";
    this.withDescription = false;
    this.position = 0;
    this.active = false;
    this.clickable = false;
    this.locked = false;
    this.role = "listitem";
  }
  static css = [variantStyles, visuallyHidden, styles];
  handleCompletedChange() {
    this.customStates.set("completed", this.completed);
  }
  handleLoadingChange() {
    this.customStates.set("loading", this.loading);
    this.setAttribute("aria-busy", this.loading ? "true" : "false");
  }
  handleDisabledChange() {
    this.customStates.set("disabled", this.disabled);
  }
  handleActiveChange() {
    this.customStates.set("active", this.active);
    this.syncAriaCurrent();
  }
  handleLockedChange() {
    this.customStates.set("locked", this.locked);
  }
  syncAriaCurrent() {
    if (this.active && !this.clickable) {
      this.setAttribute("aria-current", "step");
    } else {
      this.removeAttribute("aria-current");
    }
  }
  getStatusText() {
    if (this.completed)
      return this.localize.term("completed");
    if (this.disabled)
      return this.localize.term("disabled");
    if (this.locked)
      return this.localize.term("locked");
    if (this.active)
      return "";
    return this.localize.term("notCompleted");
  }
  handleClickableChange() {
    this.customStates.set("clickable", this.clickable);
    this.syncAriaCurrent();
  }
  renderIcon() {
    if (this.loading) {
      return html`<wa-spinner part="spinner"></wa-spinner>`;
    }
    if (this.completed) {
      return html`<wa-icon name="check" library="system" variant="solid"></wa-icon>`;
    }
    return this.position > 0 ? this.localize.number(this.position) : nothing;
  }
  render() {
    const hasDescription = this.hasSlotController.test("description", "withDescription");
    const body = html`
      <span part="marker" class="marker">
        <slot name="icon">${this.renderIcon()}</slot>
      </span>
      <span part="content" class="content">
        <span part="label" class="label">
          <slot></slot>
        </span>
        <span part="status" class="wa-visually-hidden">${this.getStatusText()}</span>
        <span part="description" class="description" ?hidden=${!hasDescription}>
          <slot name="description"></slot>
        </span>
      </span>
    `;
    return html`
      <div part="step" class="step">
        <span
          part="connector"
          class=${classMap({
      "connector-start": true,
      [`wa-${this.connectorStartVariant}`]: !!this.connectorStartVariant
    })}
          ?data-completed=${!!this.connectorStartVariant}
        ></span>
        <span part="connector" class="connector-end"></span>
        ${this.clickable ? html`
              <button
                part="button"
                class="body"
                type="button"
                ?disabled=${this.disabled || this.locked}
                aria-current=${this.active ? "step" : nothing}
              >
                ${body}
              </button>
            ` : html`<div class="body">${body}</div>`}
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaStep.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaStep.prototype, "completed", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaStep.prototype, "loading", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaStep.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaStep.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaStep.prototype, "attention", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "with-description" })
], WaStep.prototype, "withDescription", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaStep.prototype, "position", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaStep.prototype, "active", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaStep.prototype, "clickable", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaStep.prototype, "locked", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaStep.prototype, "connectorStartVariant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaStep.prototype, "role", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("completed")
], WaStep.prototype, "handleCompletedChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("loading")
], WaStep.prototype, "handleLoadingChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled")
], WaStep.prototype, "handleDisabledChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("active")
], WaStep.prototype, "handleActiveChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("locked")
], WaStep.prototype, "handleLockedChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("clickable")
], WaStep.prototype, "handleClickableChange", null);
WaStep = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-step")
], WaStep);
WaStep.disableWarning?.("change-in-update");
