import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { live } from "../../../lit/lit/directives/live.js";
import { WaClearEvent } from "../../events/clear.js";
import { WaCreateEvent } from "../../events/create.js";
import { announce } from "../../internal/live-announcer.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { submitOnEnter } from "../../internal/submit-on-enter.js";
import { TagInputValidator } from "../../internal/validators/tag-input-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import visuallyHidden from "../../styles/component/visually-hidden.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import"../tag/tag.js";
import styles from "./tag-input.styles.js";
export default class WaTagInput extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["blur", "input"];
    this.hasSlotController = new HasSlotController(this, "hint", "label");
    this.localize = new LocalizeController(this);
    this.focusedTagIndex = -1;
    this._value = null;
    this.defaultValue = this.getAttribute("value") ?? null;
    this.inputValue = "";
    this.delimiter = ",";
    this.allowDuplicates = false;
    this.withClear = false;
    this.placeholder = "";
    this.label = "";
    this.hint = "";
    this.withLabel = false;
    this.withHint = false;
    this.size = "m";
    this.appearance = "outlined";
    this.pill = false;
    this.readonly = false;
    this.required = false;
    this.spellcheck = true;
  }
  static css = [sizeStyles, formControlStyles, visuallyHidden, styles];
  static get validators() {
    return isServer ? [] : [...super.validators, TagInputValidator()];
  }
  get value() {
    return [...this._value ?? this.parseDelimited(this.defaultValue)];
  }
  set value(val) {
    if (val instanceof FormData) {
      val = this.name ? val.getAll(this.name) : [];
    }
    if (typeof val === "string") {
      val = this.parseDelimited(val);
    }
    const next = val ? [...val] : [];
    const old = this._value;
    if (old && old.length === next.length && old.every((tag, index) => tag === next[index])) {
      return;
    }
    this._value = next;
    this.valueHasChanged = true;
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  get delimiterRegex() {
    if (!this.delimiter) {
      return null;
    }
    return new RegExp(`[${this.delimiter.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}]`);
  }
  get isAtMax() {
    return this.maxTags != null && this.value.length >= this.maxTags;
  }
  parseDelimited(str) {
    if (!str) {
      return [];
    }
    const chars = this.delimiter || ",";
    const regex = new RegExp(`[${chars.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}]`);
    return str.split(regex).map((tag) => tag.trim()).filter(Boolean);
  }
  get tagElements() {
    return [...this.shadowRoot?.querySelectorAll('[part~="tag"]') ?? []];
  }
  getTagIndex(target) {
    const tag = target?.closest?.('[part~="tag"]');
    return tag ? Number(tag.dataset.index) : -1;
  }
  setInputText(text) {
    this.inputValue = text;
    if (this.input) {
      this.input.value = text;
    }
  }
  emitInputAndChange() {
    this.updateComplete.then(() => {
      this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  tryAddTag(text) {
    if (this.disabled || this.readonly) {
      return false;
    }
    const tag = text.trim();
    if (!tag || this.isAtMax) {
      return false;
    }
    const tags = this.value;
    if (!this.allowDuplicates && tags.includes(tag)) {
      this.shakeTag(tags.indexOf(tag));
      announce(this.localize.term("tagAlreadyAdded", tag));
      return false;
    }
    const createEvent = new WaCreateEvent({ inputValue: tag });
    this.dispatchEvent(createEvent);
    if (createEvent.defaultPrevented) {
      return false;
    }
    this.value = [...tags, tag];
    announce(this.localize.term("tagAdded", tag));
    return true;
  }
  addTags(texts) {
    const rejected = [];
    let added = false;
    for (const text of texts) {
      if (this.tryAddTag(text)) {
        added = true;
      } else if (text.trim()) {
        rejected.push(text.trim());
      }
    }
    if (added) {
      this.hasInteracted = true;
      this.emitInputAndChange();
    }
    return rejected;
  }
  removeTagAt(index) {
    const tags = this.value;
    if (this.disabled || this.readonly || index < 0 || index >= tags.length) {
      return false;
    }
    const [removed] = tags.splice(index, 1);
    this.hasInteracted = true;
    this.value = tags;
    announce(this.localize.term("tagRemoved", removed));
    this.emitInputAndChange();
    return true;
  }
  shakeTag(index) {
    const tag = this.tagElements[index];
    if (!tag || typeof tag.animate !== "function") {
      return;
    }
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    tag.animate([
      { translate: "0" },
      { translate: "-0.2em" },
      { translate: "0.2em" },
      { translate: "-0.2em" },
      { translate: "0.2em" },
      { translate: "0" }
    ], { duration: 300, easing: "ease-in-out" });
  }
  async focusTag(index) {
    this.focusedTagIndex = index;
    await this.updateComplete;
    this.tagElements[index]?.focus();
  }
  handleInput(event) {
    const text = this.input.value;
    const regex = this.delimiterRegex;
    if (regex && !event.isComposing && regex.test(text)) {
      const segments = text.split(regex);
      const remainder = segments.pop() ?? "";
      const rejected = this.addTags(segments);
      this.setInputText([...rejected, remainder].filter(Boolean).join(this.delimiter[0]));
      return;
    }
    this.inputValue = text;
  }
  handlePaste(event) {
    const regex = this.delimiterRegex;
    if (this.disabled || this.readonly || !regex) {
      return;
    }
    const pasted = event.clipboardData?.getData("text/plain") ?? "";
    if (!regex.test(pasted)) {
      return;
    }
    event.preventDefault();
    const start = this.input.selectionStart ?? this.input.value.length;
    const end = this.input.selectionEnd ?? start;
    const combined = this.input.value.slice(0, start) + pasted + this.input.value.slice(end);
    const rejected = this.addTags(combined.split(regex));
    this.setInputText(rejected.join(this.delimiter[0]));
  }
  handleKeyDown(event) {
    if (event.isComposing) {
      return;
    }
    const text = this.input.value;
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isRtl = this.localize.dir() === "rtl";
    const previousKey = isRtl ? "ArrowRight" : "ArrowLeft";
    if (event.key === "Enter" && !hasModifier) {
      if (text) {
        event.preventDefault();
        if (this.addTags([text]).length === 0) {
          this.setInputText("");
        }
      } else {
        submitOnEnter(event, this);
      }
      return;
    }
    if (this.disabled || this.readonly) {
      if (event.key === "Backspace") {
        event.preventDefault();
      }
      return;
    }
    if (event.key === "Backspace" && text === "" && this.value.length > 0) {
      event.preventDefault();
      this.removeTagAt(this.value.length - 1);
      return;
    }
    if (event.key === previousKey && !hasModifier && text === "" && this.input.selectionStart === 0 && this.value.length > 0) {
      event.preventDefault();
      this.focusTag(this.value.length - 1);
      return;
    }
    if (event.key === "Escape" && text) {
      event.preventDefault();
      this.setInputText("");
      this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    }
  }
  handleInputFocus() {
    this.focusedTagIndex = -1;
  }
  handleInputBlur() {
    if (this.input.value && !this.readonly && !this.disabled) {
      this.addTags([this.input.value]);
      this.setInputText("");
    }
  }
  handleTagKeyDown(event) {
    const index = this.getTagIndex(event.target);
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
    }
    if (this.disabled || this.readonly || index < 0) {
      return;
    }
    const count = this.value.length;
    const hasModifier = event.metaKey || event.ctrlKey || event.altKey;
    const isRtl = this.localize.dir() === "rtl";
    const previousKey = isRtl ? "ArrowRight" : "ArrowLeft";
    const nextKey = isRtl ? "ArrowLeft" : "ArrowRight";
    switch (event.key) {
      case previousKey:
        event.preventDefault();
        this.focusTag(Math.max(0, index - 1));
        break;
      case nextKey:
        event.preventDefault();
        if (index < count - 1) {
          this.focusTag(index + 1);
        } else {
          this.input.focus();
        }
        break;
      case "Home":
        event.preventDefault();
        this.focusTag(0);
        break;
      case "End":
        event.preventDefault();
        this.input.focus();
        break;
      case "Backspace":
        event.preventDefault();
        this.removeTagAt(index);
        if (index > 0) {
          this.focusTag(index - 1);
        } else {
          this.input.focus();
        }
        break;
      case "Delete":
        event.preventDefault();
        this.removeTagAt(index);
        if (index < count - 1) {
          this.focusTag(index);
        } else if (index > 0) {
          this.focusTag(index - 1);
        } else {
          this.input.focus();
        }
        break;
      case "Escape":
        this.input.focus();
        break;
      default:
        if (event.key.length === 1 && !hasModifier) {
          this.input.focus();
        }
    }
  }
  handleTagClick(event) {
    const index = this.getTagIndex(event.target);
    if (this.disabled || index < 0) {
      return;
    }
    const isButton = event.composedPath().some((el) => el instanceof Element && el.localName === "wa-button");
    if (!isButton) {
      this.focusTag(index);
    }
  }
  handleTagFocusIn(event) {
    this.focusedTagIndex = this.getTagIndex(event.target);
  }
  handleTagFocusOut() {
    this.focusedTagIndex = -1;
  }
  handleTagRemove(event) {
    event.stopPropagation();
    if (this.removeTagAt(this.getTagIndex(event.target))) {
      this.input.focus();
    }
  }
  handleWrapperMouseDown(event) {
    const target = event.target;
    if (target === this.input || target.closest?.('[slot="start"], [slot="end"]')) {
      return;
    }
    event.preventDefault();
  }
  handleWrapperClick(event) {
    const target = event.target;
    if (this.disabled || target === this.input) {
      return;
    }
    if (target.closest?.('[slot="start"], [slot="end"], [part~="tag"], [part~="clear-button"]')) {
      return;
    }
    this.input.focus();
  }
  handleClearMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  handleClearClick(event) {
    event.stopPropagation();
    if (this.value.length > 0) {
      this.hasInteracted = true;
      this.value = [];
      this.setInputText("");
      announce(this.localize.term("allTagsRemoved"));
      this.updateComplete.then(() => {
        this.dispatchEvent(new WaClearEvent);
        this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      });
    }
    this.input.focus();
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    this.customStates.set("blank", this.value.length === 0);
    this.customStates.set("readonly", this.readonly);
    if (changedProperties.has("value") || changedProperties.has("defaultValue") || changedProperties.has("required") || changedProperties.has("minTags") || changedProperties.has("maxTags")) {
      this.updateValidity();
    }
  }
  formResetCallback() {
    this._value = null;
    this.setInputText("");
    super.formResetCallback();
    this.requestUpdate("value");
  }
  focus(options) {
    this.input.focus(options);
  }
  blur() {
    this.input.blur();
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label", "withLabel");
    const hasHintSlot = this.hasSlotController.test("hint", "withHint");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
    const tags = this.value;
    const atMax = this.isAtMax;
    const isClearVisible = (!this.didSSR || this.hasUpdated) && this.withClear && !this.disabled && !this.readonly && tags.length > 0;
    return html`
      <label
        id="label"
        part="form-control-label"
        class=${classMap({
      label: true,
      "has-label": hasLabel
    })}
        for="input"
        aria-hidden=${hasLabel ? "false" : "true"}
      >
        <slot name="label">${this.label}</slot>
      </label>

      <div
        part="tag-input"
        class=${classMap({
      "tag-input": true,
      "has-tags": tags.length > 0
    })}
        @mousedown=${this.handleWrapperMouseDown}
        @click=${this.handleWrapperClick}
      >
        <slot name="start" part="start" class="start"></slot>

        ${tags.length > 0 ? html`
              ${this.readonly ? "" : html`
                    <span id="tag-help" class="wa-visually-hidden-force">
                      ${this.localize.term("tagInputKeyboardHelp")}
                    </span>
                  `}
              <div
                part="tags"
                class="tags"
                role="list"
                aria-labelledby="label"
                @keydown=${this.handleTagKeyDown}
                @click=${this.handleTagClick}
                @focusin=${this.handleTagFocusIn}
                @focusout=${this.handleTagFocusOut}
                @wa-remove=${this.handleTagRemove}
              >
                ${tags.map((tag, index) => html`
                    <wa-tag
                      part="tag"
                      class=${classMap({
      tag: true,
      "tag--focused": this.focusedTagIndex === index
    })}
                      exportparts="
                        content:tag__content,
                        remove-button:tag__remove-button,
                        remove-button__base:tag__remove-button__base
                      "
                      role="listitem"
                      tabindex="-1"
                      aria-describedby=${ifDefined(this.readonly ? undefined : "tag-help")}
                      size=${this.size}
                      ?pill=${this.pill}
                      ?with-remove=${!this.readonly}
                      data-index=${index}
                      >${tag}</wa-tag
                    >
                  `)}
              </div>
            ` : ""}

        <input
          part="input"
          id="input"
          class="control"
          type="text"
          .value=${live(this.inputValue)}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly || atMax}
          placeholder=${ifDefined(atMax ? undefined : this.placeholder || undefined)}
          autocapitalize=${ifDefined(this.autocapitalize)}
          autocomplete=${this.autocomplete ?? "off"}
          autocorrect=${this.autocorrect ? "on" : "off"}
          spellcheck=${this.spellcheck}
          enterkeyhint=${ifDefined(this.enterkeyhint)}
          inputmode=${ifDefined(this.inputmode)}
          aria-describedby="hint"
          aria-invalid=${this.validity.valid ? "false" : "true"}
          @input=${this.handleInput}
          @paste=${this.handlePaste}
          @keydown=${this.handleKeyDown}
          @focus=${this.handleInputFocus}
          @blur=${this.handleInputBlur}
        />

        ${isClearVisible ? html`
              <button
                part="clear-button"
                class="clear"
                type="button"
                tabindex="-1"
                aria-label=${this.localize.term("clearEntry")}
                @mousedown=${this.handleClearMouseDown}
                @click=${this.handleClearClick}
              >
                <slot name="clear-icon">
                  <wa-icon name="circle-xmark" library="system" variant="regular"></wa-icon>
                </slot>
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
  query(".control")
], WaTagInput.prototype, "input", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTagInput.prototype, "focusedTagIndex", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: false })
], WaTagInput.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaTagInput.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: false })
], WaTagInput.prototype, "inputValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTagInput.prototype, "delimiter", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "max-tags", type: Number })
], WaTagInput.prototype, "maxTags", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "min-tags", type: Number })
], WaTagInput.prototype, "minTags", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "allow-duplicates", type: Boolean, reflect: true })
], WaTagInput.prototype, "allowDuplicates", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-clear", type: Boolean })
], WaTagInput.prototype, "withClear", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTagInput.prototype, "placeholder", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTagInput.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaTagInput.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-label", type: Boolean })
], WaTagInput.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-hint", type: Boolean })
], WaTagInput.prototype, "withHint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTagInput.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaTagInput.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTagInput.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTagInput.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTagInput.prototype, "readonly", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTagInput.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTagInput.prototype, "autocapitalize", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => !value || value === "off" ? false : true,
      toAttribute: (value) => value ? "on" : "off"
    }
  })
], WaTagInput.prototype, "autocorrect", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTagInput.prototype, "autocomplete", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTagInput.prototype, "enterkeyhint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => !value || value === "false" ? false : true,
      toAttribute: (value) => value ? "true" : "false"
    }
  })
], WaTagInput.prototype, "spellcheck", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTagInput.prototype, "inputmode", undefined);
WaTagInput = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-tag-input")
], WaTagInput);
WaTagInput.disableWarning?.("change-in-update");
