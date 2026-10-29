import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./breadcrumb-item.styles.js";
export default class WaBreadcrumbItem extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.renderType = "button";
    this.rel = "noreferrer noopener";
  }
  static css = styles;
  setRenderType() {
    const hasDropdown = this.defaultSlot.assignedElements({ flatten: true }).filter((i) => i.tagName.toLowerCase() === "wa-dropdown").length > 0;
    if (typeof this.href === "string") {
      this.renderType = "link";
      return;
    }
    if (hasDropdown) {
      this.renderType = "dropdown";
      return;
    }
    this.renderType = "button";
  }
  hrefChanged() {
    this.setRenderType();
  }
  handleSlotChange() {
    this.setRenderType();
  }
  render() {
    return html`
      <span part="start" class="start">
        <slot name="start"></slot>
      </span>

      ${this.renderType === "link" ? html`
            <a
              part="label"
              class="label label-link"
              href="${this.href}"
              target="${ifDefined(this.target ? this.target : undefined)}"
              rel=${ifDefined(this.target ? this.rel : undefined)}
            >
              <slot></slot>
            </a>
          ` : ""}
      ${this.renderType === "button" ? html`
            <button part="label" type="button" class="label label-button">
              <slot @slotchange=${this.handleSlotChange}></slot>
            </button>
          ` : ""}
      ${this.renderType === "dropdown" ? html`
            <div part="label" class="label label-dropdown">
              <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
          ` : ""}

      <span part="end" class="end">
        <slot name="end"></slot>
      </span>

      <span part="separator" class="separator" aria-hidden="true">
        <slot name="separator"></slot>
      </span>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaBreadcrumbItem.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaBreadcrumbItem.prototype, "renderType", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaBreadcrumbItem.prototype, "href", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaBreadcrumbItem.prototype, "target", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaBreadcrumbItem.prototype, "rel", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("href", { waitUntilFirstUpdate: true })
], WaBreadcrumbItem.prototype, "hrefChanged", null);
WaBreadcrumbItem = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-breadcrumb-item")
], WaBreadcrumbItem);
