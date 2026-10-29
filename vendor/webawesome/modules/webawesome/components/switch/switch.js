import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { live } from "../../../lit/lit/directives/live.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { MirrorValidator } from "../../internal/validators/mirror-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import styles from "./switch.styles.js";
export default class WaSwitch extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "hint");
    this.localize = new LocalizeController(this);
    this.title = "";
    this.name = null;
    this._value = this.getAttribute("value") ?? null;
    this.size = "m";
    this.disabled = false;
    this._checked = null;
    this.defaultChecked = this.hasAttribute("checked");
    this.required = false;
    this.hint = "";
    this.withHint = false;
  }
  static shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
  static css = [formControlStyles, sizeStyles, styles];
  static get validators() {
    return isServer ? [] : [...super.validators, MirrorValidator()];
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
    this.updateComplete.then(() => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  handleKeyDown(event) {
    const isRtl = this.localize.dir() === "rtl";
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (this.checked === isRtl)
        return;
      this.checked = isRtl;
      this.updateComplete.then(() => {
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      });
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (this.checked === !isRtl)
        return;
      this.checked = !isRtl;
      this.updateComplete.then(() => {
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      });
    }
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has("value") || changedProperties.has("checked") || changedProperties.has("defaultChecked") || changedProperties.has("disabled")) {
      this.handleValueOrCheckedChange();
    }
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
    }
    this.customStates.set("checked", this.checked);
    this.updateValidity();
  }
  handleDisabledChange() {
    this.updateValidity();
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
  setValue(value, stateValue) {
    if (!this.checked) {
      this.internals.setFormValue(null, null);
      return;
    }
    this.internals.setFormValue(value ?? "on", stateValue);
  }
  formResetCallback() {
    this._checked = null;
    super.formResetCallback();
    this.handleValueOrCheckedChange();
  }
  render() {
    const hasHintSlot = this.hasSlotController.test("hint", "withHint");
    const hasHint = this.hint ? true : !!hasHintSlot;
    const checkedAttribute = this.didSSR && !this.hasUpdated ? this.checked : this.defaultChecked;
    const checkedProperty = this.didSSR && !this.hasUpdated ? null : live(this.checked);
    return html`
      <label
        part="base switch"
        class=${classMap({
      checked: this.checked,
      disabled: this.disabled
    })}
      >
        <input
          class="input"
          type="checkbox"
          title=${this.title}
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          .checked=${ifDefined(checkedProperty)}
          ?checked=${checkedAttribute}
          ?disabled=${this.disabled}
          ?required=${this.required}
          role="switch"
          aria-checked=${this.checked ? "true" : "false"}
          aria-describedby="hint"
          @click=${this.handleClick}
          @keydown=${this.handleKeyDown}
        />

        <span part="control" class="switch">
          <span part="thumb" class="thumb"></span>
        </span>

        <slot part="label" class="label"></slot>
      </label>

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
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query('input[type="checkbox"]')
], WaSwitch.prototype, "input", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaSwitch.prototype, "title", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaSwitch.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaSwitch.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaSwitch.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaSwitch.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaSwitch.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: false })
], WaSwitch.prototype, "checked", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "checked", reflect: true })
], WaSwitch.prototype, "defaultChecked", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaSwitch.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaSwitch.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-hint", type: Boolean })
], WaSwitch.prototype, "withHint", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch(["checked", "defaultChecked"])
], WaSwitch.prototype, "handleStateChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaSwitch.prototype, "handleDisabledChange", null);
WaSwitch = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-switch")
], WaSwitch);
WaSwitch.disableWarning?.("change-in-update");
