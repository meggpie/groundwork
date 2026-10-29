import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, state } from "../../../lit/lit/decorators.js";
import { WaErrorEvent } from "../../events/error.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import"../icon/icon.js";
import styles from "./avatar.styles.js";
export default class WaAvatar extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasError = false;
    this.image = "";
    this.label = "";
    this.initials = "";
    this.loading = "eager";
    this.shape = "circle";
  }
  static css = styles;
  handleImageChange() {
    this.hasError = false;
  }
  handleImageLoadError() {
    this.hasError = true;
    this.dispatchEvent(new WaErrorEvent);
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.didSSR) {
      const img = this.shadowRoot?.querySelector?.("img");
      if (img && img.complete && img.naturalWidth <= 0) {
        this.updateComplete.then(() => {
          this.handleImageLoadError();
        });
      }
    }
  }
  render() {
    const avatarWithImage = html`
      <img
        part="image"
        class="image"
        src="${this.image}"
        loading="${this.loading}"
        role="img"
        aria-label=${this.label}
        @error="${this.handleImageLoadError}"
      />
    `;
    let avatarWithoutImage = html``;
    if (this.initials) {
      avatarWithoutImage = html`<div part="initials" class="initials" role="img" aria-label=${this.label}>
        ${this.initials}
      </div>`;
    } else {
      avatarWithoutImage = html`
        <slot name="icon" part="icon" class="icon" role="img" aria-label=${this.label}>
          <wa-icon name="user" library="system" variant="solid"></wa-icon>
        </slot>
      `;
    }
    return html` ${this.image && !this.hasError ? avatarWithImage : avatarWithoutImage} `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaAvatar.prototype, "hasError", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaAvatar.prototype, "image", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaAvatar.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaAvatar.prototype, "initials", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaAvatar.prototype, "loading", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaAvatar.prototype, "shape", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("image")
], WaAvatar.prototype, "handleImageChange", null);
WaAvatar = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-avatar")
], WaAvatar);
