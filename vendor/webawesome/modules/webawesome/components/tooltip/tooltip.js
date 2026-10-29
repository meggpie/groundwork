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
import styles from "./tooltip.styles.js";
function containsComposedNode(ancestor, node) {
  while (node) {
    if (node === ancestor) {
      return true;
    }
    if (node instanceof Element && node.assignedSlot) {
      node = node.assignedSlot;
    } else if (node.parentNode) {
      node = node.parentNode;
    } else if (node instanceof ShadowRoot) {
      node = node.host;
    } else {
      node = null;
    }
  }
  return false;
}
export default class WaTooltip extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.dismissedByPress = false;
    this.placement = "top";
    this.disabled = false;
    this.distance = 8;
    this.open = false;
    this.skidding = 0;
    this.showDelay = 150;
    this.hideDelay = 0;
    this.trigger = "hover focus";
    this.withoutArrow = false;
    this.for = null;
    this.anchor = null;
    this.eventController = new AbortController;
    this.handleBlur = () => {
      this.dismissedByPress = false;
      if (this.hasTrigger("focus")) {
        this.hide();
      }
    };
    this.handleClick = (event) => {
      if (this.hasTrigger("click")) {
        if (this.open) {
          this.hide();
        } else {
          this.show();
        }
        return;
      }
      if (this.hasTrigger("manual")) {
        return;
      }
      if (event.detail === 0) {
        this.lightDismiss();
      }
    };
    this.handleFocus = () => {
      if (this.dismissedByPress) {
        return;
      }
      if (this.hasTrigger("focus")) {
        this.show();
      }
    };
    this.handlePointerDown = (event) => {
      if (event.pointerType === "touch" || this.hasTrigger("click") || this.hasTrigger("manual")) {
        return;
      }
      this.lightDismiss();
    };
    this.handleDocumentKeyDown = (event) => {
      if (this.hasTrigger("manual")) {
        return;
      }
      if (event.key === "Escape" && this.open && isTopDismissible(this)) {
        event.preventDefault();
        event.stopPropagation();
        this.hide();
      }
    };
    this.handleDocumentClick = (event) => {
      if (this.hasTrigger("manual")) {
        return;
      }
      if (this.anchor && event.composedPath().includes(this.anchor)) {
        return;
      }
      this.hide();
    };
    this.handleMouseOver = () => {
      if (this.dismissedByPress) {
        return;
      }
      if (this.hasTrigger("hover")) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = window.setTimeout(() => this.show(), this.showDelay);
      }
    };
    this.handleMouseOut = (event) => {
      const relatedTarget = event.relatedTarget;
      const movedIntoAnchor = Boolean(relatedTarget && this.anchor && containsComposedNode(this.anchor, relatedTarget));
      const movedIntoTooltip = Boolean(relatedTarget && containsComposedNode(this, relatedTarget));
      if (movedIntoAnchor || movedIntoTooltip) {
        return;
      }
      this.dismissedByPress = false;
      if (this.hasTrigger("hover")) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = window.setTimeout(() => {
          this.hide();
        }, this.hideDelay);
      }
    };
  }
  static css = styles;
  static dependencies = { "wa-popup": WaPopup };
  connectedCallback() {
    super.connectedCallback();
    const isClient = typeof document !== "undefined";
    if (isClient) {
      if (this.eventController.signal.aborted) {
        this.eventController = new AbortController;
      }
      this.addEventListener("mouseout", this.handleMouseOut);
      this.dismissedByPress = false;
      if (this.open) {
        this.open = false;
        this.updateComplete.then(() => {
          if (this.disabled) {
            return;
          }
          this.open = true;
        });
      }
      if (!this.id) {
        this.id = uniqueId("wa-tooltip-");
      }
      if (this.for && this.anchor) {
        this.anchor = null;
        this.handleForChange();
      } else if (this.for) {
        this.handleForChange();
      }
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("click", this.handleDocumentClick);
    unregisterDismissible(this);
    this.eventController.abort(null);
    if (this.anchor) {
      this.removeFromAriaLabelledBy(this.anchor, this.id);
    }
  }
  firstUpdated(changedProperties) {
    this.body.hidden = !this.open;
    if (this.open) {
      this.popup.active = true;
      this.popup.reposition();
    }
    super.firstUpdated(changedProperties);
  }
  lightDismiss() {
    clearTimeout(this.hoverTimeout);
    this.dismissedByPress = true;
    this.hide();
  }
  hasTrigger(triggerType) {
    const triggers = this.trigger.split(" ");
    return triggers.includes(triggerType);
  }
  addToAriaLabelledBy(element, id) {
    const currentLabel = element.getAttribute("aria-labelledby") || "";
    const labels = currentLabel.split(/\s+/).filter(Boolean);
    if (!labels.includes(id)) {
      labels.push(id);
      element.setAttribute("aria-labelledby", labels.join(" "));
    }
  }
  removeFromAriaLabelledBy(element, id) {
    const currentLabel = element.getAttribute("aria-labelledby") || "";
    const labels = currentLabel.split(/\s+/).filter(Boolean);
    const filteredLabels = labels.filter((label) => label !== id);
    if (filteredLabels.length > 0) {
      element.setAttribute("aria-labelledby", filteredLabels.join(" "));
    } else {
      element.removeAttribute("aria-labelledby");
    }
  }
  async handleOpenChange() {
    if (this.open) {
      if (this.disabled) {
        this.open = false;
        return;
      }
      const waShowEvent = new WaShowEvent;
      this.dispatchEvent(waShowEvent);
      if (waShowEvent.defaultPrevented) {
        this.open = false;
        return;
      }
      if (!this.hasTrigger("manual")) {
        document.addEventListener("keydown", this.handleDocumentKeyDown, { signal: this.eventController.signal });
        document.addEventListener("click", this.handleDocumentClick, { signal: this.eventController.signal });
        registerDismissible(this);
      }
      this.body.hidden = false;
      this.popup.active = true;
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
      document.removeEventListener("click", this.handleDocumentClick);
      unregisterDismissible(this);
      await animateWithClass(this.popup.popup, "hide-with-scale");
      this.popup.active = false;
      this.body.hidden = true;
      this.dispatchEvent(new WaAfterHideEvent);
    }
  }
  handleForChange() {
    const rootNode = this.getRootNode?.();
    if (!rootNode) {
      return;
    }
    const newAnchor = this.for ? rootNode.getElementById?.(this.for) : null;
    const oldAnchor = this.anchor;
    if (newAnchor === oldAnchor) {
      return;
    }
    this.dismissedByPress = false;
    const { signal } = this.eventController;
    if (newAnchor) {
      this.addToAriaLabelledBy(newAnchor, this.id);
      newAnchor.addEventListener("blur", this.handleBlur, { capture: true, signal });
      newAnchor.addEventListener("focus", this.handleFocus, { capture: true, signal });
      newAnchor.addEventListener("click", this.handleClick, { signal });
      newAnchor.addEventListener("pointerdown", this.handlePointerDown, { signal });
      newAnchor.addEventListener("mouseover", this.handleMouseOver, { signal });
      newAnchor.addEventListener("mouseout", this.handleMouseOut, { signal });
    }
    if (oldAnchor) {
      this.removeFromAriaLabelledBy(oldAnchor, this.id);
      oldAnchor.removeEventListener("blur", this.handleBlur, { capture: true });
      oldAnchor.removeEventListener("focus", this.handleFocus, { capture: true });
      oldAnchor.removeEventListener("click", this.handleClick);
      oldAnchor.removeEventListener("pointerdown", this.handlePointerDown);
      oldAnchor.removeEventListener("mouseover", this.handleMouseOver);
      oldAnchor.removeEventListener("mouseout", this.handleMouseOut);
    }
    this.anchor = newAnchor;
  }
  async handleOptionsChange() {
    if (this.hasUpdated) {
      await this.updateComplete;
      this.popup.reposition();
    }
  }
  handleDisabledChange() {
    if (this.disabled && this.open) {
      this.hide();
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
    if (!this.open) {
      return;
    }
    this.open = false;
    return waitForEvent(this, "wa-after-hide");
  }
  render() {
    return html`
      <wa-popup
        part="base tooltip"
        exportparts="
          popup:base__popup,
          arrow:base__arrow
        "
        class=${classMap({
      tooltip: true,
      "tooltip-open": this.open
    })}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        flip
        shift
        ?arrow=${!this.withoutArrow}
        hover-bridge
        .anchor=${this.anchor}
      >
        <div part="body" class="body">
          <slot></slot>
        </div>
      </wa-popup>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaTooltip.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".body")
], WaTooltip.prototype, "body", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("wa-popup")
], WaTooltip.prototype, "popup", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTooltip.prototype, "placement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTooltip.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaTooltip.prototype, "distance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTooltip.prototype, "open", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaTooltip.prototype, "skidding", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "show-delay", type: Number })
], WaTooltip.prototype, "showDelay", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hide-delay", type: Number })
], WaTooltip.prototype, "hideDelay", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTooltip.prototype, "trigger", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-arrow", type: Boolean, reflect: true })
], WaTooltip.prototype, "withoutArrow", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTooltip.prototype, "for", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTooltip.prototype, "anchor", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("open", { waitUntilFirstUpdate: true })
], WaTooltip.prototype, "handleOpenChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("for")
], WaTooltip.prototype, "handleForChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch(["distance", "placement", "skidding"])
], WaTooltip.prototype, "handleOptionsChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled")
], WaTooltip.prototype, "handleDisabledChange", null);
WaTooltip = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-tooltip")
], WaTooltip);
