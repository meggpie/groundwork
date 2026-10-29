import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, nothing } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import getText from "../../internal/get-text.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import styles from "./option.styles.js";
export default class WaOption extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.cachedDefaultLabel = "";
    this.isInitialized = false;
    this.isDefaultLabelDirty = true;
    this.current = false;
    this.value = "";
    this.disabled = false;
    this.selected = false;
    this.defaultSelected = false;
    this._label = "";
    this.handleHover = (event) => {
      if (event.type === "mouseenter") {
        this.customStates.set("hover", true);
      } else if (event.type === "mouseleave") {
        this.customStates.set("hover", false);
      }
    };
  }
  static css = styles;
  set label(value) {
    const oldValue = this._label;
    this._label = value || "";
    if (this._label !== oldValue) {
      this.requestUpdate("label", oldValue);
    }
  }
  get label() {
    if (this._label) {
      return this._label;
    }
    return this.defaultLabel;
  }
  get defaultLabel() {
    if (this.isDefaultLabelDirty || !this.cachedDefaultLabel) {
      this.updateDefaultLabel();
    }
    return this.cachedDefaultLabel;
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "option");
    this.setAttribute("aria-selected", "false");
    this.addEventListener("mouseenter", this.handleHover);
    this.addEventListener("mouseleave", this.handleHover);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("mouseenter", this.handleHover);
    this.removeEventListener("mouseleave", this.handleHover);
  }
  handleDefaultSlotChange() {
    this.isDefaultLabelDirty = true;
    if (!this.isInitialized) {
      this.isInitialized = true;
      return;
    }
    const controller = this.closest("wa-select, wa-combobox");
    if (controller) {
      customElements.whenDefined(controller.localName).then(() => controller.handleDefaultSlotChange?.());
    }
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("defaultSelected")) {
      if (this.didSSR && this.hasUpdated || !this.didSSR) {
        this.syncDefaultSelected();
      }
    }
    super.willUpdate(changedProperties);
  }
  syncDefaultSelected() {
    if ("closest" in this) {
      if (!this.closest("wa-combobox, wa-select")?.hasInteracted) {
        if (this.defaultSelected) {
          const oldVal = this.selected;
          this.selected = this.defaultSelected;
          this.requestUpdate("selected", oldVal);
        }
      }
    }
  }
  updated(changedProperties) {
    if (changedProperties.has("disabled")) {
      this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
      this.customStates.set("disabled", this.disabled);
    }
    if (changedProperties.has("selected")) {
      this.setAttribute("aria-selected", this.selected ? "true" : "false");
      this.customStates.set("selected", this.selected);
    }
    if (changedProperties.has("value")) {
      if (typeof this.value !== "string") {
        this.value = String(this.value);
      }
      this.handleDefaultSlotChange();
    }
    if (changedProperties.has("current")) {
      this.customStates.set("current", this.current);
    }
    super.updated(changedProperties);
  }
  async firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.didSSR && !this.hasUpdated) {
      await this.updateComplete;
      this.syncDefaultSelected();
    } else {
      this.syncDefaultSelected();
    }
    if (this.selected && !this.defaultSelected) {
      const parent = this.closest("wa-select, wa-combobox");
      if (parent && !parent.hasInteracted) {
        await customElements.whenDefined(parent?.localName);
        await parent.updateComplete;
        parent.selectionChanged?.();
      }
    }
  }
  updateDefaultLabel() {
    let oldValue = this.cachedDefaultLabel;
    this.cachedDefaultLabel = getText(this).trim();
    this.isDefaultLabelDirty = false;
    let changed = this.cachedDefaultLabel !== oldValue;
    if (!this._label && changed) {
      this.requestUpdate("label", oldValue);
    }
    return changed;
  }
  render() {
    let selected = this.selected;
    if (this.didSSR && !this.hasUpdated) {
      this.updateComplete.then(() => {
        this.requestUpdate();
      });
      return nothing;
    }
    return html`
      ${selected ? html`<wa-icon
            part="checked-icon"
            class="check"
            name="check"
            library="system"
            variant="solid"
            aria-hidden="true"
          ></wa-icon>` : html`<span part="checked-icon" class="check" aria-hidden="true"></span>`}
      <slot part="start" name="start" class="start"></slot>
      <slot part="label" class="label" @slotchange=${this.handleDefaultSlotChange}></slot>
      <slot part="end" name="end" class="end"></slot>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".label")
], WaOption.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaOption.prototype, "current", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaOption.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaOption.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: false })
], WaOption.prototype, "selected", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "selected" })
], WaOption.prototype, "defaultSelected", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaOption.prototype, "label", null);
WaOption = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-option")
], WaOption);
