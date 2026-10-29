import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
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
import visuallyHidden from "../../styles/component/visually-hidden.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import styles from "./textarea.styles.js";
export default class WaTextarea extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["blur", "input"];
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.localize = new LocalizeController(this);
    this.announcedCountText = "";
    this.title = "";
    this.name = null;
    this._value = null;
    this.defaultValue = this.getAttribute("value") ?? "";
    this.size = "m";
    this.appearance = "outlined";
    this.label = "";
    this.hint = "";
    this.placeholder = "";
    this.rows = 4;
    this.resize = "vertical";
    this.disabled = false;
    this.readonly = false;
    this.required = false;
    this.spellcheck = true;
    this.withLabel = false;
    this.withHint = false;
    this.withCount = false;
    this.lastObservedWidth = 0;
  }
  static css = [styles, formControlStyles, sizeStyles, visuallyHidden];
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
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.setTextareaDimensions();
      this.updateResizeObserver();
      if (this.didSSR && this.input && this.value !== this.input.value) {
        const value = this.input.value;
        this.value = value;
      }
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.countAnnounceTimeout);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
  updateFormValue(value) {
    if (value == null) {
      this.setValue("", null);
      return;
    }
    super.updateFormValue(value);
  }
  updateResizeObserver() {
    const needsObserver = this.resize !== "none";
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    if (needsObserver && this.input) {
      if (this.resize === "auto") {
        this.resizeObserver = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect.width ?? 0;
          if (width !== this.lastObservedWidth) {
            this.lastObservedWidth = width;
            requestAnimationFrame(() => this.setTextareaDimensions());
          }
        });
        this.resizeObserver.observe(this);
      } else {
        this.resizeObserver = new ResizeObserver(() => this.setTextareaDimensions());
        this.resizeObserver.observe(this.input);
      }
    }
  }
  handleBlur() {
    this.checkValidity();
  }
  handleChange(event) {
    this.valueHasChanged = true;
    this.value = this.input.value;
    this.setTextareaDimensions();
    this.checkValidity();
    this.relayNativeEvent(event, { bubbles: true, composed: true });
  }
  handleInput(event) {
    this.valueHasChanged = true;
    this.value = this.input.value;
    this.relayNativeEvent(event, { bubbles: true, composed: true });
    this.scheduleCountAnnouncement();
  }
  scheduleCountAnnouncement() {
    clearTimeout(this.countAnnounceTimeout);
    this.countAnnounceTimeout = setTimeout(() => {
      const currentLength = (this.value ?? "").length;
      this.announcedCountText = this.maxlength != null ? this.localize.term("numCharactersRemaining", this.maxlength - currentLength) : this.localize.term("numCharacters", currentLength);
    }, 1000);
  }
  setTextareaDimensions() {
    if (this.resize === "none") {
      this.base.style.width = ``;
      this.base.style.height = ``;
      return;
    }
    if (this.resize === "auto") {
      this.sizeAdjuster.style.height = `${this.input.clientHeight}px`;
      this.input.style.height = "auto";
      const newHeight = this.input.scrollHeight;
      this.input.style.height = `${newHeight}px`;
      this.sizeAdjuster.style.height = `${newHeight}px`;
      this.base.style.width = ``;
      this.base.style.height = ``;
      return;
    }
    if (this.input.style.width) {
      const width = Number(this.input.style.width.split(/px/)[0]) + 2;
      this.base.style.width = `${width}px`;
    }
    if (this.input.style.height) {
      const height = Number(this.input.style.height.split(/px/)[0]) + 2;
      this.base.style.height = `${height}px`;
    }
  }
  handleRowsChange() {
    this.setTextareaDimensions();
  }
  async handleValueChange() {
    await this.updateComplete;
    this.checkValidity();
    this.setTextareaDimensions();
  }
  updated(changedProperties) {
    if (changedProperties.has("resize")) {
      this.setTextareaDimensions();
      this.updateResizeObserver();
    }
    super.updated(changedProperties);
    if (changedProperties.has("value")) {
      this.customStates.set("blank", !this.value);
    }
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
  scrollPosition(position) {
    if (position) {
      if (typeof position.top === "number")
        this.input.scrollTop = position.top;
      if (typeof position.left === "number")
        this.input.scrollLeft = position.left;
      return;
    }
    return {
      top: this.input.scrollTop,
      left: this.input.scrollLeft
    };
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
      this.setTextareaDimensions();
    }
  }
  formResetCallback() {
    this._value = null;
    if (this.input) {
      this.input.value = this.value || "";
    }
    super.formResetCallback();
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label", "withLabel");
    const hasHintSlot = this.hasSlotController.test("hint", "withHint");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
    const currentLength = (this.value ?? "").length;
    const countText = this.maxlength != null ? this.localize.term("numCharactersRemaining", this.maxlength - currentLength) : this.localize.term("numCharacters", currentLength);
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

      <div part="base textarea-wrapper" class="textarea">
        <textarea
          part="textarea"
          id="input"
          class="control"
          title=${this.title}
          name=${ifDefined(this.name)}
          .value=${live(this.value)}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          placeholder=${ifDefined(this.placeholder)}
          rows=${ifDefined(this.rows)}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          autocapitalize=${ifDefined(this.autocapitalize)}
          autocorrect=${ifDefined(this.autocorrect)}
          ?autofocus=${this.autofocus}
          spellcheck=${ifDefined(this.spellcheck)}
          enterkeyhint=${ifDefined(this.enterkeyhint)}
          inputmode=${ifDefined(this.inputmode)}
          aria-describedby="hint"
          @change=${this.handleChange}
          @input=${this.handleInput}
          @blur=${this.handleBlur}
        ></textarea>

        <!-- This "adjuster" exists to prevent layout shifting. https://github.com/shoelace-style/shoelace/issues/2180 -->
        <div part="textarea-adjuster" class="size-adjuster" ?hidden=${this.resize !== "auto"}></div>
      </div>

      <div
        part="hint"
        class=${classMap({
      footer: true,
      "has-count": this.withCount,
      "has-slotted": hasHint
    })}
      >
        <slot id="hint" name="hint" class="hint" aria-hidden=${hasHint ? "false" : "true"}>${this.hint}</slot>

        ${this.withCount ? html`
              <div part="count" class="count" aria-hidden="true">${countText}</div>
              <div class="wa-visually-hidden-force" aria-live="polite">${this.announcedCountText}</div>
            ` : ""}
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTextarea.prototype, "announcedCountText", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".control")
], WaTextarea.prototype, "input", undefined);
__legacyDecorateClassTS_3r173x8m([
  query('[part~="base"]')
], WaTextarea.prototype, "base", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".size-adjuster")
], WaTextarea.prototype, "sizeAdjuster", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTextarea.prototype, "title", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTextarea.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTextarea.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaTextarea.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTextarea.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaTextarea.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTextarea.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTextarea.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaTextarea.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTextarea.prototype, "placeholder", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaTextarea.prototype, "rows", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTextarea.prototype, "resize", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaTextarea.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTextarea.prototype, "readonly", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTextarea.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaTextarea.prototype, "minlength", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaTextarea.prototype, "maxlength", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTextarea.prototype, "autocapitalize", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => !value || value === "off" ? false : true,
      toAttribute: (value) => value ? "on" : "off"
    }
  })
], WaTextarea.prototype, "autocorrect", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTextarea.prototype, "autocomplete", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaTextarea.prototype, "autofocus", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTextarea.prototype, "enterkeyhint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => !value || value === "false" ? false : true,
      toAttribute: (value) => value ? "true" : "false"
    }
  })
], WaTextarea.prototype, "spellcheck", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTextarea.prototype, "inputmode", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-label", type: Boolean })
], WaTextarea.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-hint", type: Boolean })
], WaTextarea.prototype, "withHint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-count", type: Boolean, reflect: true })
], WaTextarea.prototype, "withCount", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("rows", { waitUntilFirstUpdate: true })
], WaTextarea.prototype, "handleRowsChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("value", { waitUntilFirstUpdate: true })
], WaTextarea.prototype, "handleValueChange", null);
WaTextarea = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-textarea")
], WaTextarea);
WaTextarea.disableWarning?.("change-in-update");
