import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer, nothing } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import"../popup/popup.js";
import { WaAfterHideEvent } from "../../events/after-hide.js";
import { WaAfterShowEvent } from "../../events/after-show.js";
import { WaClearEvent } from "../../events/clear.js";
import { WaHideEvent } from "../../events/hide.js";
import { WaShowEvent } from "../../events/show.js";
import { animateWithClass } from "../../internal/animate.js";
import { isTopDismissible, registerDismissible, unregisterDismissible } from "../../internal/dismissible-stack.js";
import { waitForEvent } from "../../internal/event.js";
import { SegmentedFieldController } from "../../internal/segmented-field/segmented-field-controller.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { MirrorValidator } from "../../internal/validators/mirror-validator.js";
import { RequiredValidator } from "../../internal/validators/required-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import formControlStyles from "../../styles/component/form-control.styles.js";
import segmentedFieldStyles from "../../styles/component/segmented-field.styles.js";
import sizeStyles from "../../styles/component/size.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import {
  buildTimeSegmentLayout,
  dayPeriodFromKey,
  formatDayPeriod,
  formatTimeSegmentText,
  isTimeEmpty,
  resolveHour12,
  timeSegmentRules,
  timeSegmentsToWire,
  wireToTimeSegments,
  withSecondsForStep
} from "./internal/time-segments.js";
import styles from "./time-input.styles.js";
let uniqueId = 0;
const generateId = () => `wa-time-input-${++uniqueId}`;
const SINGLE_GROUP = "single";
export default class WaTimeInput extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["input"];
    this.hasSlotController = new HasSlotController(this, "hint", "label", "footer");
    this.localize = new LocalizeController(this);
    this.popupId = generateId();
    this.keyboardHelpId = `${this.popupId}-help`;
    this.pendingValue = null;
    this.moveFocusToColumnOnShow = false;
    this.lastEmittedValue = "";
    this.segments = { hour: null, minute: null, second: null, dayPeriod: null };
    this.segmentsController = new SegmentedFieldController(this, {
      getLayout: () => this.getLayout(),
      isRtl: () => this.isRtl,
      isReadonly: () => this.readonly,
      isDisabled: () => this.disabled,
      rules: timeSegmentRules({
        getSegments: () => this.segments,
        setSegments: (_group, next) => {
          this.segments = next;
        },
        hour12: () => this.resolvedHour12
      }),
      onCommit: () => {
        this.recomputeValue();
        this.requestUpdate();
      }
    });
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
    this.withClear = false;
    this.withNow = false;
    this.withLabel = false;
    this.withHint = false;
    this.min = "";
    this.max = "";
    this.step = 60;
    this.hourFormat = "auto";
    this.open = false;
    this.placement = "bottom-start";
    this.distance = 0;
    this.handleDocumentFocusIn = (event) => {
      const path = event.composedPath();
      if (!path.includes(this))
        this.hide();
    };
    this.handleDocumentKeyDown = (event) => {
      if (event.key === "Escape" && this.open && isTopDismissible(this)) {
        event.stopPropagation();
        event.preventDefault();
        this.hide();
      }
    };
    this.handleDocumentMouseDown = (event) => {
      const path = event.composedPath();
      if (!path.includes(this))
        this.hide();
    };
    this.handleSegmentFocus = (event) => {
      this.segmentsController.eventHandlers().focus(event);
    };
    this.handleSegmentBlur = (event) => {
      this.segmentsController.eventHandlers().blur(event);
    };
    this.handleInputWrapperPointerDown = (event) => {
      if (this.disabled || this.readonly || this.open)
        return;
      for (const node of event.composedPath()) {
        if (node === this)
          break;
        if (!(node instanceof Element))
          continue;
        const tag = node.tagName;
        if (tag === "BUTTON" || tag === "A" || node.getAttribute("role") === "button")
          return;
      }
      this.show();
    };
    this.handleSegmentKeyDown = (event) => {
      const el = event.currentTarget;
      const field = el.dataset.segment;
      if (event.altKey && event.key === "ArrowDown") {
        event.preventDefault();
        this.moveFocusToColumnOnShow = true;
        if (this.open) {
          this.focusFirstColumn();
        } else {
          this.show();
        }
        return;
      }
      if (event.altKey && event.key === "ArrowUp") {
        event.preventDefault();
        this.hide();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (this.segmentsController.getBuffer(SINGLE_GROUP, field)) {
          this.segmentsController.flushBuffer(SINGLE_GROUP, field);
          this.recomputeValue();
        }
        if (this.open)
          this.hide();
        return;
      }
      if (field === "dayPeriod") {
        const period = dayPeriodFromKey(event.key);
        if (period != null) {
          event.preventDefault();
          if (this.readonly)
            return;
          this.segments = { ...this.segments, dayPeriod: period };
          this.recomputeValue();
          this.requestUpdate();
          this.segmentsController.moveFocus(el, 1);
          return;
        }
      }
      this.segmentsController.eventHandlers().keydown(event);
    };
    this.handleExpandButtonClick = () => {
      if (this.open) {
        this.hide();
      } else {
        this.moveFocusToColumnOnShow = true;
        this.show();
      }
    };
    this.handleClearClick = (event) => {
      event.stopPropagation();
      if (!this._value && isTimeEmpty(this.segments))
        return;
      this._value = "";
      this.valueHasChanged = true;
      this.segmentsController.clearBuffers();
      this.syncSegmentsFromCanonical();
      this.updateValidity();
      this.dispatchEvent(new WaClearEvent);
      this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      this.lastEmittedValue = "";
      this.focus();
    };
    this.handleClearMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    this.handleNowClick = () => {
      const now = new Date;
      this.value = now;
      this.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      this.lastEmittedValue = this._value;
      this.hide();
    };
    this.handleColumnItemClick = (event) => {
      const target = event.target.closest(".column-item");
      if (!target || target.getAttribute("aria-disabled") === "true")
        return;
      const field = target.dataset.field;
      const value = Number(target.dataset.value);
      if (Number.isNaN(value))
        return;
      this.segments = { ...this.segments, [field]: value };
      this.recomputeValue();
      this.requestUpdate();
    };
    this.handleColumnKeyDown = (event) => {
      const column = event.currentTarget;
      const field = column.dataset.field;
      if (event.key === "Escape") {
        event.preventDefault();
        this.hide();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        this.hide();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const fields = this.columnFields;
        if (fields.length < 2)
          return;
        const delta = event.key === "ArrowLeft" ? -1 : 1;
        const currentIdx = fields.indexOf(field);
        const nextIdx = ((currentIdx + delta) % fields.length + fields.length) % fields.length;
        const nextField = fields[nextIdx];
        const nextColumn = this.shadowRoot?.querySelector(`.column[data-field="${nextField}"]`);
        nextColumn?.focus({ preventScroll: true });
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "PageUp" || event.key === "PageDown") {
        event.preventDefault();
        const delta = event.key === "ArrowUp" || event.key === "PageUp" ? -1 : 1;
        const jump = event.key === "PageUp" || event.key === "PageDown" ? 5 : 1;
        const items = this.columnItemsFor(field);
        if (items.length === 0)
          return;
        const currentValue = this.segments[field];
        const idx = currentValue == null ? 0 : Math.max(0, items.findIndex((it) => it.value === currentValue));
        const nextIdx = ((idx + delta * jump) % items.length + items.length) % items.length;
        const nextItem = items[nextIdx];
        this.segments = { ...this.segments, [field]: nextItem.value };
        this.recomputeValue();
        this.requestUpdate();
        requestAnimationFrame(() => {
          const itemEl = column.querySelector(`[data-value="${nextItem.value}"]`);
          if (itemEl)
            this.keepItemInView(column, itemEl);
        });
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        const items = this.columnItemsFor(field);
        if (items.length === 0)
          return;
        this.segments = { ...this.segments, [field]: items[0].value };
        this.recomputeValue();
        this.requestUpdate();
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        const items = this.columnItemsFor(field);
        if (items.length === 0)
          return;
        const lastItem = items[items.length - 1];
        this.segments = { ...this.segments, [field]: lastItem.value };
        this.recomputeValue();
        this.requestUpdate();
        return;
      }
    };
  }
  static css = [sizeStyles, formControlStyles, segmentedFieldStyles, styles];
  static shadowRootOptions = {
    ...WebAwesomeFormAssociatedElement.shadowRootOptions,
    delegatesFocus: true
  };
  static get validators() {
    const validators = isServer ? [] : [
      RequiredValidator({
        validationElement: Object.assign(document.createElement("input"), { required: true })
      }),
      MirrorValidator()
    ];
    return [...super.validators, ...validators];
  }
  term(key, fallback) {
    return this.localize.term(key) || fallback;
  }
  get validationTarget() {
    return this.valueInput;
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
      this.syncSegmentsFromCanonical();
    } else {
      this.pendingValue = this._value;
    }
    this.requestUpdate("value", oldValue);
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.pendingValue != null) {
      this._value = this.pendingValue;
      this.pendingValue = null;
    } else if (!this._value && this.defaultValue) {
      this._value = this.defaultValue;
    }
    this.syncSegmentsFromCanonical();
    this.input = this.valueInput;
    this.updateValidity();
    this.lastEmittedValue = this._value;
  }
  updated(changed) {
    super.updated?.(changed);
    if (changed.has("value")) {
      this.customStates.set("blank", !this.value);
    }
    if (changed.has("disabled")) {
      this.customStates.set("disabled", this.disabled);
    }
    if (changed.has("open")) {
      this.customStates.set("open", this.open);
    }
    if (changed.has("step") || changed.has("hourFormat")) {
      this.syncSegmentsFromCanonical();
    }
    if (changed.has("min") || changed.has("max") || changed.has("step")) {
      this.updateValidity();
    }
  }
  handleDisabledChange() {
    if (this.disabled && this.open) {
      this.open = false;
    }
  }
  async handleOpenChange() {
    if (this.open && !this.disabled) {
      const showEvent = new WaShowEvent;
      this.dispatchEvent(showEvent);
      if (showEvent.defaultPrevented) {
        this.open = false;
        return;
      }
      this.addOpenListeners();
      this.popup.active = true;
      await this.updateComplete;
      await animateWithClass(this.popup.popup, "show");
      this.scrollColumnsToCurrent();
      if (this.moveFocusToColumnOnShow) {
        this.moveFocusToColumnOnShow = false;
        this.focusFirstColumn();
      }
      this.dispatchEvent(new WaAfterShowEvent);
    } else {
      const hideEvent = new WaHideEvent;
      this.dispatchEvent(hideEvent);
      if (hideEvent.defaultPrevented) {
        this.open = true;
        return;
      }
      this.removeOpenListeners();
      await animateWithClass(this.popup.popup, "hide");
      this.popup.active = false;
      this.dispatchEvent(new WaAfterHideEvent);
      const active = this.shadowRoot?.activeElement;
      if (active && this.popup?.contains(active)) {
        this.focusActiveSegment();
      }
    }
  }
  focus(options) {
    const target = this.segmentsController.findFocusableSegment((_g, f) => this.segments[f] == null);
    target?.focus(options);
  }
  blur() {
    const active = this.shadowRoot?.activeElement;
    active?.blur();
  }
  async show() {
    if (this.open || this.disabled)
      return;
    this.open = true;
    await waitForEvent(this, "wa-after-show");
  }
  async hide() {
    if (!this.open || this.disabled)
      return;
    this.open = false;
    await waitForEvent(this, "wa-after-hide");
  }
  get valueAsDate() {
    const value = this.value;
    if (!value)
      return null;
    const segments = wireToTimeSegments(value, { hour12: false, withSeconds: this.resolvedWithSeconds });
    if (segments.hour == null || segments.minute == null)
      return null;
    const d = new Date;
    d.setHours(segments.hour, segments.minute, segments.second ?? 0, 0);
    return d;
  }
  get valueAsNumber() {
    const d = this.valueAsDate;
    if (!d)
      return Number.NaN;
    return d.getHours() * 3600000 + d.getMinutes() * 60000 + d.getSeconds() * 1000;
  }
  formResetCallback() {
    this._value = this.defaultValue;
    this.valueHasChanged = false;
    this.segmentsController.clearBuffers();
    this.syncSegmentsFromCanonical();
    super.formResetCallback();
    this.lastEmittedValue = this._value;
    this.requestUpdate();
  }
  formStateRestoreCallback(state) {
    if (typeof state === "string") {
      this._value = state;
      if (this.hasUpdated) {
        this.syncSegmentsFromCanonical();
      } else {
        this.pendingValue = state;
      }
      this.requestUpdate();
    }
    this.updateValidity();
  }
  get resolvedLocale() {
    return this.localize.lang() || "en";
  }
  get isRtl() {
    return this.localize.dir() === "rtl";
  }
  get resolvedHour12() {
    if (this.hourFormat === "12")
      return true;
    if (this.hourFormat === "24")
      return false;
    return resolveHour12(this.resolvedLocale);
  }
  get resolvedWithSeconds() {
    return withSecondsForStep(this.step);
  }
  getLayout() {
    return buildTimeSegmentLayout(this.resolvedLocale, {
      hour12: this.resolvedHour12,
      withSeconds: this.resolvedWithSeconds
    });
  }
  normalizeIncomingValue(val) {
    if (val == null)
      return "";
    if (typeof val === "string")
      return val;
    if (val instanceof Date) {
      const hh = String(val.getHours()).padStart(2, "0");
      const mm = String(val.getMinutes()).padStart(2, "0");
      const ss = String(val.getSeconds()).padStart(2, "0");
      return this.resolvedWithSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    }
    return "";
  }
  syncSegmentsFromCanonical() {
    this.segmentsController.clearBuffers();
    this.segments = wireToTimeSegments(this._value, {
      hour12: this.resolvedHour12,
      withSeconds: this.resolvedWithSeconds
    });
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
    const newValue = timeSegmentsToWire(this.segments, {
      hour12: this.resolvedHour12,
      withSeconds: this.resolvedWithSeconds
    });
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
  addOpenListeners() {
    document.addEventListener("focusin", this.handleDocumentFocusIn);
    document.addEventListener("keydown", this.handleDocumentKeyDown);
    document.addEventListener("mousedown", this.handleDocumentMouseDown);
    registerDismissible(this);
  }
  removeOpenListeners() {
    document.removeEventListener("focusin", this.handleDocumentFocusIn);
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("mousedown", this.handleDocumentMouseDown);
    unregisterDismissible(this);
  }
  focusActiveSegment() {
    const active = this.segmentsController.getActiveSegment();
    if (active) {
      const el = this.segmentsController.segmentElementFor(active.group, active.field);
      if (el) {
        el.focus({ preventScroll: true });
        return;
      }
    }
    this.segmentsController.findFocusableSegment((_g, f) => this.segments[f] == null)?.focus({ preventScroll: true });
  }
  get columnFields() {
    return this.getLayout().order.filter((f) => f !== undefined);
  }
  columnItemsFor(field) {
    if (field === "dayPeriod") {
      return [
        { label: this.term("am", formatDayPeriod(this.resolvedLocale, 0)), value: 0, disabled: false },
        { label: this.term("pm", formatDayPeriod(this.resolvedLocale, 1)), value: 1, disabled: false }
      ];
    }
    if (field === "hour") {
      const items = [];
      if (this.resolvedHour12) {
        for (let h = 1;h <= 12; h++)
          items.push({ label: String(h).padStart(2, "0"), value: h, disabled: false });
      } else {
        for (let h = 0;h <= 23; h++)
          items.push({ label: String(h).padStart(2, "0"), value: h, disabled: false });
      }
      return items;
    }
    const stepSec = typeof this.step === "number" && Number.isFinite(this.step) && this.step > 0 ? this.step : 1;
    const stride = field === "minute" ? stepSec < 60 ? 1 : Math.max(1, Math.floor(stepSec / 60)) : Math.max(1, Math.floor(stepSec));
    const items = [];
    for (let v = 0;v < 60; v += stride) {
      items.push({ label: String(v).padStart(2, "0"), value: v, disabled: false });
    }
    return items;
  }
  focusFirstColumn() {
    if (!this.shadowRoot)
      return;
    const first = this.shadowRoot.querySelector(".column");
    first?.focus({ preventScroll: true });
  }
  scrollColumnsToCurrent() {
    if (!this.shadowRoot)
      return;
    for (const column of this.shadowRoot.querySelectorAll(".column")) {
      const field = column.dataset.field;
      const value = this.segments[field];
      if (value == null)
        continue;
      const item = column.querySelector(`[data-value="${value}"]`);
      if (item)
        this.keepItemInView(column, item);
    }
  }
  keepItemInView(column, item) {
    const columnRect = column.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < columnRect.top) {
      column.scrollTop += itemRect.top - columnRect.top;
    } else if (itemRect.bottom > columnRect.bottom) {
      column.scrollTop += itemRect.bottom - columnRect.bottom;
    }
  }
  placeholderFor(_field) {
    return "--";
  }
  fieldLabelFor(field) {
    const fallback = field === "hour" ? "Hour" : field === "minute" ? "Minute" : field === "second" ? "Second" : "AM/PM";
    return this.term(field, fallback);
  }
  segmentAriaValueText(field) {
    const value = this.segments[field];
    const buffer = this.segmentsController.getBuffer(SINGLE_GROUP, field);
    if (buffer)
      return buffer;
    if (value == null)
      return this.term("empty", "Empty");
    if (field === "dayPeriod") {
      return value === 0 ? this.term("am", "AM") : this.term("pm", "PM");
    }
    return String(value);
  }
  render() {
    const hasLabelSlot = this.hasUpdated ? this.hasSlotController.test("label") : this.withLabel;
    const hasHintSlot = this.hasUpdated ? this.hasSlotController.test("hint") : this.withHint;
    const hasFooterSlot = this.hasUpdated ? this.hasSlotController.test("footer") : false;
    const hasLabel = !!this.label || !!hasLabelSlot;
    const hasHint = !!this.hint || !!hasHintSlot;
    const hasValue = !!this._value;
    const layout = this.getLayout();
    const groupAriaLabel = this.label || this.term("time", "Time");
    return html`
      <div
        part="form-control"
        class=${classMap({
      "form-control": true,
      "form-control-has-label": hasLabel
    })}
      >
        <label
          id="label"
          part="form-control-label label"
          class=${classMap({ label: true, "has-label": hasLabel })}
          aria-hidden=${hasLabel ? "false" : "true"}
          @click=${() => this.focus()}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <wa-popup
            class=${classMap({ "time-input-popup": true, open: this.open })}
            placement=${this.placement}
            distance=${this.distance}
            ?active=${this.open}
            flip
            shift
          >
            <div
              part="base time-input input-wrapper"
              class="input-wrapper"
              slot="anchor"
              @pointerdown=${this.handleInputWrapperPointerDown}
            >
              <slot name="start" part="start" class="start"></slot>

              <div
                part="input"
                class="segments"
                role="group"
                aria-labelledby=${hasLabel ? "label" : nothing}
                aria-label=${hasLabel ? nothing : groupAriaLabel}
              >
                ${this.renderSegmentGroup(layout)}
              </div>

              <span id=${this.keyboardHelpId} class="visually-hidden">
                ${this.term("timeInputKeyboardHelp", "Use arrow keys to change values; press Alt+Down Arrow to open the time picker.")}
              </span>

              <input
                class="value-input"
                type="time"
                tabindex="-1"
                aria-hidden="true"
                .value=${this._value}
                min=${ifDefined(this.min || undefined)}
                max=${ifDefined(this.max || undefined)}
                step=${ifDefined(this.step === "any" ? "any" : String(this.step))}
                ?disabled=${this.disabled}
                ?required=${this.required}
                autocomplete=${ifDefined(this.autocomplete || undefined)}
              />

              ${this.withClear && hasValue ? html`<button
                    part="clear-button"
                    type="button"
                    class="clear-button"
                    aria-label=${this.localize.term("clearEntry")}
                    tabindex="-1"
                    @mousedown=${this.handleClearMouseDown}
                    @click=${this.handleClearClick}
                  >
                    <slot name="clear-icon">
                      <wa-icon name="circle-xmark" library="system" variant="regular"></wa-icon>
                    </slot>
                  </button>` : nothing}

              <slot name="end" part="end" class="end"></slot>

              <button
                part="expand-button"
                type="button"
                class="expand-button"
                aria-label=${this.open ? this.term("closeTimeInput", "Close time picker") : this.term("chooseTime", "Choose time")}
                aria-haspopup="dialog"
                aria-expanded=${this.open ? "true" : "false"}
                aria-controls=${this.popupId}
                ?disabled=${this.disabled}
                @click=${this.handleExpandButtonClick}
              >
                <slot name="expand-icon" part="expand-icon" class="expand-icon">
                  <wa-icon library="system" name="clock"></wa-icon>
                </slot>
              </button>
            </div>

            <div
              id=${this.popupId}
              part="popup"
              class="popup-body"
              role="dialog"
              aria-modal="true"
              aria-label=${this.term("chooseTime", "Choose time")}
            >
              <div part="columns" class="columns">${this.columnFields.map((f) => this.renderColumn(f))}</div>
              ${hasFooterSlot ? html`<div class="popup-footer"><slot name="footer"></slot></div>` : this.withNow ? html`<div class="popup-footer">
                      <button part="now-button" type="button" class="now-button" @click=${this.handleNowClick}>
                        ${this.term("now", "Now")}
                      </button>
                    </div>` : nothing}
            </div>
          </wa-popup>
        </div>

        <slot
          id="hint"
          name="hint"
          part="hint"
          class=${classMap({ "has-slotted": hasHint })}
          aria-hidden=${hasHint ? "false" : "true"}
        >
          ${this.hint}
        </slot>
      </div>
    `;
  }
  renderSegmentGroup(layout) {
    const active = this.segmentsController.getActiveSegment();
    let tabAssigned = false;
    const nodes = [];
    for (const token of layout.tokens) {
      if (token.kind === "literal") {
        nodes.push(html`<span part="segment-literal" class="segment-literal" aria-hidden="true">${token.text}</span>`);
      } else {
        const field = token.field;
        const isFirstActive = !tabAssigned && (active == null || active.field === field);
        if (isFirstActive)
          tabAssigned = true;
        nodes.push(this.renderSegment(field, isFirstActive));
      }
    }
    return nodes;
  }
  renderSegment(field, isTabStop) {
    const value = this.segments[field];
    const buffer = this.segmentsController.getBuffer(SINGLE_GROUP, field);
    const placeholder = this.placeholderFor(field);
    const display = formatTimeSegmentText(field, value, buffer, placeholder, this.resolvedLocale);
    const isEmptySegment = value == null && !buffer;
    const bounds = field === "hour" ? this.resolvedHour12 ? { min: 1, max: 12 } : { min: 0, max: 23 } : field === "minute" || field === "second" ? { min: 0, max: 59 } : { min: 0, max: 1 };
    const ariaValueText = this.segmentAriaValueText(field);
    return html`<span
      part="segment"
      class=${classMap({ segment: true, empty: isEmptySegment, [`segment-${field}`]: true })}
      data-group=${SINGLE_GROUP}
      data-segment=${field}
      role="spinbutton"
      tabindex=${this.disabled ? -1 : isTabStop ? 0 : -1}
      aria-label=${this.fieldLabelFor(field)}
      aria-valuemin=${bounds.min}
      aria-valuemax=${bounds.max}
      aria-valuenow=${ifDefined(value == null ? undefined : value)}
      aria-valuetext=${ariaValueText}
      aria-readonly=${this.readonly ? "true" : "false"}
      aria-disabled=${this.disabled ? "true" : "false"}
      aria-describedby=${this.keyboardHelpId}
      inputmode=${field === "dayPeriod" ? "text" : "numeric"}
      @keydown=${this.handleSegmentKeyDown}
      @focus=${this.handleSegmentFocus}
      @blur=${this.handleSegmentBlur}
      >${display}</span
    >`;
  }
  renderColumn(field) {
    const items = this.columnItemsFor(field);
    const currentValue = this.segments[field];
    const activedescendantId = currentValue != null ? `${this.popupId}-${field}-${currentValue}` : undefined;
    return html`<div
      part="column column-${field}"
      class=${classMap({ column: true, [`column-${field}`]: true })}
      data-field=${field}
      role="listbox"
      tabindex="0"
      aria-label=${this.fieldLabelFor(field)}
      aria-orientation="vertical"
      aria-activedescendant=${ifDefined(activedescendantId)}
      @click=${this.handleColumnItemClick}
      @keydown=${this.handleColumnKeyDown}
    >
      ${items.map((item) => {
      const id = `${this.popupId}-${field}-${item.value}`;
      const selected = item.value === currentValue;
      return html`<button
          id=${id}
          part="column-item ${selected ? "column-item-selected" : ""}"
          class="column-item"
          data-field=${field}
          data-value=${item.value}
          type="button"
          role="option"
          aria-selected=${selected ? "true" : "false"}
          aria-disabled=${item.disabled ? "true" : "false"}
          tabindex="-1"
        >
          ${item.label}
        </button>`;
    })}
    </div>`;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".time-input-popup")
], WaTimeInput.prototype, "popup", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".value-input")
], WaTimeInput.prototype, "valueInput", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTimeInput.prototype, "segments", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTimeInput.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTimeInput.prototype, "value", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "value", reflect: true })
], WaTimeInput.prototype, "defaultValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaTimeInput.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTimeInput.prototype, "required", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTimeInput.prototype, "readonly", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTimeInput.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaTimeInput.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTimeInput.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTimeInput.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTimeInput.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hint" })
], WaTimeInput.prototype, "hint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTimeInput.prototype, "autocomplete", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-clear", type: Boolean })
], WaTimeInput.prototype, "withClear", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-now", type: Boolean })
], WaTimeInput.prototype, "withNow", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-label", type: Boolean })
], WaTimeInput.prototype, "withLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-hint", type: Boolean })
], WaTimeInput.prototype, "withHint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTimeInput.prototype, "min", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTimeInput.prototype, "max", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ converter: { fromAttribute: stepFromAttribute, toAttribute: stepToAttribute } })
], WaTimeInput.prototype, "step", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hour-format", reflect: true })
], WaTimeInput.prototype, "hourFormat", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTimeInput.prototype, "open", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTimeInput.prototype, "placement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaTimeInput.prototype, "distance", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaTimeInput.prototype, "handleDisabledChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("open", { waitUntilFirstUpdate: true })
], WaTimeInput.prototype, "handleOpenChange", null);
WaTimeInput = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-time-input")
], WaTimeInput);
function stepFromAttribute(value) {
  if (value == null)
    return 60;
  if (value === "any")
    return "any";
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 60;
}
function stepToAttribute(value) {
  if (value === "any")
    return "any";
  return String(value);
}
