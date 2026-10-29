import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, eventOptions, property, query, state } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import styles from "./scroller.styles.js";
export default class WaScroller extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.resizeObserver = null;
    this.canScroll = false;
    this.orientation = "horizontal";
    this.withoutScrollbar = false;
    this.withoutShadow = false;
  }
  static css = [styles];
  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.resizeObserver = new ResizeObserver(() => this.updateScroll());
      this.resizeObserver.observe(this);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }
  handleKeyDown(event) {
    if (event.key === "Home") {
      event.preventDefault();
      this.content.scrollTo({
        left: this.orientation === "horizontal" ? 0 : undefined,
        top: this.orientation === "vertical" ? 0 : undefined
      });
    }
    if (event.key === "End") {
      event.preventDefault();
      this.content.scrollTo({
        left: this.orientation === "horizontal" ? this.content.scrollWidth : undefined,
        top: this.orientation === "vertical" ? this.content.scrollHeight : undefined
      });
    }
  }
  handleSlotChange() {
    this.updateScroll();
  }
  updateScroll() {
    if (this.orientation === "horizontal") {
      const clientWidth = Math.ceil(this.content.clientWidth);
      const scrollLeft = Math.abs(Math.ceil(this.content.scrollLeft));
      const scrollWidth = Math.ceil(this.content.scrollWidth);
      const maxScroll = scrollWidth - clientWidth;
      this.canScroll = maxScroll > 0;
      const startShadowOpacity = Math.min(1, scrollLeft / (maxScroll * 0.05));
      const endShadowOpacity = Math.min(1, (maxScroll - scrollLeft) / (maxScroll * 0.05));
      this.style.setProperty("--start-shadow-opacity", String(startShadowOpacity || 0));
      this.style.setProperty("--end-shadow-opacity", String(endShadowOpacity || 0));
    } else {
      const clientHeight = Math.ceil(this.content.clientHeight);
      const scrollTop = Math.abs(Math.ceil(this.content.scrollTop));
      const scrollHeight = Math.ceil(this.content.scrollHeight);
      const maxScroll = scrollHeight - clientHeight;
      this.canScroll = maxScroll > 0;
      const startShadowOpacity = Math.min(1, scrollTop / (maxScroll * 0.05));
      const endShadowOpacity = Math.min(1, (maxScroll - scrollTop) / (maxScroll * 0.05));
      this.style.setProperty("--start-shadow-opacity", String(startShadowOpacity || 0));
      this.style.setProperty("--end-shadow-opacity", String(endShadowOpacity || 0));
    }
  }
  render() {
    return html`
      ${this.withoutShadow ? "" : html`
            <div id="start-shadow" part="start-shadow" aria-hidden="true"></div>
            <div id="end-shadow" part="end-shadow" aria-hidden="true"></div>
          `}

      <div
        id="content"
        part="content"
        role="region"
        aria-label=${this.localize.term("scrollableRegion")}
        tabindex=${this.canScroll ? "0" : "-1"}
        @keydown=${this.handleKeyDown}
        @scroll=${this.updateScroll}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("#content")
], WaScroller.prototype, "content", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaScroller.prototype, "canScroll", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaScroller.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-scrollbar", type: Boolean, reflect: true })
], WaScroller.prototype, "withoutScrollbar", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-shadow", type: Boolean, reflect: true })
], WaScroller.prototype, "withoutShadow", undefined);
__legacyDecorateClassTS_3r173x8m([
  eventOptions({ passive: true })
], WaScroller.prototype, "updateScroll", null);
WaScroller = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-scroller")
], WaScroller);
