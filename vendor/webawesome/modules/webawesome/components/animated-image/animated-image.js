import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { styleMap } from "../../../lit/lit/directives/style-map.js";
import { WaErrorEvent } from "../../events/error.js";
import { WaLoadEvent } from "../../events/load.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import styles from "./animated-image.styles.js";
export default class WaAnimatedImage extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.isLoaded = false;
  }
  static css = styles;
  handleClick() {
    this.play = !this.play;
  }
  handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.play = !this.play;
    }
  }
  firstUpdated(changedProperties) {
    if (this.didSSR) {
      const img = this.animatedImage;
      if (img && img.complete) {
        if (img.naturalWidth > 0) {
          img.dispatchEvent(new Event("load"));
        } else {
          img.dispatchEvent(new Event("error"));
        }
      }
    }
    super.firstUpdated(changedProperties);
  }
  handleLoad() {
    const canvas = document.createElement("canvas");
    const { width, height } = this.animatedImage;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(this.animatedImage, 0, 0, width, height);
    this.frozenFrame = canvas.toDataURL("image/gif");
    if (!this.isLoaded) {
      this.dispatchEvent(new WaLoadEvent);
      this.isLoaded = true;
    }
  }
  handleError() {
    this.dispatchEvent(new WaErrorEvent);
  }
  handlePlayChange() {
    if (this.play) {
      this.animatedImage.src = "";
      this.animatedImage.src = this.src;
    }
  }
  handleSrcChange() {
    this.isLoaded = false;
  }
  render() {
    const verb = this.localize.term(this.play ? "pauseAnimation" : "playAnimation");
    const label = `${verb} ${this.alt}`;
    const isSSRPlaceholder = this.didSSR && !this.hasUpdated;
    const shouldShow = isSSRPlaceholder || this.play;
    return html`
      <div
        class="animated-image"
        tabindex="0"
        role="button"
        aria-pressed=${this.play ? "true" : "false"}
        aria-label=${label}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <img
          class="animated"
          src=${this.src}
          alt=${this.alt}
          crossorigin="anonymous"
          aria-hidden=${shouldShow ? "false" : "true"}
          style=${styleMap({ visibility: isSSRPlaceholder ? "hidden" : null })}
          role="presentation"
          @load=${this.handleLoad}
          @error=${this.handleError}
        />

        ${this.isLoaded ? html`
              <img
                class="frozen"
                src=${this.frozenFrame}
                alt=${this.alt}
                aria-hidden=${this.play ? "true" : "false"}
                role="presentation"
              />

              <div part="control-box" class="control-box" aria-hidden="true">
                <slot name="play-icon">
                  <wa-icon
                    name="play"
                    library="system"
                    variant="solid"
                    class="default"
                    style=${styleMap({ "margin-inline-start": "3px" })}
                  ></wa-icon>
                </slot>
                <slot name="pause-icon">
                  <wa-icon name="pause" library="system" variant="solid" class="default"></wa-icon>
                </slot>
              </div>
            ` : ""}
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query(".animated")
], WaAnimatedImage.prototype, "animatedImage", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaAnimatedImage.prototype, "frozenFrame", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaAnimatedImage.prototype, "isLoaded", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaAnimatedImage.prototype, "src", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaAnimatedImage.prototype, "alt", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaAnimatedImage.prototype, "play", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("play", { waitUntilFirstUpdate: true })
], WaAnimatedImage.prototype, "handlePlayChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("src")
], WaAnimatedImage.prototype, "handleSrcChange", null);
WaAnimatedImage = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-animated-image")
], WaAnimatedImage);
