import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { live } from "../../../lit/lit/directives/live.js";
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
import styles from "./number-input.styles.js";
export default class WaNumberInput extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["blur", "input"];
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.localize = new LocalizeController(this);
    this.title = "";
    this._value = null;
    this.defaultValue = this.getAttribute("value") || null;
    this.size = "m";
    this.appearance = "outlined";
    this.pill = false;
    this.label = "";
    this.hint = "";
    this.placeholder = "";
    this.readonly = false;
    this.required = false;
    this.step = 1;
    this.withoutSteppers = false;
    this.inputmode = "numeric";
    this.withLabel = false;
    this.withHint = false;
  }
  static css = [sizeStyles, formControlStyles, styles];
  static shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
  static get validators() {
    return [...super.validators, MirrorValidator()];
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
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  updateFormValue(value) {
    if (value == null) {
      this.setValue("", null);
      return;
    }
    super.updateFormValue(value);
  }
  get isAtMin() {
    if (this.min === undefined)
      return false;
    const numValue = parseFloat(this.value || "");
    return !isNaN(numValue) && numValue <= this.min;
  }
  get isAtMax() {
    if (this.max === undefined)
      return false;
    const numValue = parseFloat(this.value || "");
    return !isNaN(numValue) && numValue >= this.max;
  }
  handleChange(event) {
    this.value = this.input.value;
    this.relayNativeEvent(event, { bubbles: true, composed: true });
  }
  handleInput() {
    this.value = this.input.value;
  }
  handleKeyDown(event) {
    submitOnEnter(event, this);
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      requestAnimationFrame(() => {
        if (this.value !== this.input.value) {
          this.value = this.input.value;
        }
      });
    }
  }
  handleStepperPointerUp(direction, event) {
    if (this.disabled || this.readonly)
      return;
    const beforeInputEvent = new InputEvent("beforeinput", { bubbles: true, cancelable: true, composed: true });
    this.dispatchEvent(beforeInputEvent);
    if (beforeInputEvent.defaultPrevented)
      return;
    if (direction === "up") {
      this.input.stepUp();
    } else {
      this.input.stepDown();
    }
    if (this.value !== this.input.value) {
      this.value = this.input.value;
    }
    this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    if (event.pointerType !== "touch") {
      this.input.focus();
    }
  }
  handleStepperPointerDown(event) {
    if (event.pointerType === "touch")
      return;
    event.preventDefault();
    this.input.focus();
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("value") || changedProperties.has("defaultValue")) {
      if (this.input && this.value && this.input.value !== this.value) {
        this._value = this.input.value;
      }
      this.customStates.set("blank", !this.value);
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
    this.value = this.defaultValue;
    super.formResetCallback();
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label", "withLabel");
    const hasHintSlot = this.hasSlotController.test("hint", "withHint");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
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

      <div part="base number-input" class="number-field">
        ${!this.withoutSteppers ? html`
              <button
                part="stepper stepper-decrement"
                class="stepper stepper-decrement"
                type="button"
                tabindex="-1"
                aria-label=${this.localize.term("decrement")}
                ?disabled=${this.disabled || this.readonly || this.isAtMin}
                @pointerdown=${this.handleStepperPointerDown}
                @pointerup=${(event) => this.handleStepperPointerUp("down", event)}
              >
                <slot name="decrement-icon">
                  <wa-icon name="minus" library="system"></wa-icon>
                </slot>
              </button>
            ` : ""}

        <slot name="start" part="start" class="start"></slot>

        <input
          part="input"
          id="input"
          class="control"
          type="number"
          inputmode=${ifDefined(this.inputmode)}
          title=${this.title}
          name=${ifDefined(this.name)}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          placeholder=${ifDefined(this.placeholder)}
          min=${ifDefined(this.min)}
          max=${ifDefined(this.max)}
          step=${ifDefined(this.step)}
          .value=${live(this.value ?? "")}
          autocomplete=${ifDefined(this.autocomplete)}
          ?autofocus=${this.autofocus}
          enterkeyhint=${ifDefined(this.enterkeyhint)}
          aria-describedby="hint"
          @change=${this.handleChange}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />

        <slot name="end" part="end" class="end"></slot>

        ${!this.withoutSteppers ? html`
              <button
                part="stepper stepper-increment"
                class="stepper stepper-increment"
                type="button"
                tabindex="-1"
                aria-label=${this.localize.term("increment")}
                ?disabled=${this.disabled || this.readonly || this.isAtMax}
                @pointerdown=${this.handleStepperPointerDown}
                @pointerup=${(event) => this.handleStepperPointerUp("up", event)}
              >
                <slot name="increment-icon">
                  <wa-icon name="plus" library="system"></wa-icon>
                </slot>
              </button>
            ` : ""}
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
], WaNumberInput.prototype, "input", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaNumberInput.prototype, "title", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaNumberInput.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaNumberInput.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaNumberInput.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaNumberInput.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaNumberInput.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaNumberInput.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaNumberInput.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaNumberInput.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaNumberInput.prototype, "placeholder", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaNumberInput.prototype, "readonly", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaNumberInput.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaNumberInput.prototype, "min", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaNumberInput.prototype, "max", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaNumberInput.prototype, "step", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-steppers", type: Boolean })
], WaNumberInput.prototype, "withoutSteppers", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaNumberInput.prototype, "autocomplete", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaNumberInput.prototype, "autofocus", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaNumberInput.prototype, "enterkeyhint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaNumberInput.prototype, "inputmode", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-label", type: Boolean })
], WaNumberInput.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-hint", type: Boolean })
], WaNumberInput.prototype, "withHint", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("step", { waitUntilFirstUpdate: true })
], WaNumberInput.prototype, "handleStepChange", null);
WaNumberInput = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-number-input")
], WaNumberInput);
WaNumberInput.disableWarning?.("change-in-update");
