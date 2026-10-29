import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, state } from "../../../lit/lit/decorators.js";
import { isTemplateResult } from "../../../lit/lit/directive-helpers.js";
import { WaErrorEvent } from "../../events/error.js";
import { WaLoadEvent } from "../../events/load.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./icon.styles.js";
import { getDefaultIconFamily, getIconLibrary, unwatchIcon, watchIcon } from "./library.js";
const CACHEABLE_ERROR = Symbol();
const RETRYABLE_ERROR = Symbol();
let parser;
const iconCache = new Map;
export default class WaIcon extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.svg = null;
    this.autoWidth = false;
    this.swapOpacity = false;
    this.label = "";
    this.library = "default";
    this.rotate = 0;
    this.resolveIcon = async (url, library) => {
      let fileData;
      if (library?.spriteSheet) {
        if (!this.hasUpdated) {
          await this.updateComplete;
        }
        this.svg = html`<svg part="svg">
        <use part="use" href="${url}"></use>
      </svg>`;
        await this.updateComplete;
        const svg = this.shadowRoot.querySelector("[part='svg']");
        if (typeof library.mutator === "function") {
          library.mutator(svg, this);
        }
        return this.svg;
      }
      try {
        // Groundwork patch: read inline SVG data URIs directly, so icons never depend on fetch (blocked by some LMS/CSP frames).
        fileData = url.startsWith("data:image/svg+xml,") ? { ok: true, status: 200, text: async () => decodeURIComponent(url.slice(19)) } : await fetch(url, { mode: "cors" });
        if (!fileData.ok)
          return fileData.status === 410 ? CACHEABLE_ERROR : RETRYABLE_ERROR;
      } catch {
        return RETRYABLE_ERROR;
      }
      try {
        const div = document.createElement("div");
        div.innerHTML = await fileData.text();
        const svg = div.firstElementChild;
        if (svg?.tagName?.toLowerCase() !== "svg")
          return CACHEABLE_ERROR;
        if (!parser)
          parser = new DOMParser;
        const doc = parser.parseFromString(svg.outerHTML, "text/html");
        const svgEl = doc.body.querySelector("svg");
        if (!svgEl)
          return CACHEABLE_ERROR;
        svgEl.part.add("svg");
        return document.adoptNode(svgEl);
      } catch {
        return CACHEABLE_ERROR;
      }
    };
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    watchIcon(this);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.hasAttribute("rotate")) {
      this.style.setProperty("--rotate-angle", `${this.rotate}deg`);
    }
    this.setIcon();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    unwatchIcon(this);
  }
  async getIconSource() {
    const library = getIconLibrary(this.library);
    const family = this.family || getDefaultIconFamily();
    if (this.name && library) {
      const autoWidth = this.canvas === "auto" || this.autoWidth;
      let url;
      try {
        url = await library.resolver(this.name, family, this.variant, autoWidth);
      } catch {
        url = undefined;
      }
      return { url, fromLibrary: true };
    }
    return {
      url: this.src,
      fromLibrary: false
    };
  }
  handleLabelChange() {
    const hasLabel = typeof this.label === "string" && this.label.length > 0;
    if (hasLabel) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.label);
      this.removeAttribute("aria-hidden");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
      this.setAttribute("aria-hidden", "true");
    }
  }
  async setIcon() {
    const { url, fromLibrary } = await this.getIconSource();
    const library = fromLibrary ? getIconLibrary(this.library) : undefined;
    if (!url) {
      this.svg = null;
      return;
    }
    let iconResolver = iconCache.get(url);
    if (!iconResolver) {
      iconResolver = this.resolveIcon(url, library);
      iconCache.set(url, iconResolver);
    }
    const svg = await iconResolver;
    if (svg === RETRYABLE_ERROR) {
      iconCache.delete(url);
    }
    const sourceAfterFetch = await this.getIconSource();
    if (url !== sourceAfterFetch.url) {
      return;
    }
    if (isTemplateResult(svg)) {
      this.svg = svg;
      return;
    }
    switch (svg) {
      case RETRYABLE_ERROR:
      case CACHEABLE_ERROR:
        this.svg = null;
        this.dispatchEvent(new WaErrorEvent);
        break;
      default:
        this.svg = svg.cloneNode(true);
        library?.mutator?.(this.svg, this);
        this.dispatchEvent(new WaLoadEvent);
    }
  }
  willUpdate(changedProperties) {
    if (!this.style) {
      this.setStyleProperty("--rotate-angle", `${this.rotate}deg`);
    }
    return super.willUpdate(changedProperties);
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    const library = getIconLibrary(this.library);
    if (this.hasAttribute("rotate")) {
      this.style.setProperty("--rotate-angle", `${this.rotate}deg`);
    }
    const svg = this.shadowRoot?.querySelector("svg");
    if (svg) {
      library?.mutator?.(svg, this);
    }
  }
  render() {
    if (this.hasUpdated) {
      return this.svg;
    }
    return html`<svg part="svg" width="16" height="16" viewBox="0 0 16 16"></svg>`;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaIcon.prototype, "svg", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaIcon.prototype, "name", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaIcon.prototype, "family", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaIcon.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaIcon.prototype, "canvas", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "auto-width", type: Boolean, reflect: true })
], WaIcon.prototype, "autoWidth", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "swap-opacity", type: Boolean, reflect: true })
], WaIcon.prototype, "swapOpacity", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaIcon.prototype, "src", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaIcon.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaIcon.prototype, "library", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaIcon.prototype, "rotate", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: String, reflect: true })
], WaIcon.prototype, "flip", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: String, reflect: true })
], WaIcon.prototype, "animation", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("label")
], WaIcon.prototype, "handleLabelChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch(["family", "name", "library", "variant", "src", "autoWidth", "canvas", "swapOpacity"], {
    waitUntilFirstUpdate: true
  })
], WaIcon.prototype, "setIcon", null);
WaIcon = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-icon")
], WaIcon);
