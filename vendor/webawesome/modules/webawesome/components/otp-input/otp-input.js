import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { live } from "../../../lit/lit/directives/live.js";
import { WaClearEvent } from "../../events/clear.js";
import { WaCompleteEvent } from "../../events/complete.js";
import { scrollIntoView } from "../../internal/scroll.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { submitForm, submitOnEnter } from "../../internal/submit-on-enter.js";
import { MirrorValidator } from "../../internal/validators/mirror-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import styles from "./otp-input.styles.js";
export default class WaOtpInput extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "label", "hint");
    this._focused = false;
    this._activeIndex = -1;
    this._selectionAnchor = -1;
    this._pendingClickIndex = null;
    this._value = "";
    this.defaultValue = this.getAttribute("value") ?? null;
    this.length = 6;
    this.appearance = "outlined";
    this.type = "numeric";
    this.mask = false;
    this.case = "preserve";
    this.size = "m";
    this.label = "";
    this.hint = "";
    this.format = "";
    this.autocomplete = "one-time-code";
    this.required = false;
    this.readonly = false;
    this.autosubmit = false;
    this.autofocus = false;
    this.withMask = false;
    this.assumeInteractionOn = ["blur", "input"];
    this._lastChangeValue = "";
  }
  static shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
  static css = [sizeStyles, formControlStyles, styles];
  static get validators() {
    return isServer ? [] : [...super.validators, MirrorValidator()];
  }
  get validationTarget() {
    return this.segmentsContainer;
  }
  get hasSelection() {
    return this._selectionAnchor >= 0 && this._selectionAnchor !== this._activeIndex;
  }
  setCaretIndex(index) {
    this._activeIndex = index;
    this._selectionAnchor = -1;
  }
  get value() {
    return this._value;
  }
  set value(val) {
    const next = this.filterAndTransform(val).slice(0, this.effectiveLength);
    if (this._value === next)
      return;
    const oldValue = this._value;
    this._value = next;
    this.setValue(next);
    if (this.input)
      this.input.value = next;
    if (this._focused) {
      this.setCaretIndex(Math.min(next.length, this.effectiveLength - 1));
    }
    this.requestUpdate("value", oldValue);
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  get effectiveLength() {
    return this.format ? [...this.format].filter((c) => c === "#").length : this.length;
  }
  get parsedFormat() {
    const src = this.format || "#".repeat(this.length);
    return [...src].map((c) => ({ type: c === "#" ? "segment" : "separator", char: c }));
  }
  filterAndTransform(val) {
    let s = val;
    if (this.type === "numeric")
      s = s.replace(/\D/g, "");
    else if (this.type === "alpha")
      s = s.replace(/[^a-zA-Z]/g, "");
    else if (this.type === "alphanumeric")
      s = s.replace(/[^a-zA-Z0-9]/g, "");
    if (this.case === "upper")
      s = s.toUpperCase();
    else if (this.case === "lower")
      s = s.toLowerCase();
    return s;
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (!this.hasUpdated) {
      const initial = this.filterAndTransform(this.defaultValue ?? "").slice(0, this.effectiveLength);
      if (this._value !== initial) {
        this._value = initial;
        this.setValue(initial);
        this._lastChangeValue = initial;
      }
    }
    if (this.hasUpdated && (changedProperties.has("type") || changedProperties.has("case") || changedProperties.has("length") || changedProperties.has("format"))) {
      const refiltered = this.filterAndTransform(this._value).slice(0, this.effectiveLength);
      if (refiltered !== this._value) {
        this._value = refiltered;
        this.setValue(refiltered);
        if (this.input)
          this.input.value = refiltered;
      }
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    const v = this._value;
    this.customStates.set("--blank", v.length === 0);
    this.customStates.set("--filled", v.length === this.effectiveLength);
    this.customStates.set("readonly", this.readonly);
    if (changedProperties.has("value") || changedProperties.has("required") || changedProperties.has("length") || changedProperties.has("format")) {
      this.updateValidity();
    }
    this.syncCursor();
    const activeSegment = this.segmentsContainer?.querySelector(".segment--active, .segment--selected");
    if (activeSegment && this.segmentsContainer) {
      scrollIntoView(activeSegment, this.segmentsContainer, "horizontal", "auto");
    }
  }
  syncCursor() {
    if (!this._focused || !this.input || this._activeIndex < 0)
      return;
    if (this.hasSelection)
      return;
    const len = this._value.length;
    const start = Math.min(this._activeIndex, len);
    const end = this._activeIndex < len ? start + 1 : start;
    this.input.setSelectionRange(start, end);
  }
  formResetCallback() {
    super.formResetCallback();
    const reset = this.filterAndTransform(this.defaultValue ?? "").slice(0, this.effectiveLength);
    const oldValue = this._value;
    this._value = reset;
    this.setValue(reset);
    this._lastChangeValue = reset;
    if (this.input)
      this.input.value = reset;
    this.requestUpdate("value", oldValue);
  }
  handleInput(event) {
    if (this.readonly)
      return;
    const input = event.target;
    const rawValue = input.value;
    const rawCursor = input.selectionStart ?? rawValue.length;
    const filtered = this.filterAndTransform(rawValue).slice(0, this.effectiveLength);
    let cursorAfterFilter = rawCursor;
    if (rawValue !== filtered) {
      input.value = filtered;
      const rawPrefix = rawValue.slice(0, rawCursor);
      cursorAfterFilter = Math.min(this.filterAndTransform(rawPrefix).length, this.effectiveLength);
    }
    this.setCaretIndex(Math.min(cursorAfterFilter, this.effectiveLength - 1));
    const prevLength = this._value.length;
    const oldValue = this._value;
    this._value = filtered;
    this.setValue(filtered);
    this.maybeDispatchComplete(filtered.length === this.effectiveLength && prevLength < this.effectiveLength);
    this.requestUpdate("value", oldValue);
  }
  maybeDispatchComplete(justCompleted) {
    if (!justCompleted)
      return;
    const notCanceled = this.dispatchEvent(new WaCompleteEvent);
    if (this.autosubmit && notCanceled) {
      setTimeout(() => submitForm(this));
    }
  }
  handleKeyDown(event) {
    if (event.isComposing)
      return;
    const max = this.effectiveLength;
    if (event.key === "Enter") {
      submitOnEnter(event, this);
    } else if (this.readonly) {
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
      }
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (this.hasSelection) {
        this.setCaretIndex(Math.min(Math.max(this._selectionAnchor, this._activeIndex), max - 1));
      } else {
        this._activeIndex = Math.min(this._activeIndex + 1, max - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (this.hasSelection) {
        this.setCaretIndex(Math.max(Math.min(this._selectionAnchor, this._activeIndex), 0));
      } else {
        this._activeIndex = Math.max(this._activeIndex - 1, 0);
      }
    } else if (event.key === "Backspace") {
      event.preventDefault();
      if (this.hasSelection) {
        const start = Math.min(this._selectionAnchor, this._activeIndex);
        const end = Math.max(this._selectionAnchor, this._activeIndex);
        this.spliceValue(start, end);
        this.setCaretIndex(Math.min(start, max - 1));
      } else {
        const idx = this._activeIndex;
        if (idx < this._value.length) {
          this.spliceValue(idx);
        }
        this.setCaretIndex(Math.max(idx - 1, 0));
      }
    } else if (event.key === "Delete") {
      event.preventDefault();
      if (this.hasSelection) {
        const start = Math.min(this._selectionAnchor, this._activeIndex);
        const end = Math.max(this._selectionAnchor, this._activeIndex);
        this.spliceValue(start, end);
        this.setCaretIndex(Math.min(start, max - 1));
      } else {
        const idx = this._activeIndex;
        if (idx < this._value.length) {
          this.spliceValue(idx);
        }
      }
    }
  }
  spliceValue(start, end = start + 1) {
    const next = this._value.slice(0, start) + this._value.slice(end);
    const oldValue = this._value;
    this._value = next;
    this.setValue(next);
    if (this.input)
      this.input.value = next;
    this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    this.requestUpdate("value", oldValue);
  }
  handlePaste(event) {
    event.preventDefault();
    if (this.readonly)
      return;
    const text = event.clipboardData?.getData("text/plain") ?? "";
    const filtered = this.filterAndTransform(text);
    if (!filtered)
      return;
    const idx = this._activeIndex;
    const max = this.effectiveLength;
    const slots = Array.from({ length: max }, (_, i) => this._value[i] ?? "");
    for (let i = 0;i < filtered.length && idx + i < max; i++) {
      slots[idx + i] = filtered[i];
    }
    let end = max - 1;
    while (end >= 0 && !slots[end])
      end--;
    const next = end >= 0 ? slots.slice(0, end + 1).join("") : "";
    const prevLength = this._value.length;
    const oldValue = this._value;
    this._value = next;
    this.setValue(next);
    if (this.input)
      this.input.value = next;
    this.setCaretIndex(Math.min(idx + filtered.length, max - 1));
    this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    this.maybeDispatchComplete(next.length === max && prevLength < max);
    this.requestUpdate("value", oldValue);
  }
  handleFocus() {
    this._focused = true;
    this.setCaretIndex(this._pendingClickIndex ?? Math.min(this._value.length, this.effectiveLength - 1));
  }
  handleSelect() {
    if (!this.input)
      return;
    const start = this.input.selectionStart ?? 0;
    const end = this.input.selectionEnd ?? start;
    if (end - start > 1) {
      this._selectionAnchor = start;
      this._activeIndex = end;
    } else if (this._selectionAnchor !== -1) {
      this._selectionAnchor = -1;
    }
  }
  handleBlur() {
    this._focused = false;
    this.setCaretIndex(-1);
    if (this._value !== this._lastChangeValue) {
      this._lastChangeValue = this._value;
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
  }
  segmentIndexAt(target) {
    const segment = target.closest('[part~="segment"]');
    if (!segment || !this.shadowRoot)
      return null;
    const segments = [...this.shadowRoot.querySelectorAll('[part~="segment"]')];
    const index = segments.indexOf(segment);
    return index >= 0 ? Math.min(index, this._value.length) : null;
  }
  handleSegmentsPointerDown(event) {
    if (this.disabled)
      return;
    this._pendingClickIndex = this.segmentIndexAt(event.target);
  }
  handleSegmentsClick(event) {
    if (this.disabled)
      return;
    this.input?.focus();
    const index = this.segmentIndexAt(event.target);
    if (index !== null) {
      this.setCaretIndex(index);
    }
    this._pendingClickIndex = null;
  }
  clear() {
    this.value = "";
    this.dispatchEvent(new WaClearEvent);
    this.focus();
  }
  focus(options) {
    this.input?.focus(options);
  }
  blur() {
    this.input?.blur();
  }
  select() {
    this.input?.select();
  }
  render() {
    const hasLabelSlot = this.hasSlotController.test("label");
    const hasHintSlot = this.hasSlotController.test("hint");
    const hasLabel = this.label ? true : !!hasLabelSlot;
    const hasHint = this.hint ? true : !!hasHintSlot;
    const chars = [...this._value];
    const parts = this.parsedFormat;
    const activeIndex = this._activeIndex;
    const selected = this.hasSelection ? [Math.min(this._selectionAnchor, activeIndex), Math.max(this._selectionAnchor, activeIndex)] : null;
    let segmentIndex = 0;
    return html`
      <label
        id="label"
        part="label"
        class=${classMap({ label: true, "has-label": hasLabel })}
        for="hidden-input"
        aria-hidden=${hasLabel ? "false" : "true"}
      >
        <slot name="label">${this.label}</slot>
      </label>

      <div
        part="segments"
        class="segments"
        role="group"
        aria-labelledby="label"
        @pointerdown=${this.handleSegmentsPointerDown}
        @click=${this.handleSegmentsClick}
      >
        ${parts.map((part) => {
      if (part.type === "separator") {
        return html`<span part="segment-literal" class="segment-literal" aria-hidden="true">${part.char}</span>`;
      }
      const i = segmentIndex++;
      const char = chars[i] ?? "";
      const filled = Boolean(char);
      const isSelected = !this.readonly && selected !== null && i >= selected[0] && i < selected[1];
      const isActive = !this.readonly && selected === null && i === activeIndex;
      const masked = filled && this.mask;
      return html`
            <div
              part="segment"
              class=${classMap({
        segment: true,
        "segment--active": isActive,
        "segment--selected": isSelected,
        "segment--filled": filled,
        "segment--masked": masked,
        "segment--mask-hint": !filled && this.withMask
      })}
              aria-hidden="true"
            >
              ${masked ? "" : char} ${isActive && !char ? html`<span class="caret"></span>` : ""}
            </div>
          `;
    })}

        <input
          id="hidden-input"
          class="hidden-input"
          type="text"
          .value=${live(this._value)}
          minlength=${this.effectiveLength}
          autocomplete=${this.autocomplete}
          inputmode=${this.type === "numeric" ? "numeric" : "text"}
          aria-describedby="hint"
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?autofocus=${this.autofocus}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
          @paste=${this.handlePaste}
          @focus=${this.handleFocus}
          @blur=${this.handleBlur}
          @select=${this.handleSelect}
        />
      </div>

      <slot
        id="hint"
        part="hint"
        name="hint"
        class=${classMap({ hint: true, "has-slotted": hasHint })}
        aria-hidden=${hasHint ? "false" : "true"}
        >${this.hint}</slot
      >
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".hidden-input")
], WaOtpInput.prototype, "input", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".segments")
], WaOtpInput.prototype, "segmentsContainer", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaOtpInput.prototype, "_focused", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaOtpInput.prototype, "_activeIndex", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaOtpInput.prototype, "_selectionAnchor", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaOtpInput.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaOtpInput.prototype, "length", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaOtpInput.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaOtpInput.prototype, "type", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaOtpInput.prototype, "mask", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaOtpInput.prototype, "case", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaOtpInput.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaOtpInput.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaOtpInput.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaOtpInput.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaOtpInput.prototype, "format", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaOtpInput.prototype, "autocomplete", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaOtpInput.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaOtpInput.prototype, "readonly", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaOtpInput.prototype, "autosubmit", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaOtpInput.prototype, "autofocus", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "with-mask", reflect: true })
], WaOtpInput.prototype, "withMask", undefined);
WaOtpInput = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-otp-input")
], WaOtpInput);
WaOtpInput.disableWarning?.("change-in-update");
