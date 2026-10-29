import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { ColorSchemeController } from "../../internal/color-scheme-controller.js";
import { parseSpaceDelimitedTokens } from "../../internal/parse.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import styles from "./zoomable-frame.styles.js";
export default class WaZoomableFrame extends WebAwesomeElement {
  static css = styles;
  constructor() {
    super();
    this.localize = new LocalizeController(this);
    this.themeObserver = !isServer ? new MutationObserver(() => this.syncTheme()) : null;
    this.availableZoomLevels = [];
    this.allowfullscreen = false;
    this.loading = "eager";
    this.label = "";
    this.zoom = 1;
    this.zoomLevels = "25% 50% 75% 100% 125% 150% 175% 200%";
    this.withoutControls = false;
    this.withoutInteraction = false;
    this.withThemeSync = false;
    new ColorSchemeController(this, () => this.syncTheme());
  }
  get contentWindow() {
    return this.iframe?.contentWindow || null;
  }
  get contentDocument() {
    return this.iframe?.contentDocument || null;
  }
  parseZoomLevels(zoomLevelsString) {
    const tokens = parseSpaceDelimitedTokens(zoomLevelsString);
    const levels = [];
    for (const token of tokens) {
      let value;
      if (token.endsWith("%")) {
        const percentage = parseFloat(token.slice(0, -1));
        if (!isNaN(percentage)) {
          value = Math.max(0, percentage / 100);
        } else {
          continue;
        }
      } else {
        value = parseFloat(token);
        if (!isNaN(value)) {
          value = Math.max(0, value);
        } else {
          continue;
        }
      }
      levels.push(value);
    }
    return [...new Set(levels)].sort((a, b) => a - b);
  }
  getCurrentZoomIndex() {
    if (this.availableZoomLevels.length === 0)
      return -1;
    let closestIndex = 0;
    let closestDiff = Math.abs(this.availableZoomLevels[0] - this.zoom);
    for (let i = 1;i < this.availableZoomLevels.length; i++) {
      const diff = Math.abs(this.availableZoomLevels[i] - this.zoom);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
  }
  isZoomInDisabled() {
    if (this.availableZoomLevels.length === 0)
      return false;
    const currentIndex = this.getCurrentZoomIndex();
    return currentIndex >= this.availableZoomLevels.length - 1;
  }
  isZoomOutDisabled() {
    if (this.availableZoomLevels.length === 0)
      return false;
    const currentIndex = this.getCurrentZoomIndex();
    return currentIndex <= 0;
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("zoom")) {
      this.setStyleProperty("--zoom", `${this.zoom}`);
    }
    super.willUpdate(changedProperties);
  }
  updated(changedProperties) {
    if (changedProperties.has("zoomLevels")) {
      this.availableZoomLevels = this.parseZoomLevels(this.zoomLevels);
      if (this.availableZoomLevels.length > 0) {
        const currentIndex = this.getCurrentZoomIndex();
        if (Math.abs(this.availableZoomLevels[currentIndex] - this.zoom) > 0.001) {
          this.zoom = this.availableZoomLevels[currentIndex];
        }
      }
    }
    if (changedProperties.has("withThemeSync")) {
      if (this.withThemeSync) {
        this.themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        this.syncTheme();
      } else {
        this.themeObserver?.disconnect();
      }
    }
    super.updated(changedProperties);
  }
  zoomIn() {
    if (this.availableZoomLevels.length === 0) {
      this.zoom = Math.min(this.zoom + 0.05, 2);
      return;
    }
    const currentIndex = this.getCurrentZoomIndex();
    if (currentIndex < this.availableZoomLevels.length - 1) {
      this.zoom = this.availableZoomLevels[currentIndex + 1];
    }
  }
  zoomOut() {
    if (this.availableZoomLevels.length === 0) {
      this.zoom = Math.max(this.zoom - 0.05, 0);
      return;
    }
    const currentIndex = this.getCurrentZoomIndex();
    if (currentIndex > 0) {
      this.zoom = this.availableZoomLevels[currentIndex - 1];
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.themeObserver?.disconnect();
  }
  syncTheme() {
    if (!this.withThemeSync)
      return;
    try {
      const iframeRoot = this.contentDocument?.documentElement;
      if (!iframeRoot)
        return;
      const prefixes = ["wa-theme-", "wa-brand-", "wa-palette-"];
      const schemeCls = new Set;
      const themeCls = new Set;
      let el = this;
      let schemeFound = false;
      while (el) {
        if (!schemeFound) {
          if (el.classList.contains("wa-dark")) {
            schemeCls.add("wa-dark");
            schemeFound = true;
          } else if (el.classList.contains("wa-light")) {
            schemeCls.add("wa-light");
            schemeFound = true;
          }
        }
        for (const cls of el.classList) {
          if (prefixes.some((p) => cls.startsWith(p)))
            themeCls.add(cls);
        }
        el = el.parentElement;
      }
      iframeRoot.classList.toggle("wa-dark", schemeCls.has("wa-dark"));
      iframeRoot.classList.toggle("wa-light", schemeCls.has("wa-light"));
      const toRemove = Array.from(iframeRoot.classList).filter((c) => prefixes.some((p) => c.startsWith(p)));
      iframeRoot.classList.remove(...toRemove);
      iframeRoot.classList.add(...themeCls);
    } catch {}
  }
  handleLoad() {
    if (this.withThemeSync)
      this.syncTheme();
    this.dispatchEvent(new Event("load", { bubbles: false, cancelable: false, composed: true }));
  }
  handleError() {
    this.dispatchEvent(new Event("error", { bubbles: false, cancelable: false, composed: true }));
  }
  render() {
    return html`
      <div id="frame-container">
        <iframe
          id="iframe"
          part="iframe"
          ?inert=${this.withoutInteraction}
          ?allowfullscreen=${this.allowfullscreen}
          allow=${ifDefined(this.allow ?? undefined)}
          sandbox=${ifDefined(this.sandbox ?? undefined)}
          referrerpolicy=${ifDefined(this.referrerpolicy ?? undefined)}
          name=${ifDefined(this.name ?? undefined)}
          title=${ifDefined(this.label || undefined)}
          loading=${this.loading}
          src=${ifDefined(this.src ?? undefined)}
          srcdoc=${ifDefined(this.srcdoc ?? undefined)}
          @load=${this.handleLoad}
          @error=${this.handleError}
        ></iframe>
      </div>

      ${!this.withoutControls ? html`
            <div id="controls" part="controls">
              <button
                part="zoom-out-button"
                aria-label=${this.localize.term("zoomOut")}
                @click=${this.zoomOut}
                ?disabled=${this.isZoomOutDisabled()}
              >
                <slot name="zoom-out-icon">
                  <wa-icon name="minus" label="Zoom out"></wa-icon>
                </slot>
              </button>
              <span>${this.localize.number(this.zoom, { style: "percent", maximumFractionDigits: 1 })}</span>
              <button
                part="zoom-in-button"
                aria-label=${this.localize.term("zoomIn")}
                @click=${this.zoomIn}
                ?disabled=${this.isZoomInDisabled()}
              >
                <slot name="zoom-in-icon">
                  <wa-icon name="plus" label="Zoom in"></wa-icon>
                </slot>
              </button>
            </div>
          ` : ""}
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaZoomableFrame.prototype, "availableZoomLevels", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("#iframe")
], WaZoomableFrame.prototype, "iframe", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "src", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "srcdoc", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "allow", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaZoomableFrame.prototype, "allowfullscreen", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "loading", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "referrerpolicy", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "sandbox", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaZoomableFrame.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaZoomableFrame.prototype, "zoom", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "zoom-levels" })
], WaZoomableFrame.prototype, "zoomLevels", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "without-controls", reflect: true })
], WaZoomableFrame.prototype, "withoutControls", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "without-interaction", reflect: true })
], WaZoomableFrame.prototype, "withoutInteraction", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, attribute: "with-theme-sync", reflect: true })
], WaZoomableFrame.prototype, "withThemeSync", undefined);
WaZoomableFrame = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-zoomable-frame")
], WaZoomableFrame);
