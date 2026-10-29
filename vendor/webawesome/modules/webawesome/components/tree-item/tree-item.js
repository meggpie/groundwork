import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { consume, createContext, provide } from "../../../lit/context/index.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { live } from "../../../lit/lit/directives/live.js";
import { when } from "../../../lit/lit/directives/when.js";
import { WaAfterCollapseEvent } from "../../events/after-collapse.js";
import { WaAfterExpandEvent } from "../../events/after-expand.js";
import { WaCollapseEvent } from "../../events/collapse.js";
import { WaExpandEvent } from "../../events/expand.js";
import { WaLazyChangeEvent } from "../../events/lazy-change.js";
import { WaLazyLoadEvent } from "../../events/lazy-load.js";
import { animate, parseDuration } from "../../internal/animate.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../checkbox/checkbox.js";
import"../icon/icon.js";
import"../spinner/spinner.js";
import styles from "./tree-item.styles.js";
export const treeItemContext = createContext("wa-tree-item");
export default class WaTreeItem extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.indeterminate = false;
    this.isLeaf = false;
    this.loading = false;
    this.selectable = false;
    this.expanded = false;
    this.selected = false;
    this.disabled = false;
    this.lazy = false;
    this._treeItemContext = { depth: 0, expanded: this.expanded };
    this._parentTreeContext = null;
    this.animationGeneration = 0;
    this.tabIndex = -1;
    this.role = "treeitem";
  }
  static css = styles;
  static isTreeItem(node) {
    const el = node;
    return el && (el.role === "treeitem" || el.getAttribute?.("role") === "treeitem");
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "treeitem");
    this.setAttribute("tabIndex", this.tabIndex.toString());
    if (this.isNestedItem()) {
      this.setAttribute("slot", "children");
    }
    if (this._parentTreeContext) {
      this._treeItemContext = { depth: this._parentTreeContext.depth + 1, expanded: this.expanded };
    }
    this.updateIndentation();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.childrenContainer.hidden = !this.expanded;
    this.childrenContainer.style.height = this.expanded ? "auto" : "0";
    this.isLeaf = !this.lazy && this.getChildrenItems().length === 0;
    this.handleExpandedChange();
  }
  async animateCollapse(generation) {
    this.dispatchEvent(new WaCollapseEvent);
    const duration = parseDuration(getComputedStyle(this.childrenContainer).getPropertyValue("--hide-duration"));
    await animate(this.childrenContainer, [
      { height: `${this.childrenContainer.scrollHeight}px`, opacity: "1", overflow: "hidden" },
      { height: "0", opacity: "0", overflow: "hidden" }
    ], { duration, easing: "cubic-bezier(0.4, 0.0, 0.2, 1)" });
    if (this.animationGeneration !== generation) {
      return;
    }
    this.childrenContainer.hidden = true;
    this.dispatchEvent(new WaAfterCollapseEvent);
  }
  isNestedItem() {
    if (this._parentTreeContext !== null) {
      return true;
    }
    const parent = this.parentElement;
    return !!parent && WaTreeItem.isTreeItem(parent);
  }
  updateIndentation() {
    const depth = Math.max(this._treeItemContext?.depth || 0, this.getDepth());
    this.setStyleProperty("--indent", `calc(${depth} * var(--indent-size, 2em))`);
  }
  getDepth() {
    let depth = 0;
    let node = this.parentElement;
    while (node) {
      if (WaTreeItem.isTreeItem(node)) {
        depth++;
      }
      node = node.parentElement;
    }
    return depth;
  }
  handleChildrenSlotChange() {
    this.loading = false;
    this.isLeaf = !this.lazy && this.getChildrenItems().length === 0;
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("selected") && !changedProperties.has("indeterminate")) {
      this.indeterminate = false;
    }
    super.willUpdate(changedProperties);
  }
  async animateExpand(generation) {
    this.dispatchEvent(new WaExpandEvent);
    this.childrenContainer.hidden = false;
    const duration = parseDuration(getComputedStyle(this.childrenContainer).getPropertyValue("--show-duration"));
    await animate(this.childrenContainer, [
      { height: "0", opacity: "0", overflow: "hidden" },
      { height: `${this.childrenContainer.scrollHeight}px`, opacity: "1", overflow: "hidden" }
    ], {
      duration,
      easing: "cubic-bezier(0.4, 0.0, 0.2, 1)"
    });
    if (this.animationGeneration !== generation) {
      return;
    }
    this.childrenContainer.style.height = "auto";
    this.dispatchEvent(new WaAfterExpandEvent);
  }
  handleLoadingChange() {
    this.setAttribute("aria-busy", this.loading ? "true" : "false");
    if (!this.loading) {
      this.animateExpand(this.animationGeneration);
    }
  }
  handleDisabledChange() {
    this.customStates.set("disabled", this.disabled);
    this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
  }
  handleExpandedState() {
    this.customStates.set("expanded", this.expanded);
  }
  handleIndeterminateStateChange() {
    this.customStates.set("indeterminate", this.indeterminate);
  }
  handleSelectedChange() {
    this.customStates.set("selected", this.selected);
    this.setAttribute("aria-selected", this.selected ? "true" : "false");
  }
  handleExpandedChange() {
    if (!this.isLeaf) {
      this.setAttribute("aria-expanded", this.expanded ? "true" : "false");
    } else {
      this.removeAttribute("aria-expanded");
    }
  }
  handleExpandAnimation() {
    this.animationGeneration++;
    const generation = this.animationGeneration;
    if (this.expanded) {
      if (this.lazy) {
        this.loading = true;
        this.dispatchEvent(new WaLazyLoadEvent);
      } else {
        this.animateExpand(generation);
      }
    } else {
      this.animateCollapse(generation);
    }
  }
  handleLazyChange() {
    this.dispatchEvent(new WaLazyChangeEvent);
  }
  getChildrenItems({ includeDisabled = true } = {}) {
    return this.childrenSlot ? [...this.childrenSlot.assignedElements({ flatten: true })].filter((item) => WaTreeItem.isTreeItem(item) && (includeDisabled || !item.disabled)) : [];
  }
  render() {
    const isRtl = this.localize.dir() === "rtl";
    const showExpandButton = !this.loading && (!this.isLeaf || this.lazy);
    return html`
      <div
        part="base tree-item"
        class="${classMap({
      "tree-item": true,
      "tree-item-expanded": this.expanded,
      "tree-item-selected": this.selected,
      "tree-item-leaf": this.isLeaf,
      "tree-item-loading": this.loading,
      "tree-item-has-expand-button": showExpandButton
    })}"
      >
        <div class="item" part="item">
          <div class="indentation" part="indentation"></div>

          <div
            part="expand-button"
            class=${classMap({
      "expand-button": true,
      "expand-button-visible": showExpandButton
    })}
            aria-hidden="true"
          >
            <slot class="expand-icon-slot" name="expand-icon">
              ${when(this.loading, () => html` <wa-spinner part="spinner" exportparts="base:spinner__base"></wa-spinner> `, () => html`
                  <wa-icon name=${isRtl ? "chevron-left" : "chevron-right"} library="system" variant="solid"></wa-icon>
                `)}
            </slot>
            <slot class="expand-icon-slot" name="collapse-icon">
              <wa-icon name=${isRtl ? "chevron-left" : "chevron-right"} library="system" variant="solid"></wa-icon>
            </slot>
          </div>

          ${when(this.selectable, () => html`
              <wa-checkbox
                part="checkbox"
                exportparts="
                    base:checkbox__base,
                    control:checkbox__control,
                    checked-icon:checkbox__checked-icon,
                    indeterminate-icon:checkbox__indeterminate-icon,
                    label:checkbox__label
                  "
                class="checkbox"
                ?disabled="${this.disabled}"
                ?checked="${live(this.selected)}"
                ?indeterminate="${this.indeterminate}"
                tabindex="-1"
              ></wa-checkbox>
            `)}

          <slot class="label" part="label"></slot>
        </div>

        <div class="children" part="children" role="group" ?hidden=${!this.expanded && !this.isConnected}>
          <slot name="children" @slotchange="${this.handleChildrenSlotChange}"></slot>
        </div>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTreeItem.prototype, "indeterminate", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTreeItem.prototype, "isLeaf", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTreeItem.prototype, "loading", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaTreeItem.prototype, "selectable", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTreeItem.prototype, "expanded", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTreeItem.prototype, "selected", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTreeItem.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaTreeItem.prototype, "lazy", undefined);
__legacyDecorateClassTS_3r173x8m([
  provide({ context: treeItemContext })
], WaTreeItem.prototype, "_treeItemContext", undefined);
__legacyDecorateClassTS_3r173x8m([
  consume({ context: treeItemContext, subscribe: false })
], WaTreeItem.prototype, "_parentTreeContext", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaTreeItem.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot[name=children]")
], WaTreeItem.prototype, "childrenSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".item")
], WaTreeItem.prototype, "itemElement", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".children")
], WaTreeItem.prototype, "childrenContainer", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".expand-button slot")
], WaTreeItem.prototype, "expandButtonSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true, type: Number, attribute: "tabindex" })
], WaTreeItem.prototype, "tabIndex", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTreeItem.prototype, "role", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("loading", { waitUntilFirstUpdate: true })
], WaTreeItem.prototype, "handleLoadingChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled")
], WaTreeItem.prototype, "handleDisabledChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("expanded")
], WaTreeItem.prototype, "handleExpandedState", null);
__legacyDecorateClassTS_3r173x8m([
  watch("indeterminate")
], WaTreeItem.prototype, "handleIndeterminateStateChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("selected")
], WaTreeItem.prototype, "handleSelectedChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("expanded", { waitUntilFirstUpdate: true })
], WaTreeItem.prototype, "handleExpandedChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("expanded", { waitUntilFirstUpdate: true })
], WaTreeItem.prototype, "handleExpandAnimation", null);
__legacyDecorateClassTS_3r173x8m([
  watch("lazy", { waitUntilFirstUpdate: true })
], WaTreeItem.prototype, "handleLazyChange", null);
WaTreeItem = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-tree-item")
], WaTreeItem);
WaTreeItem.disableWarning?.("change-in-update");
