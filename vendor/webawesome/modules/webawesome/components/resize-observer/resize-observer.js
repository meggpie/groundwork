import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { WaResizeEvent } from "../../events/resize.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./resize-observer.styles.js";
export default class WaResizeObserver extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.observedElements = [];
    this.disabled = false;
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.resizeObserver = new ResizeObserver((entries) => {
        this.dispatchEvent(new WaResizeEvent({ entries }));
      });
      if (!this.disabled) {
        this.updateComplete.then(() => {
          this.startObserver();
        });
      }
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
  startObserver() {
    const slot = this.shadowRoot.querySelector("slot");
    if (slot !== null) {
      const elements = slot.assignedElements({ flatten: true });
      this.observedElements.forEach((el) => this.resizeObserver.unobserve(el));
      this.observedElements = [];
      elements.forEach((el) => {
        this.resizeObserver.observe(el);
        this.observedElements.push(el);
      });
    }
  }
  stopObserver() {
    this.resizeObserver.disconnect();
  }
  handleDisabledChange() {
    if (this.disabled) {
      this.stopObserver();
    } else {
      this.startObserver();
    }
  }
  render() {
    return html` <slot @slotchange=${this.handleSlotChange}></slot> `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaResizeObserver.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaResizeObserver.prototype, "handleDisabledChange", null);
WaResizeObserver = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-resize-observer")
], WaResizeObserver);
