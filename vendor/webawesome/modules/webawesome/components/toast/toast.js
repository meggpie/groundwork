import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { animate, prefersReducedMotion } from "../../internal/animate.js";
import { uniqueId } from "../../internal/math.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import"../toast-item/toast-item.js";
import styles from "./toast.styles.js";
let sharedLiveRegionContainer = null;
let sharedLiveRegionRefCount = 0;
function mountSharedLiveRegions() {
  sharedLiveRegionRefCount += 1;
  if (sharedLiveRegionContainer || typeof document === "undefined")
    return;
  const container = document.createElement("div");
  container.id = uniqueId("wa-toast-live-region-");
  container.setAttribute("data-wa-toast-live-region", "");
  container.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
    pointer-events: none;
    top: 0;
    left: 0;
  `;
  document.body.append(container);
  sharedLiveRegionContainer = container;
}
function unmountSharedLiveRegions() {
  sharedLiveRegionRefCount = Math.max(0, sharedLiveRegionRefCount - 1);
  if (sharedLiveRegionRefCount > 0)
    return;
  sharedLiveRegionContainer?.remove();
  sharedLiveRegionContainer = null;
}
function announceViaSharedLiveRegion(text, variant) {
  if (typeof document === "undefined")
    return;
  const container = sharedLiveRegionContainer;
  if (!container)
    return;
  const trimmed = text.trim();
  if (!trimmed)
    return;
  const announcer = document.createElement("div");
  announcer.setAttribute("role", variant === "danger" ? "alert" : "status");
  announcer.setAttribute("aria-live", variant === "danger" ? "assertive" : "polite");
  announcer.setAttribute("aria-atomic", "true");
  container.append(announcer);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      announcer.textContent = trimmed;
    });
  });
  setTimeout(() => announcer.remove(), 1000);
}
export default class WaToast extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.activatedToastItems = new WeakSet;
    this.positionCache = new Map;
    this.placement = "top-end";
    this.handleDocumentKeyDown = async (event) => {
      await new Promise((resolve) => setTimeout(resolve));
      if (event.key === "Escape" && !event.defaultPrevented) {
        const toastItems = this.getToastItems();
        if (toastItems.length > 0) {
          event.preventDefault();
          const mostRecent = toastItems[toastItems.length - 1];
          mostRecent?.hide();
        }
      }
    };
    this.handleAfterHide = async (event) => {
      const toastItem = event.target;
      if (toastItem.parentElement === this) {
        this.capturePositions();
        toastItem.remove();
        await this.animatePositions();
      }
      if (this.getToastItems().length === 0) {
        this.hideStack();
      }
    };
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.popover = "manual";
      mountSharedLiveRegions();
      document.addEventListener("keydown", this.handleDocumentKeyDown);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener?.("keydown", this.handleDocumentKeyDown);
    unmountSharedLiveRegions();
  }
  handleSlotChange() {
    const toastItems = this.getToastItems();
    const newItems = [];
    toastItems.forEach((toastItem) => {
      if (!this.activatedToastItems.has(toastItem)) {
        newItems.push(toastItem);
      }
    });
    if (newItems.length > 0) {
      this.capturePositions();
      newItems.forEach((toastItem) => {
        this.activatedToastItems.add(toastItem);
        this.showStack();
        toastItem.startTimer();
        this.announceToastItem(toastItem);
      });
      requestAnimationFrame(() => this.animatePositions());
    }
  }
  announceToastItem(toastItem) {
    announceViaSharedLiveRegion(toastItem.textContent ?? "", toastItem.variant);
  }
  getToastItems() {
    return [...this.querySelectorAll(":scope > wa-toast-item")];
  }
  capturePositions() {
    this.positionCache.clear();
    for (const item of this.getToastItems()) {
      this.positionCache.set(item, item.getBoundingClientRect());
    }
  }
  async animatePositions() {
    if (prefersReducedMotion()) {
      this.positionCache.clear();
      return;
    }
    const animations = [];
    for (const item of this.getToastItems()) {
      const oldRect = this.positionCache.get(item);
      if (!oldRect)
        continue;
      const newRect = item.getBoundingClientRect();
      const deltaY = oldRect.top - newRect.top;
      if (Math.abs(deltaY) > 1) {
        const animation = animate(item, [{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }], {
          duration: 200,
          easing: "cubic-bezier(0.2, 0, 0, 1)"
        });
        animations.push(animation);
      }
    }
    this.positionCache.clear();
    await Promise.all(animations);
  }
  showStack() {
    if (!this.matches(":popover-open")) {
      this.showPopover();
      this.customStates.set("visible", true);
    }
  }
  hideStack() {
    if (this.matches(":popover-open")) {
      this.hidePopover();
      this.customStates.set("visible", false);
    }
  }
  async create(message, options) {
    const opts = {
      allowHtml: false,
      duration: 5000,
      variant: "neutral",
      size: "m",
      ...options
    };
    const toastItem = document.createElement("wa-toast-item");
    toastItem.variant = opts.variant;
    toastItem.size = opts.size;
    toastItem.duration = opts.duration;
    if (opts.allowHtml) {
      toastItem.innerHTML = message;
    } else {
      toastItem.textContent = message;
    }
    if (opts.icon) {
      const icon = document.createElement("wa-icon");
      icon.setAttribute("slot", "icon");
      if (typeof opts.icon === "string") {
        icon.setAttribute("name", opts.icon);
      } else {
        icon.setAttribute("name", opts.icon.name);
        if (opts.icon.library) {
          icon.setAttribute("library", opts.icon.library);
        }
        if (opts.icon.family) {
          icon.setAttribute("family", opts.icon.family);
        }
        if (opts.icon.variant) {
          icon.setAttribute("variant", opts.icon.variant);
        }
      }
      toastItem.prepend(icon);
    }
    this.activatedToastItems.add(toastItem);
    this.capturePositions();
    this.showStack();
    this.prepend(toastItem);
    await toastItem.updateComplete;
    this.animatePositions();
    toastItem.startTimer();
    this.announceToastItem(toastItem);
    return toastItem;
  }
  render() {
    return html`
      <div part="stack" class="stack" @wa-after-hide=${this.handleAfterHide}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".stack")
], WaToast.prototype, "stack", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaToast.prototype, "placement", undefined);
WaToast = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-toast")
], WaToast);
