import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { WaRepositionEvent } from "../../events/reposition.js";
import { drag } from "../../internal/drag.js";
import { clamp } from "../../internal/math.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import styles from "./split-panel.styles.js";
export default class WaSplitPanel extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.isCollapsed = false;
    this.localize = new LocalizeController(this);
    this.positionBeforeCollapsing = 0;
    this.position = 50;
    this.orientation = "horizontal";
    this.disabled = false;
    this.snapThreshold = 12;
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.resizeObserver = new ResizeObserver((entries) => this.handleResize(entries));
      this.updateComplete.then(() => this.resizeObserver.observe(this));
      this.detectSize();
      this.cachedPositionInPixels = this.percentageToPixels(this.position);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.unobserve(this);
  }
  detectSize() {
    const { width, height } = this.getBoundingClientRect();
    this.size = this.orientation === "vertical" ? height : width;
  }
  percentageToPixels(value) {
    return this.size * (value / 100);
  }
  pixelsToPercentage(value) {
    return value / this.size * 100;
  }
  handleDrag(event) {
    const isRtl = this.didSSR && !this.hasUpdated ? this.dir === "rtl" : this.localize.dir() === "rtl";
    if (this.disabled) {
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    drag(this, {
      onMove: (x, y) => {
        let newPositionInPixels = this.orientation === "vertical" ? y : x;
        if (this.primary === "end") {
          newPositionInPixels = this.size - newPositionInPixels;
        }
        if (this.snap) {
          const snaps = this.snap.split(" ");
          snaps.forEach((value) => {
            let snapPoint;
            if (value.endsWith("%")) {
              snapPoint = this.size * (parseFloat(value) / 100);
            } else {
              snapPoint = parseFloat(value);
            }
            if (isRtl && this.orientation === "horizontal") {
              snapPoint = this.size - snapPoint;
            }
            if (newPositionInPixels >= snapPoint - this.snapThreshold && newPositionInPixels <= snapPoint + this.snapThreshold) {
              newPositionInPixels = snapPoint;
            }
          });
        }
        this.position = clamp(this.pixelsToPercentage(newPositionInPixels), 0, 100);
      },
      initialEvent: event
    });
  }
  handleKeyDown(event) {
    if (this.disabled) {
      return;
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Enter"].includes(event.key)) {
      let newPosition = this.position;
      const incr = (event.shiftKey ? 10 : 1) * (this.primary === "end" ? -1 : 1);
      event.preventDefault();
      if (event.key === "ArrowLeft" && this.orientation === "horizontal" || event.key === "ArrowUp" && this.orientation === "vertical") {
        newPosition -= incr;
      }
      if (event.key === "ArrowRight" && this.orientation === "horizontal" || event.key === "ArrowDown" && this.orientation === "vertical") {
        newPosition += incr;
      }
      if (event.key === "Home") {
        newPosition = this.primary === "end" ? 100 : 0;
      }
      if (event.key === "End") {
        newPosition = this.primary === "end" ? 0 : 100;
      }
      if (event.key === "Enter") {
        if (this.isCollapsed) {
          newPosition = this.positionBeforeCollapsing;
          this.isCollapsed = false;
        } else {
          const positionBeforeCollapsing = this.position;
          newPosition = 0;
          requestAnimationFrame(() => {
            this.isCollapsed = true;
            this.positionBeforeCollapsing = positionBeforeCollapsing;
          });
        }
      }
      this.position = clamp(newPosition, 0, 100);
    }
  }
  handleResize(entries) {
    const { width, height } = entries[0].contentRect;
    this.size = this.orientation === "vertical" ? height : width;
    if (isNaN(this.cachedPositionInPixels) || this.position === 1 / 0) {
      this.cachedPositionInPixels = Number(this.getAttribute("position-in-pixels"));
      this.positionInPixels = Number(this.getAttribute("position-in-pixels"));
      this.position = this.pixelsToPercentage(this.positionInPixels);
    }
    if (this.primary) {
      const newPosition = this.pixelsToPercentage(this.cachedPositionInPixels);
      if (this.position !== newPosition) {
        this.position = newPosition;
      }
    }
  }
  handlePositionChange() {
    this.cachedPositionInPixels = this.percentageToPixels(this.position);
    const newPositionInPixels = this.percentageToPixels(this.position);
    if (this.positionInPixels !== newPositionInPixels) {
      this.positionInPixels = newPositionInPixels;
    }
    this.isCollapsed = false;
    this.positionBeforeCollapsing = 0;
    this.dispatchEvent(new WaRepositionEvent);
  }
  handlePositionInPixelsChange() {
    const newPosition = this.pixelsToPercentage(this.positionInPixels);
    if (this.position !== newPosition) {
      this.position = newPosition;
    }
  }
  handleVerticalChange() {
    this.detectSize();
  }
  updateStyles() {
    const gridTemplate = this.orientation === "vertical" ? "gridTemplateRows" : "gridTemplateColumns";
    const gridTemplateAlt = this.orientation === "vertical" ? "gridTemplateColumns" : "gridTemplateRows";
    const isRtl = this.hasUpdated ? this.localize.dir() === "rtl" : this.dir === "rtl";
    const primary = `
      clamp(
        0%,
        clamp(
          var(--min),
          ${this.position}% - var(--divider-width) / 2,
          var(--max)
        ),
        calc(100% - var(--divider-width))
      )
    `;
    const secondary = "auto";
    if (this.primary === "end") {
      if (isRtl && this.orientation === "horizontal") {
        this.setStyle(gridTemplate, `${primary} var(--divider-width) ${secondary}`);
      } else {
        this.setStyle(gridTemplate, `${secondary} var(--divider-width) ${primary}`);
      }
    } else {
      if (isRtl && this.orientation === "horizontal") {
        this.setStyle(gridTemplate, `${secondary} var(--divider-width) ${primary}`);
      } else {
        this.setStyle(gridTemplate, `${primary} var(--divider-width) ${secondary}`);
      }
    }
    this.setStyle(gridTemplateAlt, "unset");
  }
  willUpdate(changedProperties) {
    if (!this.style) {
      this.updateStyles();
    }
    super.willUpdate(changedProperties);
  }
  updated(changedProperties) {
    super.updated(changedProperties);
  }
  render() {
    if (this.style) {
      this.updateStyles();
    }
    return html`
      <slot name="start" part="panel start" class="start"></slot>

      <div
        part="divider"
        class="divider"
        tabindex=${ifDefined(this.disabled ? undefined : "0")}
        role="separator"
        aria-valuenow=${this.position}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label=${this.localize.term("resize")}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleDrag}
        @touchstart=${this.handleDrag}
      >
        <slot name="divider"></slot>
      </div>

      <slot name="end" part="panel end" class="end"></slot>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".divider")
], WaSplitPanel.prototype, "divider", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaSplitPanel.prototype, "position", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "position-in-pixels", type: Number })
], WaSplitPanel.prototype, "positionInPixels", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaSplitPanel.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaSplitPanel.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaSplitPanel.prototype, "primary", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaSplitPanel.prototype, "snap", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, attribute: "snap-threshold" })
], WaSplitPanel.prototype, "snapThreshold", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("position")
], WaSplitPanel.prototype, "handlePositionChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("positionInPixels")
], WaSplitPanel.prototype, "handlePositionInPixelsChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("vertical")
], WaSplitPanel.prototype, "handleVerticalChange", null);
WaSplitPanel = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-split-panel")
], WaSplitPanel);
