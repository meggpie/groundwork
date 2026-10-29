import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./skeleton.styles.js";
export default class WaSkeleton extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.effect = "none";
  }
  static css = styles;
  render() {
    return html` <div part="indicator" class="indicator"></div> `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaSkeleton.prototype, "effect", undefined);
WaSkeleton = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-skeleton")
], WaSkeleton);
