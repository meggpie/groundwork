import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { WaAfterHideEvent } from "../../events/after-hide.js";
import { WaAfterShowEvent } from "../../events/after-show.js";
import { WaHideEvent } from "../../events/hide.js";
import { WaShowEvent } from "../../events/show.js";
import { animateWithClass } from "../../internal/animate.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import sizeStyles from "../../styles/component/size.styles.js";
import variantStyles from "../../styles/component/variants.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import"../progress-ring/progress-ring.js";
import styles from "./toast-item.styles.js";
export default class WaToastItem extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "icon");
    this.localize = new LocalizeController(this);
    this.animationFrame = null;
    this.startTime = null;
    this.isHovering = false;
    this.isFocused = false;
    this.timeLeft = 100;
    this.variant = "neutral";
    this.size = "m";
    this.duration = 5000;
    this.withIcon = false;
    this.tick = () => {
      if (!this.startTime) {
        return;
      }
      const elapsed = performance.now() - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      this.timeLeft = 100 * (1 - progress);
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(this.tick);
      } else {
        this.hide();
      }
    };
    this.handlePointerEnter = (event) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        this.isHovering = true;
        this.pauseTimer();
      }
    };
    this.handlePointerLeave = () => {
      if (this.isHovering) {
        this.isHovering = false;
        this.resumeTimer();
      }
    };
    this.handleFocusIn = () => {
      this.isFocused = true;
      this.pauseTimer();
    };
    this.handleFocusOut = () => {
      this.isFocused = false;
      this.resumeTimer();
    };
  }
  static css = [styles, variantStyles, sizeStyles];
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerenter", this.handlePointerEnter);
    this.addEventListener("pointerleave", this.handlePointerLeave);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTimer();
    this.removeEventListener("pointerenter", this.handlePointerEnter);
    this.removeEventListener("pointerleave", this.handlePointerLeave);
  }
  async startTimer() {
    const showEvent = new WaShowEvent;
    this.dispatchEvent(showEvent);
    if (showEvent.defaultPrevented) {
      return;
    }
    await this.updateComplete;
    await animateWithClass(this.toastItemElement, "show");
    this.dispatchEvent(new WaAfterShowEvent);
    if (this.duration > 0 && Number.isFinite(this.duration)) {
      this.startTime = performance.now();
      this.timeLeft = 100;
      this.tick();
    }
  }
  stopTimer() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  async hide() {
    this.stopTimer();
    const hideEvent = new WaHideEvent;
    this.dispatchEvent(hideEvent);
    if (hideEvent.defaultPrevented) {
      return;
    }
    await animateWithClass(this.toastItemElement, "hide");
    this.dispatchEvent(new WaAfterHideEvent);
    this.remove();
  }
  handleCloseClick() {
    this.hide();
  }
  pauseTimer() {
    this.stopTimer();
    this.timeLeft = 100;
  }
  resumeTimer() {
    if (!this.isHovering && !this.isFocused && this.duration > 0) {
      this.startTime = performance.now();
      this.tick();
    }
  }
  render() {
    const hasIcon = this.hasUpdated ? this.hasSlotController.test("icon") : this.withIcon;
    const hasDuration = this.duration > 0;
    return html`
      <div
        part="toast-item"
        class=${classMap({
      "toast-item": true,
      "toast-item--has-icon": hasIcon,
      "toast-item--has-duration": hasDuration
    })}
      >
        <div part="accent" class="accent"></div>

        <div part="icon" class="icon">
          <slot name="icon"></slot>
        </div>

        <div part="content" class="content">
          <slot></slot>
        </div>

        <button
          part="close-button"
          class="close-button"
          type="button"
          aria-label=${this.localize.term("close")}
          @click=${this.handleCloseClick}
          @focusin=${this.handleFocusIn}
          @focusout=${this.handleFocusOut}
        >
          <wa-progress-ring
            part="progress-ring"
            exportparts="
              base:progress-ring__base,
              label:progress-ring__label,
              track:progress-ring__track,
              indicator:progress-ring__indicator
            "
            value=${this.timeLeft}
            aria-hidden="true"
          >
            <wa-icon
              part="close-icon"
              exportparts="svg:close-icon__svg"
              name="xmark"
              library="system"
              variant="solid"
            ></wa-icon>
          </wa-progress-ring>
        </button>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".toast-item")
], WaToastItem.prototype, "toastItemElement", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaToastItem.prototype, "timeLeft", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaToastItem.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaToastItem.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaToastItem.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaToastItem.prototype, "duration", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-icon", type: Boolean })
], WaToastItem.prototype, "withIcon", undefined);
WaToastItem = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-toast-item")
], WaToastItem);
