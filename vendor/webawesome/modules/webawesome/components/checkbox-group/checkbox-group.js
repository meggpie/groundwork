import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import"../checkbox/checkbox.js";
import styles from "./checkbox-group.styles.js";
export default class WaCheckboxGroup extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.label = "";
    this.hint = "";
    this.orientation = "vertical";
    this.required = false;
    this.withLabel = false;
    this.withHint = false;
    this.syncCheckboxElements = () => {
      if (!this.size)
        return;
      for (const checkbox of this.getAllCheckboxes()) {
        checkbox.setAttribute("size", this.size);
      }
    };
  }
  static css = [sizeStyles, formControlStyles, styles];
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  updated(changedProperties) {
    if (changedProperties.has("size")) {
      this.syncCheckboxElements();
    }
  }
  getAllCheckboxes() {
    return [...this.querySelectorAll(":is(wa-checkbox, wa-switch)")];
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
      "checkbox-group-required": this.required,
      "form-control-has-label": hasLabel
    })}
      >
        <label
          part="form-control-label"
          id="label"
          class=${classMap({
      label: true,
      "has-label": hasLabel
    })}
          aria-hidden=${hasLabel ? "false" : "true"}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" role="group" aria-labelledby="label" aria-describedby="hint">
          <slot @slotchange=${this.syncCheckboxElements}></slot>
        </div>

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
  property()
], WaCheckboxGroup.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaCheckboxGroup.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCheckboxGroup.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCheckboxGroup.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaCheckboxGroup.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCheckboxGroup.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "with-label" })
], WaCheckboxGroup.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "with-hint" })
], WaCheckboxGroup.prototype, "withHint", undefined);
WaCheckboxGroup = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-checkbox-group")
], WaCheckboxGroup);
WaCheckboxGroup.disableWarning?.("change-in-update");
