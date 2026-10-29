import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { WaAfterHideEvent } from "../../events/after-hide.js";
import { WaAfterShowEvent } from "../../events/after-show.js";
import { WaHideEvent } from "../../events/hide.js";
import { WaShowEvent } from "../../events/show.js";
import { animate, parseDuration } from "../../internal/animate.js";
import { waitForEvent } from "../../internal/event.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { WebAwesomeFormAssociatedElement } from "../../internal/webawesome-form-associated-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import styles from "./details.styles.js";
export default class WaDetails extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.animationGeneration = 0;
    this.isAnimating = false;
    this.open = false;
    this.disabled = false;
    this.appearance = "outlined";
    this.iconPlacement = "end";
  }
  static css = styles;
  disconnectedCallback() {
    super.disconnectedCallback();
    this.detailsObserver?.disconnect();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.body.style.height = this.open ? "auto" : "0";
    if (this.open) {
      this.details.open = true;
    }
    this.detailsObserver = new MutationObserver((changes) => {
      for (const change of changes) {
        if (change.type === "attributes" && change.attributeName === "open") {
          if (this.details.open) {
            this.show();
          } else {
            this.hide();
          }
        }
      }
    });
    this.detailsObserver.observe(this.details, { attributes: true });
  }
  updated(changedProperties) {
    if (changedProperties.has("isAnimating")) {
      this.customStates.set("animating", this.isAnimating);
    }
  }
  handleSummaryClick(event) {
    const eventPath = event.composedPath();
    const hasInteractiveElement = eventPath.some((element) => {
      if (!(element instanceof HTMLElement))
        return false;
      const tagName = element.tagName?.toLowerCase();
      if (["a", "button", "input", "textarea", "select"].includes(tagName)) {
        return true;
      }
      if (element instanceof WebAwesomeFormAssociatedElement) {
        return !("disabled" in element) || !element.disabled;
      }
      return false;
    });
    if (hasInteractiveElement) {
      return;
    }
    event.preventDefault();
    if (!this.disabled) {
      if (this.open) {
        this.hide();
      } else {
        this.show();
      }
      this.header.focus();
    }
  }
  handleSummaryKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (this.open) {
        this.hide();
      } else {
        this.show();
      }
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      this.hide();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      this.show();
    }
  }
  closeOthersWithSameName() {
    if (!this.name)
      return;
    const root = this.getRootNode();
    const otherDetails = root.querySelectorAll(`wa-details[name="${this.name}"]`);
    otherDetails.forEach((detail) => {
      if (detail !== this && detail.open) {
        detail.open = false;
      }
    });
  }
  async handleOpenChange() {
    this.animationGeneration++;
    const generation = this.animationGeneration;
    if (this.open) {
      this.details.open = true;
      const waShow = new WaShowEvent;
      this.dispatchEvent(waShow);
      if (waShow.defaultPrevented) {
        this.open = false;
        this.details.open = false;
        return;
      }
      this.closeOthersWithSameName();
      this.isAnimating = true;
      const duration = parseDuration(getComputedStyle(this.body).getPropertyValue("--show-duration"));
      await animate(this.body, [
        { height: "0", opacity: "0" },
        { height: `${this.body.scrollHeight}px`, opacity: "1" }
      ], {
        duration,
        easing: "linear"
      });
      if (this.animationGeneration !== generation) {
        return;
      }
      this.body.style.height = "auto";
      this.isAnimating = false;
      this.dispatchEvent(new WaAfterShowEvent);
    } else {
      const waHide = new WaHideEvent;
      this.dispatchEvent(waHide);
      if (waHide.defaultPrevented) {
        this.details.open = true;
        this.open = true;
        return;
      }
      this.isAnimating = true;
      const duration = parseDuration(getComputedStyle(this.body).getPropertyValue("--hide-duration"));
      await animate(this.body, [
        { height: `${this.body.scrollHeight}px`, opacity: "1" },
        { height: "0", opacity: "0" }
      ], { duration, easing: "linear" });
      if (this.animationGeneration !== generation) {
        return;
      }
      this.body.style.height = "0";
      this.isAnimating = false;
      this.details.open = false;
      this.dispatchEvent(new WaAfterHideEvent);
    }
  }
  async show() {
    if (this.open || this.disabled) {
      return;
    }
    this.open = true;
    return waitForEvent(this, "wa-after-show");
  }
  async hide() {
    if (!this.open || this.disabled) {
      return;
    }
    this.open = false;
    return waitForEvent(this, "wa-after-hide");
  }
  render() {
    const isRtl = !this.hasUpdated ? this.dir === "rtl" : this.localize.dir() === "rtl";
    return html`
      <details part="base details">
        <summary
          part="header"
          role="button"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls="content"
          aria-disabled=${this.disabled ? "true" : "false"}
          tabindex=${this.disabled ? "-1" : "0"}
          @click=${this.handleSummaryClick}
          @keydown=${this.handleSummaryKeyDown}
        >
          <slot name="summary" part="summary">${this.summary}</slot>

          <span part="icon">
            <slot name="expand-icon">
              <wa-icon library="system" variant="solid" name=${isRtl ? "chevron-left" : "chevron-right"}></wa-icon>
            </slot>
            <slot name="collapse-icon">
              <wa-icon library="system" variant="solid" name=${isRtl ? "chevron-left" : "chevron-right"}></wa-icon>
            </slot>
          </span>
        </summary>

        <div
          class=${classMap({
      body: true,
      animating: this.isAnimating
    })}
          role="region"
          aria-labelledby="header"
        >
          <slot part="content" id="content" class="content"></slot>
        </div>
      </details>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("details")
], WaDetails.prototype, "details", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("summary")
], WaDetails.prototype, "header", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".body")
], WaDetails.prototype, "body", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".expand-icon-slot")
], WaDetails.prototype, "expandIconSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaDetails.prototype, "isAnimating", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaDetails.prototype, "open", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaDetails.prototype, "summary", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDetails.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaDetails.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDetails.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "icon-placement", reflect: true })
], WaDetails.prototype, "iconPlacement", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("open", { waitUntilFirstUpdate: true })
], WaDetails.prototype, "handleOpenChange", null);
WaDetails = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-details")
], WaDetails);
