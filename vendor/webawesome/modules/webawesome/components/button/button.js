import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { html, literal } from "../../../lit/lit/static-html.js";
import { WaInvalidEvent } from "../../events/invalid.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { MirrorValidator } from "../../internal/validators/mirror-validator.js";
import { watch } from "../../internal/watch.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import sizeStyles from "../../styles/component/size.styles.js";
import variantStyles from "../../styles/component/variants.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import"../spinner/spinner.js";
import styles from "./button.styles.js";
export default class WaButton extends WebAwesomeFormAssociatedElement {
  constructor() {
    super(...arguments);
    this.assumeInteractionOn = ["click"];
    this.hasSlotController = new HasSlotController(this, "[default]", "start", "end");
    this.localize = new LocalizeController(this);
    this.invalid = false;
    this.isIconButton = false;
    this.title = "";
    this.variant = "neutral";
    this.appearance = "accent";
    this.size = "m";
    this.withCaret = false;
    this.withStart = false;
    this.withEnd = false;
    this.disabled = false;
    this.loading = false;
    this.pill = false;
    this.type = "button";
  }
  static shadowRootOptions = { ...WebAwesomeFormAssociatedElement.shadowRootOptions, delegatesFocus: true };
  static css = [styles, variantStyles, sizeStyles];
  static get validators() {
    return [...super.validators, MirrorValidator()];
  }
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  constructLightDOMButton() {
    const button = document.createElement("button");
    for (const attribute of this.attributes) {
      if (attribute.name === "style") {
        continue;
      }
      button.setAttribute(attribute.name, attribute.value);
    }
    button.type = this.type;
    button.style.position = "absolute !important";
    button.style.width = "0 !important";
    button.style.height = "0 !important";
    button.style.clipPath = "inset(50%) !important";
    button.style.overflow = "hidden !important";
    button.style.whiteSpace = "nowrap !important";
    if (this.name) {
      button.name = this.name;
    }
    button.value = this.value || "";
    return button;
  }
  handleClick(event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.type !== "submit" && this.type !== "reset") {
      return;
    }
    const form = this.getForm();
    if (!form)
      return;
    const lightDOMButton = this.constructLightDOMButton();
    this.parentElement?.append(lightDOMButton);
    lightDOMButton.click();
    lightDOMButton.remove();
  }
  handleInvalid() {
    this.dispatchEvent(new WaInvalidEvent);
  }
  handleLabelSlotChange() {
    const nodes = this.labelSlot.assignedNodes({ flatten: true });
    let hasIconLabel = false;
    let hasIcon = false;
    let hasText = false;
    let hasOtherElements = false;
    [...nodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        if (element.localName === "wa-icon") {
          hasIcon = true;
          if (!hasIconLabel)
            hasIconLabel = element.label !== undefined;
        } else {
          hasOtherElements = true;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() || "";
        if (text.length > 0) {
          hasText = true;
        }
      }
    });
    this.isIconButton = hasIcon && !hasText && !hasOtherElements;
    this.customStates.set("icon-button", this.isIconButton);
    if (this.isIconButton && !hasIconLabel) {
      console.warn('Icon buttons must have a label for screen readers. Add <wa-icon label="..."> to remove this warning.', this);
    }
  }
  isButton() {
    return this.href ? false : true;
  }
  isLink() {
    return this.href ? true : false;
  }
  handleDisabledChange() {
    this.customStates.set("disabled", this.disabled);
    this.updateValidity();
  }
  handleHrefChange() {
    this.customStates.set("link", this.isLink());
  }
  handleLoadingChange() {
    this.customStates.set("loading", this.loading);
  }
  setValue(..._args) {}
  click() {
    this.button.click();
  }
  focus(options) {
    this.button.focus(options);
  }
  blur() {
    this.button.blur();
  }
  render() {
    const isLink = this.isLink();
    const tag = isLink ? literal`a` : literal`button`;
    return html`
      <${tag}
        part="base button"
        class=${classMap({
      button: true,
      caret: this.withCaret,
      disabled: this.disabled,
      loading: this.loading,
      rtl: this.localize.dir() === "rtl",
      "has-label": this.hasSlotController.test("[default]"),
      "has-start": this.hasSlotController.test("start", "withStart"),
      "has-end": this.hasSlotController.test("end", "withEnd"),
      "is-icon-button": this.isIconButton
    })}
        ?disabled=${ifDefined(isLink ? undefined : this.disabled)}
        type=${ifDefined(isLink ? undefined : this.type)}
        title=${this.title}
        name=${ifDefined(isLink ? undefined : this.name)}
        value=${ifDefined(isLink ? undefined : this.value)}
        href=${ifDefined(isLink ? this.href : undefined)}
        target=${ifDefined(isLink ? this.target : undefined)}
        download=${ifDefined(isLink ? this.download : undefined)}
        rel=${ifDefined(isLink && this.rel ? this.rel : undefined)}
        role=${ifDefined(isLink ? undefined : "button")}
        aria-disabled=${ifDefined(isLink && this.disabled ? "true" : undefined)}
        aria-busy=${this.loading ? "true" : "false"}
        tabindex=${this.disabled ? "-1" : "0"}
        @invalid=${this.isButton() ? this.handleInvalid : null}
        @click=${this.handleClick}
      >
        <slot name="start" part="start" class="start"></slot>
        <slot part="label" class="label" @slotchange=${this.handleLabelSlotChange}></slot>
        <slot name="end" part="end" class="end"></slot>
        ${this.withCaret ? html`
                <wa-icon part="caret" class="caret" library="system" name="chevron-down" variant="solid"></wa-icon>
              ` : ""}
        ${this.loading ? html`<wa-spinner part="spinner"></wa-spinner>` : ""}
      </${tag}>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".button")
], WaButton.prototype, "button", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaButton.prototype, "labelSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaButton.prototype, "invalid", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaButton.prototype, "isIconButton", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaButton.prototype, "title", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaButton.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaButton.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaButton.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaButton.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-caret", type: Boolean, reflect: true })
], WaButton.prototype, "withCaret", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-start", type: Boolean })
], WaButton.prototype, "withStart", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-end", type: Boolean })
], WaButton.prototype, "withEnd", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaButton.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaButton.prototype, "loading", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaButton.prototype, "pill", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaButton.prototype, "type", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaButton.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaButton.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaButton.prototype, "href", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaButton.prototype, "target", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaButton.prototype, "rel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaButton.prototype, "download", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "formaction" })
], WaButton.prototype, "formAction", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "formenctype" })
], WaButton.prototype, "formEnctype", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "formmethod" })
], WaButton.prototype, "formMethod", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "formnovalidate", type: Boolean })
], WaButton.prototype, "formNoValidate", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "formtarget" })
], WaButton.prototype, "formTarget", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaButton.prototype, "handleDisabledChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("href")
], WaButton.prototype, "handleHrefChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("loading", { waitUntilFirstUpdate: true })
], WaButton.prototype, "handleLoadingChange", null);
WaButton = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-button")
], WaButton);
WaButton.disableWarning?.("change-in-update");
