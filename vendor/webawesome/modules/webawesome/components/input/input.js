import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { live } from "../../../lit/lit/directives/live.js";
import { WaClearEvent } from "../../events/clear.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { submitOnEnter } from "../../internal/submit-on-enter.js";
import { MirrorValidator } from "../../internal/validators/mirror-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import styles from "./input.styles.js";
export default class WaInput extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["blur", "input"];
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.localize = new LocalizeController(this);
    this.title = "";
    this.type = "text";
    this._value = null;
    this.defaultValue = this.getAttribute("value") || null;
    this.size = "m";
    this.appearance = "outlined";
    this.pill = false;
    this.label = "";
    this.hint = "";
    this.withClear = false;
    this.placeholder = "";
    this.readonly = false;
    this.passwordToggle = false;
    this.passwordVisible = false;
    this.withoutSpinButtons = false;
    this.required = false;
    this.spellcheck = true;
    this.withLabel = false;
    this.withHint = false;
  }
  static css = [sizeStyles, formControlStyles, styles];
  static shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
  static get validators() {
    return isServer ? [] : [...super.validators, MirrorValidator()];
  }
  get value() {
    if (this.valueHasChanged) {
      return this._value;
    }
    return this._value ?? this.defaultValue;
  }
  set value(val) {
    if (this._value === val) {
      return;
    }
    this.valueHasChanged = true;
    this._value = val;
  }
  updateFormValue(value) {
    if (value == null) {
      this.setValue("", null);
      return;
    }
    super.updateFormValue(value);
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  handleChange(event) {
    this.value = this.input.value;
    this.relayNativeEvent(event, { bubbles: true, composed: true });
  }
  handleClearClick(event) {
    event.preventDefault();
    if (this.value !== "") {
      this.value = "";
      this.updateComplete.then(() => {
        this.dispatchEvent(new WaClearEvent);
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      });
    }
    this.input.focus();
  }
  handleInput() {
    this.value = this.input.value;
  }
  handleKeyDown(event) {
    submitOnEnter(event, this);
  }
  handlePasswordToggle() {
    this.passwordVisible = !this.passwordVisible;
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("value") || changedProperties.has("defaultValue") || changedProperties.has("type")) {
      const sanitizingTypes = ["number", "date", "time", "datetime-local"];
      if (this.input && sanitizingTypes.includes(this.type) && this.value && this.input.value !== this.value) {
        this._value = this.input.value;
      }
      this.customStates.set("blank", !this.value);
      this.updateValidity();
    }
  }
  handleStepChange() {
    this.input.step = String(this.step);
    this.updateValidity();
  }
  focus(options) {
    this.input.focus(options);
  }
  blur() {
    this.input.blur();
  }
  select() {
    this.input.select();
  }
  setSelectionRange(selectionStart, selectionEnd, selectionDirection = "none") {
    this.input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }
  setRangeText(replacement, start, end, selectMode = "preserve") {
    const selectionStart = start ?? this.input.selectionStart;
    const selectionEnd = end ?? this.input.selectionEnd;
    this.input.setRangeText(replacement, selectionStart, selectionEnd, selectMode);
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }
  showPicker() {
    if ("showPicker" in HTMLInputElement.prototype) {
      this.input.showPicker();
    }
  }
  stepUp() {
    this.input.stepUp();
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }
  stepDown() {
    this.input.stepDown();
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }
  formResetCallback() {
    this.value = null;
    if (this.input) {
      this.input.value = this.value;
    }
    super.formResetCallback();
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label", "withLabel");
    const hasHintSlot = this.hasSlotController.test("hint", "withHint");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
    const hasClearIcon = this.withClear && !this.disabled && !this.readonly;
    const isClearIconVisible = (!this.didSSR || this.hasUpdated) && hasClearIcon && (typeof this.value === "number" || this.value && this.value.length > 0);
    return html`
      <label
        part="form-control-label label"
        class=${classMap({
      label: true,
      "has-label": hasLabel
    })}
        for="input"
        aria-hidden=${hasLabel ? "false" : "true"}
      >
        <slot name="label">${this.label}</slot>
      </label>

      <div part="base input-wrapper" class="text-field">
        <slot name="start" part="start" class="start"></slot>

        <input
          part="input"
          id="input"
          class="control"
          type=${this.type === "password" && this.passwordVisible ? "text" : this.type}
          title=${this.title}
          name=${ifDefined(this.name)}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          placeholder=${ifDefined(this.placeholder)}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          min=${ifDefined(this.min)}
          max=${ifDefined(this.max)}
          step=${ifDefined(this.step)}
          .value=${live(this.value ?? "")}
          autocapitalize=${ifDefined(this.autocapitalize)}
          autocomplete=${ifDefined(this.autocomplete)}
          autocorrect=${this.autocorrect ? "on" : "off"}
          ?autofocus=${this.autofocus}
          spellcheck=${this.spellcheck}
          pattern=${ifDefined(this.pattern)}
          enterkeyhint=${ifDefined(this.enterkeyhint)}
          inputmode=${ifDefined(this.inputmode)}
          aria-describedby="hint"
          @change=${this.handleChange}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />

        ${isClearIconVisible ? html`
              <button
                part="clear-button"
                class="clear"
                type="button"
                aria-label=${this.localize.term("clearEntry")}
                @click=${this.handleClearClick}
                tabindex="-1"
              >
                <slot name="clear-icon">
                  <wa-icon name="circle-xmark" library="system" variant="regular"></wa-icon>
                </slot>
              </button>
            ` : ""}
        ${this.passwordToggle && !this.disabled ? html`
              <button
                part="password-toggle-button"
                class="password-toggle"
                type="button"
                aria-label=${this.localize.term(this.passwordVisible ? "hidePassword" : "showPassword")}
                @click=${this.handlePasswordToggle}
              >
                ${!this.passwordVisible ? html`
                      <slot name="show-password-icon">
                        <wa-icon name="eye" library="system" variant="regular"></wa-icon>
                      </slot>
                    ` : html`
                      <slot name="hide-password-icon">
                        <wa-icon name="eye-slash" library="system" variant="regular"></wa-icon>
                      </slot>
                    `}
              </button>
            ` : ""}

        <slot name="end" part="end" class="end"></slot>
      </div>

      <slot
        id="hint"
        part="hint"
        name="hint"
        class=${classMap({
      "has-slotted": hasHint
    })}
        aria-hidden=${hasHint ? "false" : "true"}
        >${this.hint}</slot
      >
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("input")
], WaInput.prototype, "input", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "title", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaInput.prototype, "type", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaInput.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaInput.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaInput.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaInput.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaInput.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaInput.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaInput.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-clear", type: Boolean })
], WaInput.prototype, "withClear", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "placeholder", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaInput.prototype, "readonly", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "password-toggle", type: Boolean })
], WaInput.prototype, "passwordToggle", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "password-visible", type: Boolean })
], WaInput.prototype, "passwordVisible", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-spin-buttons", type: Boolean, reflect: true })
], WaInput.prototype, "withoutSpinButtons", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaInput.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "pattern", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaInput.prototype, "minlength", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaInput.prototype, "maxlength", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "min", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "max", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "step", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "autocapitalize", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => !value || value === "off" ? false : true,
      toAttribute: (value) => value ? "on" : "off"
    }
  })
], WaInput.prototype, "autocorrect", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "autocomplete", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaInput.prototype, "autofocus", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "enterkeyhint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => !value || value === "false" ? false : true,
      toAttribute: (value) => value ? "true" : "false"
    }
  })
], WaInput.prototype, "spellcheck", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInput.prototype, "inputmode", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-label", type: Boolean })
], WaInput.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-hint", type: Boolean })
], WaInput.prototype, "withHint", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("step", { waitUntilFirstUpdate: true })
], WaInput.prototype, "handleStepChange", null);
WaInput = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-input")
], WaInput);
WaInput.disableWarning?.("change-in-update");
