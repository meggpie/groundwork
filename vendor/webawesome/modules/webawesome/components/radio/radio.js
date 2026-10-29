import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, state } from "../../../lit/lit/decorators.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import"../icon/icon.js";
import styles from "./radio.styles.js";
export default class WaRadio extends WebAwesomeFormAssociatedElement {
  static css = [formControlStyles, sizeStyles, styles];
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  constructor() {
    super();
    this.checked = false;
    this.forceDisabled = false;
    this.appearance = "default";
    this.disabled = false;
    this.handleClick = () => {
      if (!this.disabled && !this.forceDisabled) {
        this.checked = true;
      }
    };
    if (!isServer) {
      this.addEventListener("click", this.handleClick);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.setInitialAttributes();
  }
  setInitialAttributes() {
    this.setAttribute("role", "radio");
    this.tabIndex = 0;
    this.setAttribute("aria-disabled", this.disabled || this.forceDisabled ? "true" : "false");
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("checked")) {
      this.customStates.set("checked", this.checked);
      this.setAttribute("aria-checked", this.checked ? "true" : "false");
      if (!this.disabled && !this.forceDisabled) {
        this.tabIndex = this.checked ? 0 : -1;
      }
    }
    if (changedProperties.has("disabled") || changedProperties.has("forceDisabled")) {
      const effectivelyDisabled = this.disabled || this.forceDisabled;
      this.customStates.set("disabled", effectivelyDisabled);
      this.setAttribute("aria-disabled", effectivelyDisabled ? "true" : "false");
      if (effectivelyDisabled) {
        this.tabIndex = -1;
      } else {
        this.tabIndex = this.checked ? 0 : -1;
      }
    }
  }
  setValue() {}
  render() {
    return html`
      <span part="control" class="control">
        ${this.checked ? html`
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" part="checked-icon" class="checked-icon">
                <circle cx="8" cy="8" r="8" />
              </svg>
            ` : ""}
      </span>

      <slot part="label" class="label"></slot>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaRadio.prototype, "checked", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaRadio.prototype, "forceDisabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRadio.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRadio.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRadio.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaRadio.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaRadio.prototype, "disabled", undefined);
WaRadio = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-radio")
], WaRadio);
WaRadio.disableWarning?.("change-in-update");
