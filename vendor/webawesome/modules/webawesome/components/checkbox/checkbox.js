import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { live } from "../../../lit/lit/directives/live.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { RequiredValidator } from "../../internal/validators/required-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import"../icon/icon.js";
import styles from "./checkbox.styles.js";
export default class WaCheckbox extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "hint");
    this.title = "";
    this._value = this.getAttribute("value") ?? null;
    this.size = "m";
    this.disabled = false;
    this.indeterminate = false;
    this._checked = null;
    this.defaultChecked = this.hasAttribute("checked");
    this.required = false;
    this.hint = "";
  }
  static css = [formControlStyles, sizeStyles, styles];
  static shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
  static get validators() {
    const validators = isServer ? [] : [
      RequiredValidator({
        validationProperty: "checked",
        validationElement: Object.assign(document.createElement("input"), {
          type: "checkbox",
          required: true
        })
      })
    ];
    return [...super.validators, ...validators];
  }
  get value() {
    return this._value ?? "on";
  }
  set value(val) {
    this._value = val;
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  get checked() {
    if (this.valueHasChanged) {
      return Boolean(this._checked);
    }
    return this._checked ?? this.defaultChecked;
  }
  set checked(val) {
    this._checked = Boolean(val);
    this.valueHasChanged = true;
  }
  handleClick() {
    this.hasInteracted = true;
    this.checked = !this.checked;
    this.indeterminate = false;
    this.updateComplete.then(() => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => {
        this.handleDefaultCheckedChange();
      });
      return;
    }
    this.handleDefaultCheckedChange();
  }
  handleDefaultCheckedChange() {
    this.handleValueOrCheckedChange();
  }
  handleValueOrCheckedChange() {
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => {
        this.handleValueOrCheckedChange();
      });
      return;
    }
    this.setValue(this.checked ? this.value : null, this._value);
    this.updateValidity();
  }
  handleStateChange() {
    if (this.hasUpdated) {
      this.input.checked = this.checked;
      this.input.indeterminate = this.indeterminate;
    }
    this.customStates.set("checked", this.checked);
    this.customStates.set("indeterminate", this.indeterminate);
    this.updateValidity();
  }
  handleDisabledChange() {
    this.customStates.set("disabled", this.disabled);
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("value") || changedProperties.has("checked") || changedProperties.has("defaultChecked") || changedProperties.has("disabled")) {
      this.handleValueOrCheckedChange();
    }
  }
  formResetCallback() {
    this._checked = null;
    super.formResetCallback();
    this.handleValueOrCheckedChange();
  }
  click() {
    this.input.click();
  }
  focus(options) {
    this.input.focus(options);
  }
  blur() {
    this.input.blur();
  }
  render() {
    const hasHintSlot = isServer ? true : this.hasSlotController.test("hint");
    const hasHint = this.hint ? true : !!hasHintSlot;
    const isIndeterminate = !this.checked && this.indeterminate;
    const iconName = isIndeterminate ? "indeterminate" : "check";
    const iconState = isIndeterminate ? "indeterminate" : "checked";
    const checkedAttribute = this.didSSR && !this.hasUpdated ? this.checked : this.defaultChecked;
    const checkedProperty = this.didSSR && !this.hasUpdated ? null : live(this.checked);
    return html`
      <label part="base checkbox">
        <span part="control">
          <input
            class="input"
            type="checkbox"
            title=${this.title}
            name=${ifDefined(this.name)}
            value=${ifDefined(this.value)}
            .indeterminate=${live(this.indeterminate)}
            .checked=${ifDefined(checkedProperty)}
            ?checked=${checkedAttribute}
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-checked=${this.indeterminate ? "mixed" : this.checked ? "true" : "false"}
            aria-describedby="hint"
            @click=${this.handleClick}
          />

          <wa-icon part="${iconState}-icon icon" library="system" name=${iconName}></wa-icon>
        </span>

        <slot part="label"></slot>
      </label>

      <slot
        id="hint"
        part="hint"
        name="hint"
        aria-hidden=${hasHint ? "false" : "true"}
        class="${classMap({ "has-slotted": hasHint })}"
      >
        ${this.hint}
      </slot>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query('input[type="checkbox"]')
], WaCheckbox.prototype, "input", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaCheckbox.prototype, "title", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCheckbox.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCheckbox.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaCheckbox.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaCheckbox.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCheckbox.prototype, "indeterminate", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: false })
], WaCheckbox.prototype, "checked", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true, attribute: "checked" })
], WaCheckbox.prototype, "defaultChecked", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCheckbox.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaCheckbox.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch(["checked", "defaultChecked"])
], WaCheckbox.prototype, "handleDefaultCheckedChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch(["checked", "indeterminate"])
], WaCheckbox.prototype, "handleStateChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled")
], WaCheckbox.prototype, "handleDisabledChange", null);
WaCheckbox = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-checkbox")
], WaCheckbox);
WaCheckbox.disableWarning?.("change-in-update");
