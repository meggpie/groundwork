import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { live } from "../../../lit/lit/directives/live.js";
import { uniqueId } from "../../internal/math.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { MirrorValidator } from "../../internal/validators/mirror-validator.js";
import { RequiredValidator } from "../../internal/validators/required-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import { localeFieldOrder } from "./internal/field-order.js";
import { PartialDateValidator } from "./internal/partial-date-validator.js";
import { EMPTY_PARTS, isoToParts, partsToIso } from "./internal/parts.js";
import styles from "./known-date.styles.js";
const generateId = () => uniqueId("wa-known-date-");
export default class WaKnownDate extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["input"];
    this.localize = new LocalizeController(this);
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.groupId = generateId();
    this.hintId = `${this.groupId}-hint`;
    this.lastEmittedValue = "";
    this.pendingValue = null;
    this.parts = { ...EMPTY_PARTS };
    this.name = "";
    this._value = "";
    this.defaultValue = this.getAttribute("value") ?? "";
    this.disabled = false;
    this.required = false;
    this.readonly = false;
    this.size = "m";
    this.appearance = "outlined";
    this.pill = false;
    this.label = "";
    this.hint = "";
    this.autocomplete = "";
    this.min = "";
    this.max = "";
    this.locale = "";
    this.withLabel = false;
    this.withHint = false;
    this.handleFieldInput = (event) => {
      if (this.readonly)
        return;
      const target = event.currentTarget;
      const field = target.dataset.field;
      const max = field === "year" ? 4 : 2;
      const sanitized = target.value.replace(/\D/g, "").slice(0, max);
      if (sanitized !== target.value)
        target.value = sanitized;
      this.parts = { ...this.parts, [field]: sanitized };
      this.recomputeValue();
      this.requestUpdate();
    };
  }
  static css = [sizeStyles, formControlStyles, styles];
  static shadowRootOptions = {
    ...WebAwesomeFormAssociatedElement.shadowRootOptions,
    delegatesFocus: true
  };
  static get validators() {
    const validators = isServer ? [] : [
      PartialDateValidator(),
      RequiredValidator({
        validationElement: Object.assign(document.createElement("input"), { required: true })
      }),
      MirrorValidator()
    ];
    return [...super.validators, ...validators];
  }
  get value() {
    if (this.valueHasChanged)
      return this._value;
    return this._value || this.defaultValue || "";
  }
  set value(val) {
    const normalized = this.normalizeIncomingValue(val);
    if (normalized === this._value)
      return;
    const oldValue = this._value;
    this._value = normalized;
    this.valueHasChanged = true;
    if (this.hasUpdated) {
      this.syncPartsFromCanonical();
    } else {
      this.pendingValue = this._value;
    }
    this.requestUpdate("value", oldValue);
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.pendingValue != null) {
      this._value = this.pendingValue;
      this.pendingValue = null;
    } else if (!this._value && this.defaultValue) {
      this._value = this.defaultValue;
    }
    this.syncPartsFromCanonical();
    this.input = this.valueInput;
    this.updateValidity();
    this.lastEmittedValue = this._value;
  }
  updated(changed) {
    super.updated?.(changed);
    if (changed.has("value")) {
      this.customStates.set("blank", !this._value);
    }
  }
  focus(options) {
    const target = this.firstFocusableInput();
    target?.focus(options);
  }
  blur() {
    const active = this.shadowRoot?.activeElement;
    active?.blur();
  }
  get valueAsDate() {
    if (!this._value)
      return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(this._value);
    if (!match)
      return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  get validationTarget() {
    if (!this.shadowRoot)
      return;
    const inputs = Array.from(this.shadowRoot.querySelectorAll('input[part~="field-input"]'));
    if (inputs.length === 0)
      return;
    const offending = this.firstInvalidField();
    if (offending) {
      const el = inputs.find((i) => i.dataset.field === offending);
      if (el)
        return el;
    }
    return inputs[0];
  }
  formResetCallback() {
    this._value = this.defaultValue;
    this.valueHasChanged = false;
    this.syncPartsFromCanonical();
    super.formResetCallback();
    this.lastEmittedValue = this._value;
    this.requestUpdate();
  }
  formStateRestoreCallback(state) {
    if (typeof state === "string") {
      this.value = state;
    }
    this.updateValidity();
  }
  get resolvedLocale() {
    return this.locale || this.localize.lang() || "en";
  }
  fieldOrder() {
    return localeFieldOrder(this.resolvedLocale);
  }
  normalizeIncomingValue(val) {
    if (val == null)
      return "";
    if (val instanceof Date) {
      const y = String(val.getFullYear()).padStart(4, "0");
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const d = String(val.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    if (typeof val === "string") {
      const parts = isoToParts(val);
      return partsToIso(parts);
    }
    return "";
  }
  syncPartsFromCanonical() {
    this.parts = isoToParts(this._value);
    this.updateHiddenInput();
  }
  updateHiddenInput() {
    if (this.valueInput) {
      this.valueInput.value = this._value;
    }
    this.setValue(this._value || null);
  }
  recomputeValue() {
    const oldValue = this._value;
    const newValue = partsToIso(this.parts);
    if (newValue !== oldValue) {
      this._value = newValue;
      this.valueHasChanged = true;
      this.updateHiddenInput();
      this.updateValidity();
    }
    this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    if (newValue !== this.lastEmittedValue) {
      this.lastEmittedValue = newValue;
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
  }
  firstFocusableInput() {
    if (!this.shadowRoot)
      return;
    const inputs = Array.from(this.shadowRoot.querySelectorAll('input[part~="field-input"]'));
    for (const field of this.fieldOrder()) {
      if (this.parts[field] === "") {
        const el = inputs.find((i) => i.dataset.field === field);
        if (el)
          return el;
      }
    }
    return inputs[0];
  }
  firstInvalidField() {
    if (this._value)
      return null;
    const order = this.fieldOrder();
    const empty = order.find((field) => this.parts[field] === "");
    if (empty)
      return empty;
    const inRange = {
      year: (n) => Number.isInteger(n) && n >= 1 && n <= 9999,
      month: (n) => Number.isInteger(n) && n >= 1 && n <= 12,
      day: (n) => Number.isInteger(n) && n >= 1 && n <= 31
    };
    const outOfRange = order.find((field) => !inRange[field](Number(this.parts[field])));
    if (outOfRange)
      return outOfRange;
    return "day";
  }
  autocompleteFor(field) {
    const family = this.autocomplete.trim();
    if (!family)
      return;
    if (family === "bday") {
      if (field === "day")
        return "bday-day";
      if (field === "month")
        return "bday-month";
      return "bday-year";
    }
    if (family === "off" || family === "on")
      return family;
    return field === "year" ? family : undefined;
  }
  render() {
    const hasLabelSlot = this.hasUpdated ? this.hasSlotController.test("label") : this.withLabel;
    const hasHintSlot = this.hasUpdated ? this.hasSlotController.test("hint") : this.withHint;
    const hasLabel = !!this.label || !!hasLabelSlot;
    const hasHint = !!this.hint || !!hasHintSlot;
    const groupAriaLabel = this.label || this.localize.term("date") || "Date";
    const userInvalid = !isServer && this.customStates.has("user-invalid");
    const describedBy = hasHint ? this.hintId : "";
    const fields = this.fieldOrder().map((field) => this.renderField(field, describedBy, userInvalid));
    const groupContent = html`
      <div part="base known-date form-control-input fields" class="fields">${fields}</div>

      <slot
        name="hint"
        part="hint"
        id=${this.hintId}
        class=${classMap({ hint: true, "has-slotted": hasHint })}
        aria-hidden=${hasHint ? "false" : "true"}
      >
        ${this.hint}
      </slot>
    `;
    return html`
      <div
        part="form-control"
        class=${classMap({
      "form-control": true,
      "form-control-has-label": hasLabel
    })}
      >
        ${hasLabel ? html`<fieldset part="fieldset" class="fieldset">
              <legend part="legend">
                <span part="form-control-label label" class="label">
                  <slot name="label">${this.label}</slot>
                </span>
              </legend>
              ${groupContent}
            </fieldset>` : html`<div part="fieldset" class="fieldset" role="group" aria-label=${groupAriaLabel}>${groupContent}</div>`}

        <input
          class="value-input"
          type="date"
          tabindex="-1"
          aria-hidden="true"
          .value=${this._value}
          min=${ifDefined(this.min || undefined)}
          max=${ifDefined(this.max || undefined)}
          ?disabled=${this.disabled}
          ?required=${this.required}
        />
      </div>
    `;
  }
  renderField(field, describedBy, userInvalid) {
    const fieldId = `${this.groupId}-${field}`;
    const value = this.parts[field];
    const autocompleteAttr = this.autocompleteFor(field);
    const ariaInvalid = userInvalid ? "true" : undefined;
    const fieldLabel = this.localize.term(field) || (field === "day" ? "Day" : field === "month" ? "Month" : "Year");
    return html`
      <div part="field field-${field}" class=${classMap({ field: true, [`field-${field}`]: true })}>
        <input
          id=${fieldId}
          part="field-input"
          class="field-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength=${field === "year" ? 4 : 2}
          data-field=${field}
          autocomplete=${ifDefined(autocompleteAttr)}
          aria-describedby=${ifDefined(describedBy || undefined)}
          aria-invalid=${ifDefined(ariaInvalid)}
          aria-required=${this.required ? "true" : "false"}
          .value=${live(value)}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @input=${this.handleFieldInput}
        />
        <label part="field-label" class="field-label" for=${fieldId}>${fieldLabel}</label>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".value-input")
], WaKnownDate.prototype, "valueInput", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaKnownDate.prototype, "parts", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaKnownDate.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaKnownDate.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaKnownDate.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaKnownDate.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaKnownDate.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaKnownDate.prototype, "readonly", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaKnownDate.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaKnownDate.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaKnownDate.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaKnownDate.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaKnownDate.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaKnownDate.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaKnownDate.prototype, "autocomplete", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaKnownDate.prototype, "min", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaKnownDate.prototype, "max", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaKnownDate.prototype, "locale", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-label", type: Boolean })
], WaKnownDate.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-hint", type: Boolean })
], WaKnownDate.prototype, "withHint", undefined);
WaKnownDate = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-known-date")
], WaKnownDate);
