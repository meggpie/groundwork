import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { WaAfterHideEvent } from "../../events/after-hide.js";
import { WaAfterShowEvent } from "../../events/after-show.js";
import { WaHideEvent } from "../../events/hide.js";
import { WaShowEvent } from "../../events/show.js";
import { animateWithClass } from "../../internal/animate.js";
import { isTopDismissible, registerDismissible, unregisterDismissible } from "../../internal/dismissible-stack.js";
import { waitForEvent } from "../../internal/event.js";
import { uniqueId } from "../../internal/math.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import WaPopup from "../popup/popup.js";
import styles from "./popover.styles.js";
const openPopovers = new Set;
export default class WaPopover extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.anchor = null;
    this.placement = "top";
    this.open = false;
    this.distance = 8;
    this.skidding = 0;
    this.for = null;
    this.withoutArrow = false;
    this.eventController = new AbortController;
    this.pressStartedInside = false;
    this.handleAnchorClick = () => {
      this.open = !this.open;
    };
    this.handleBodyClick = (event) => {
      const target = event.target;
      const button = target.closest('[data-popover="close"]');
      if (button) {
        event.stopPropagation();
        this.open = false;
      }
    };
    this.handleDocumentKeyDown = (event) => {
      if (event.key === "Escape" && this.open && isTopDismissible(this)) {
        event.preventDefault();
        event.stopPropagation();
        this.open = false;
        if (this.anchor && typeof this.anchor.focus === "function") {
          this.anchor.focus({ preventScroll: true });
        }
      }
    };
    this.handleDocumentPointerDown = (event) => {
      this.pressStartedInside = event.composedPath().includes(this);
    };
    this.handleDocumentClick = (event) => {
      const pressStartedInside = this.pressStartedInside;
      this.pressStartedInside = false;
      if (pressStartedInside) {
        return;
      }
      if (this.anchor && event.composedPath().includes(this.anchor)) {
        return;
      }
      if (!event.composedPath().includes(this)) {
        this.open = false;
      }
    };
  }
  static css = styles;
  static dependencies = { "wa-popup": WaPopup };
  connectedCallback() {
    super.connectedCallback();
    if (!this.id) {
      this.id = uniqueId("wa-popover-");
    }
    if (this.eventController.signal.aborted) {
      this.eventController = new AbortController;
    }
    if (this.for && this.anchor) {
      this.anchor = null;
      this.handleForChange();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown, { capture: true });
    unregisterDismissible(this);
    this.eventController.abort();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.open) {
      this.dialog.show();
      this.popup.active = true;
      this.popup.reposition();
    }
  }
  updated(changedProperties) {
    if (changedProperties.has("open")) {
      this.customStates.set("open", this.open);
    }
  }
  async handleOpenChange() {
    if (this.open) {
      const waShowEvent = new WaShowEvent;
      this.dispatchEvent(waShowEvent);
      if (waShowEvent.defaultPrevented) {
        this.open = false;
        return;
      }
      openPopovers.forEach((popover) => popover.open = false);
      document.addEventListener("keydown", this.handleDocumentKeyDown, { signal: this.eventController.signal });
      document.addEventListener("pointerdown", this.handleDocumentPointerDown, {
        capture: true,
        signal: this.eventController.signal
      });
      document.addEventListener("click", this.handleDocumentClick, { signal: this.eventController.signal });
      this.dialog.setAttribute("open", "");
      this.popup.active = true;
      openPopovers.add(this);
      registerDismissible(this);
      requestAnimationFrame(() => {
        const elementToFocus = this.querySelector("[autofocus]");
        if (elementToFocus && typeof elementToFocus.focus === "function") {
          elementToFocus.focus({ preventScroll: true });
        } else {
          this.dialog.focus({ preventScroll: true });
        }
      });
      await animateWithClass(this.popup.popup, "show-with-scale");
      this.popup.reposition();
      this.dispatchEvent(new WaAfterShowEvent);
    } else {
      const waHideEvent = new WaHideEvent;
      this.dispatchEvent(waHideEvent);
      if (waHideEvent.defaultPrevented) {
        this.open = true;
        return;
      }
      document.removeEventListener("keydown", this.handleDocumentKeyDown);
      document.removeEventListener("pointerdown", this.handleDocumentPointerDown, { capture: true });
      document.removeEventListener("click", this.handleDocumentClick);
      this.pressStartedInside = false;
      openPopovers.delete(this);
      unregisterDismissible(this);
      await animateWithClass(this.popup.popup, "hide-with-scale");
      this.popup.active = false;
      this.dialog.close();
      this.dispatchEvent(new WaAfterHideEvent);
    }
  }
  handleForChange() {
    const rootNode = this.getRootNode();
    if (!rootNode) {
      return;
    }
    const newAnchor = this.for ? rootNode.getElementById(this.for) : null;
    const oldAnchor = this.anchor;
    if (newAnchor === oldAnchor) {
      return;
    }
    const { signal } = this.eventController;
    if (newAnchor) {
      newAnchor.addEventListener("click", this.handleAnchorClick, { signal });
    }
    if (oldAnchor) {
      oldAnchor.removeEventListener("click", this.handleAnchorClick);
    }
    this.anchor = newAnchor;
    if (this.for && !newAnchor) {
      console.warn(`A popover was assigned to an element with an ID of "${this.for}" but the element could not be found.`, this);
    }
  }
  async handleOptionsChange() {
    if (this.hasUpdated) {
      await this.updateComplete;
      this.popup.reposition();
    }
  }
  async show() {
    if (this.open) {
      return;
    }
    this.open = true;
    return waitForEvent(this, "wa-after-show");
  }
  async hide() {
    if (!this.open) {
      return;
    }
    this.open = false;
    return waitForEvent(this, "wa-after-hide");
  }
  render() {
    return html`
      <dialog part="dialog" class="dialog">
        <wa-popup
          part="popup"
          exportparts="
            popup:popup__popup,
            arrow:popup__arrow
          "
          class=${classMap({
      popover: true,
      "popover-open": this.open
    })}
          placement=${this.placement}
          distance=${this.distance}
          skidding=${this.skidding}
          flip
          shift
          shift-padding="8"
          ?arrow=${!this.withoutArrow}
          .anchor=${this.anchor}
        >
          <div part="body" class="body" @click=${this.handleBodyClick}>
            <slot></slot>
          </div>
        </wa-popup>
      </dialog>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("dialog")
], WaPopover.prototype, "dialog", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".body")
], WaPopover.prototype, "body", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("wa-popup")
], WaPopover.prototype, "popup", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaPopover.prototype, "anchor", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaPopover.prototype, "placement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaPopover.prototype, "open", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaPopover.prototype, "distance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaPopover.prototype, "skidding", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaPopover.prototype, "for", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-arrow", type: Boolean, reflect: true })
], WaPopover.prototype, "withoutArrow", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("open", { waitUntilFirstUpdate: true })
], WaPopover.prototype, "handleOpenChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("for")
], WaPopover.prototype, "handleForChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch(["distance", "placement", "skidding"])
], WaPopover.prototype, "handleOptionsChange", null);
WaPopover = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-popover")
], WaPopover);
