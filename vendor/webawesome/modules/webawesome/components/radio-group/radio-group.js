import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { uniqueId } from "../../internal/math.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { RequiredValidator } from "../../internal/validators/required-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import"../radio/radio.js";
import styles from "./radio-group.styles.js";
export default class WaRadioGroup extends WebAwesomeFormAssociatedElement {
  static css = [sizeStyles, formControlStyles, styles];
  static get validators() {
    const validators = isServer ? [] : [
      RequiredValidator({
        validationElement: Object.assign(document.createElement("input"), {
          required: true,
          type: "radio",
          name: uniqueId("__wa-radio")
        })
      })
    ];
    return [...super.validators, ...validators];
  }
  get value() {
    if (this.valueHasChanged) {
      return this._value;
    }
    return this._value ?? this.defaultValue;
  }
  set value(val) {
    if (typeof val === "number")
      val = String(val);
    this.valueHasChanged = true;
    this._value = val;
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  static shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
  constructor() {
    super();
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.label = "";
    this.hint = "";
    this.name = null;
    this.disabled = false;
    this.orientation = "vertical";
    this._value = null;
    this.defaultValue = this.getAttribute("value") || null;
    this.required = false;
    this.withLabel = false;
    this.withHint = false;
    this.handleRadioClick = (e) => {
      const clickedRadio = e.target.closest("wa-radio");
      if (!clickedRadio || clickedRadio.disabled || clickedRadio.forceDisabled || this.disabled) {
        return;
      }
      const oldValue = this.value;
      this.value = clickedRadio.value;
      clickedRadio.checked = true;
      const radios = this.getAllRadios();
      for (const radio of radios) {
        if (clickedRadio === radio) {
          continue;
        }
        radio.checked = false;
        radio.setAttribute("tabindex", "-1");
      }
      if (this.value !== oldValue) {
        this.updateComplete.then(() => {
          this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
          this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        });
      }
    };
    if (!isServer) {
      this.addEventListener("keydown", this.handleKeyDown);
      this.addEventListener("click", this.handleRadioClick);
    }
  }
  get validationTarget() {
    if (isServer)
      return;
    const radio = this.querySelector(":is(wa-radio):not([disabled])");
    if (!radio)
      return;
    return radio;
  }
  updated(changedProperties) {
    if (changedProperties.has("disabled") || changedProperties.has("size") || changedProperties.has("value") || changedProperties.has("defaultValue")) {
      this.syncRadioElements();
    }
  }
  formResetCallback(...args) {
    this._value = null;
    super.formResetCallback(...args);
    this.syncRadioElements();
  }
  getAllRadios() {
    return [...this.querySelectorAll("wa-radio")];
  }
  handleLabelClick() {
    this.focus();
  }
  async syncRadioElements() {
    const radios = this.getAllRadios();
    radios.forEach((radio, index) => {
      if (this.size)
        radio.setAttribute("size", this.size);
      radio.toggleAttribute("data-wa-radio-horizontal", this.orientation !== "vertical");
      radio.toggleAttribute("data-wa-radio-vertical", this.orientation === "vertical");
      radio.toggleAttribute("data-wa-radio-first", index === 0);
      radio.toggleAttribute("data-wa-radio-inner", index !== 0 && index !== radios.length - 1);
      radio.toggleAttribute("data-wa-radio-last", index === radios.length - 1);
      radio.forceDisabled = this.disabled;
    });
    await Promise.all(radios.map(async (radio) => {
      await radio.updateComplete;
      if (radio.value === this.value) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    }));
    if (this.disabled) {
      radios.forEach((radio) => {
        radio.tabIndex = -1;
      });
    } else {
      const enabledRadios = radios.filter((radio) => !radio.disabled);
      const checkedRadio = enabledRadios.find((radio) => radio.checked);
      if (enabledRadios.length > 0) {
        if (checkedRadio) {
          enabledRadios.forEach((radio) => {
            radio.tabIndex = radio.checked ? 0 : -1;
          });
        } else {
          enabledRadios.forEach((radio, index) => {
            radio.tabIndex = index === 0 ? 0 : -1;
          });
        }
      }
      radios.filter((radio) => radio.disabled).forEach((radio) => {
        radio.tabIndex = -1;
      });
    }
  }
  handleKeyDown(event) {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key) || this.disabled) {
      return;
    }
    const radios = this.getAllRadios().filter((radio) => !radio.disabled);
    if (radios.length <= 0) {
      return;
    }
    event.preventDefault();
    const oldValue = this.value;
    const checkedRadio = radios.find((radio) => radio.checked) ?? radios[0];
    const incr = event.key === " " ? 0 : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1;
    let index = radios.indexOf(checkedRadio) + incr;
    if (!index)
      index = 0;
    if (index < 0) {
      index = radios.length - 1;
    }
    if (index > radios.length - 1) {
      index = 0;
    }
    const hasRadioButtons = radios.some((radio) => radio.tagName.toLowerCase() === "wa-radio-button");
    this.getAllRadios().forEach((radio) => {
      radio.checked = false;
      if (!hasRadioButtons) {
        radio.setAttribute("tabindex", "-1");
      }
    });
    this.value = radios[index].value;
    radios[index].checked = true;
    if (!hasRadioButtons) {
      radios[index].setAttribute("tabindex", "0");
      radios[index].focus();
    } else {
      radios[index].shadowRoot.querySelector("button").focus();
    }
    if (this.value !== oldValue) {
      this.updateComplete.then(() => {
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      });
    }
    event.preventDefault();
  }
  focus(options) {
    if (this.disabled)
      return;
    const radios = this.getAllRadios();
    const checked = radios.find((radio) => radio.checked && !radio.disabled);
    const firstEnabledRadio = radios.find((radio) => !radio.disabled);
    const radioToFocus = checked || firstEnabledRadio;
    if (radioToFocus) {
      radioToFocus.focus(options);
    }
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label", "withLabel");
    const hasHintSlot = this.hasSlotController.test("hint", "withHint");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
    return html`
      <fieldset
        part="form-control"
        class=${classMap({
      "form-control": true,
      "form-control-radio-group": true,
      "form-control-has-label": hasLabel
    })}
        role="radiogroup"
        aria-labelledby="label"
        aria-describedby="hint"
        aria-errormessage="error-message"
        aria-orientation=${this.orientation}
      >
        <label
          part="form-control-label"
          id="label"
          class=${classMap({
      label: true,
      "has-label": hasLabel
    })}
          aria-hidden=${hasLabel ? "false" : "true"}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <slot part="form-control-input" @slotchange=${this.syncRadioElements}></slot>

        <slot
          id="hint"
          name="hint"
          part="hint"
          class=${classMap({
      "has-slotted": hasHint
    })}
          aria-hidden=${hasHint ? "false" : "true"}
          >${this.hint}</slot
        >
      </fieldset>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaRadioGroup.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaRadioGroup.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaRadioGroup.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRadioGroup.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaRadioGroup.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRadioGroup.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaRadioGroup.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaRadioGroup.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRadioGroup.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaRadioGroup.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaRadioGroup.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "with-label" })
], WaRadioGroup.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "with-hint" })
], WaRadioGroup.prototype, "withHint", undefined);
WaRadioGroup = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-radio-group")
], WaRadioGroup);
WaRadioGroup.disableWarning?.("change-in-update");
