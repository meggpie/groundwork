import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { WaIntersectEvent } from "../../events/intersect.js";
import { clamp } from "../../internal/math.js";
import { parseSpaceDelimitedTokens } from "../../internal/parse.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./intersection-observer.styles.js";
export default class WaIntersectionObserver extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.intersectionObserver = null;
    this.observedElements = new Map;
    this.root = null;
    this.rootMargin = "0px";
    this.threshold = "0";
    this.intersectClass = "";
    this.once = false;
    this.disabled = false;
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    if (!this.disabled) {
      this.updateComplete.then(() => {
        this.startObserver();
      });
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopObserver();
  }
  handleSlotChange() {
    if (!this.disabled) {
      this.startObserver();
    }
  }
  parseThreshold() {
    const tokens = parseSpaceDelimitedTokens(this.threshold);
    return tokens.map((token) => {
      const num = parseFloat(token);
      return isNaN(num) ? 0 : clamp(num, 0, 1);
    });
  }
  resolveRoot() {
    if (!this.root)
      return null;
    try {
      const doc = this.getRootNode();
      const target = doc.getElementById(this.root);
      if (!target) {
        console.warn(`Root element with ID "${this.root}" could not be found.`, this);
      }
      return target;
    } catch {
      console.warn(`Invalid selector for root: "${this.root}"`, this);
      return null;
    }
  }
  startObserver() {
    this.stopObserver();
    if (this.disabled)
      return;
    const threshold = this.parseThreshold();
    const rootElement = this.resolveRoot();
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const wasIntersecting = this.observedElements.get(entry.target) ?? false;
        const isIntersecting = entry.isIntersecting;
        this.observedElements.set(entry.target, isIntersecting);
        if (this.intersectClass) {
          if (isIntersecting) {
            entry.target.classList.add(this.intersectClass);
          } else {
            entry.target.classList.remove(this.intersectClass);
          }
        }
        const changeEvent = new WaIntersectEvent({ entry });
        this.dispatchEvent(changeEvent);
        if (isIntersecting && !wasIntersecting) {
          if (this.once) {
            this.intersectionObserver?.unobserve(entry.target);
            this.observedElements.delete(entry.target);
          }
        }
      });
    }, {
      root: rootElement,
      rootMargin: this.rootMargin,
      threshold
    });
    const slot = this.shadowRoot.querySelector("slot");
    if (slot !== null) {
      const elements = slot.assignedElements({ flatten: true });
      elements.forEach((element) => {
        this.intersectionObserver?.observe(element);
        this.observedElements.set(element, false);
      });
    }
  }
  stopObserver() {
    if (this.intersectClass) {
      this.observedElements.forEach((_, element) => {
        element.classList.remove(this.intersectClass);
      });
    }
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.observedElements.clear();
  }
  handleDisabledChange() {
    if (this.disabled) {
      this.stopObserver();
    } else {
      this.startObserver();
    }
  }
  handleOptionsChange() {
    this.startObserver();
  }
  render() {
    return html` <slot @slotchange=${this.handleSlotChange}></slot> `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property()
], WaIntersectionObserver.prototype, "root", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "root-margin" })
], WaIntersectionObserver.prototype, "rootMargin", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaIntersectionObserver.prototype, "threshold", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "intersect-class" })
], WaIntersectionObserver.prototype, "intersectClass", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaIntersectionObserver.prototype, "once", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaIntersectionObserver.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaIntersectionObserver.prototype, "handleDisabledChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("root", { waitUntilFirstUpdate: true }),
  watch("rootMargin", { waitUntilFirstUpdate: true }),
  watch("threshold", { waitUntilFirstUpdate: true })
], WaIntersectionObserver.prototype, "handleOptionsChange", null);
WaIntersectionObserver = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-intersection-observer")
], WaIntersectionObserver);
