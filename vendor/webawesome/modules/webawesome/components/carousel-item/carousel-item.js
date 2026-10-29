import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./carousel-item.styles.js";
export default class WaCarouselItem extends WebAwesomeElement {
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "group");
  }
  render() {
    return html` <slot></slot> `;
  }
}
WaCarouselItem = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-carousel-item")
], WaCarouselItem);
