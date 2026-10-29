import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { WaSelectionChangeEvent } from "../../events/selection-change.js";
import { clamp } from "../../internal/math.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import WaTreeItem from "../tree-item/tree-item.js";
import styles from "./tree.styles.js";
function syncCheckboxes(changedTreeItem, initialSync = false) {
  function syncParentItem(treeItem) {
    const children = treeItem.getChildrenItems({ includeDisabled: false });
    if (children.length) {
      const allChecked = children.every((item) => item.selected);
      const allUnchecked = children.every((item) => !item.selected && !item.indeterminate);
      treeItem.selected = allChecked;
      treeItem.indeterminate = !allChecked && !allUnchecked;
    }
  }
  function syncAncestors(treeItem) {
    const parentItem = treeItem.parentElement;
    if (WaTreeItem.isTreeItem(parentItem)) {
      syncParentItem(parentItem);
      syncAncestors(parentItem);
    }
  }
  function syncDescendants(treeItem) {
    for (const childItem of treeItem.getChildrenItems()) {
      childItem.selected = initialSync ? treeItem.selected || childItem.selected : !childItem.disabled && treeItem.selected;
      syncDescendants(childItem);
    }
    if (initialSync) {
      syncParentItem(treeItem);
    }
  }
  syncDescendants(changedTreeItem);
  syncAncestors(changedTreeItem);
}
export default class WaTree extends WebAwesomeElement {
  static css = styles;
  constructor() {
    super();
    this.selection = "single";
    this.clickTarget = null;
    this.localize = new LocalizeController(this);
    this.tabIndex = 0;
    this.role = "tree";
    this.handleTreeChanged = (mutations) => {
      const addedItems = [];
      for (const mutation of mutations) {
        const addedNodes = [...mutation.addedNodes].filter(WaTreeItem.isTreeItem);
        const removedNodes = [...mutation.removedNodes].filter(WaTreeItem.isTreeItem);
        for (const item of addedNodes) {
          addedItems.push(item, ...item.querySelectorAll("wa-tree-item"));
        }
        if (this.lastFocusedItem && removedNodes.includes(this.lastFocusedItem)) {
          this.lastFocusedItem = null;
        }
      }
      if (addedItems.length) {
        this.initTreeItems(addedItems);
      }
    };
    this.handleFocusOut = (event) => {
      const relatedTarget = event.relatedTarget;
      if (!relatedTarget || !this.contains(relatedTarget)) {
        this.tabIndex = 0;
      }
    };
    this.handleFocusIn = (event) => {
      const target = event.target;
      if (event.target === this) {
        this.focusItem(this.lastFocusedItem || this.getAllTreeItems()[0]);
      }
      if (WaTreeItem.isTreeItem(target) && !target.disabled) {
        if (this.lastFocusedItem) {
          this.lastFocusedItem.tabIndex = -1;
        }
        this.lastFocusedItem = target;
        this.tabIndex = -1;
        target.tabIndex = 0;
      }
    };
    this.handleLazyChange = (event) => {
      this.initTreeItems([event.target]);
    };
    if ("addEventListener" in this) {
      this.addEventListener("focusin", this.handleFocusIn);
      this.addEventListener("focusout", this.handleFocusOut);
      this.addEventListener("wa-lazy-change", this.handleLazyChange);
    }
  }
  async connectedCallback() {
    super.connectedCallback();
    if (typeof MutationObserver !== "undefined") {
      await this.updateComplete;
      this.mutationObserver = new MutationObserver(this.handleTreeChanged);
      this.mutationObserver.observe(this, { childList: true, subtree: true });
    }
    this.setAttribute("tabindex", "0");
    this.setAttribute("role", "tree");
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.mutationObserver?.disconnect();
  }
  getExpandButtonIcon(status) {
    const slot = status === "expand" ? this.expandedIconSlot : this.collapsedIconSlot;
    const icon = slot?.assignedElements({ flatten: true })[0];
    if (icon) {
      const clone = icon.cloneNode(true);
      [clone, ...clone.querySelectorAll("[id]")].forEach((el) => el.removeAttribute("id"));
      clone.setAttribute("data-default", "");
      clone.slot = `${status}-icon`;
      return clone;
    }
    return null;
  }
  initTreeItems(items) {
    const icons = { expand: this.getExpandButtonIcon("expand"), collapse: this.getExpandButtonIcon("collapse") };
    for (const item of items) {
      item.updateComplete.then(() => {
        item.selectable = this.selection === "multiple" || this.selection === "leaf-multiple" && item.isLeaf;
        for (const status of ["expand", "collapse"]) {
          const icon = icons[status];
          if (!icon)
            continue;
          const existingIcon = item.querySelector(`:scope > [slot="${status}-icon"]`);
          if (existingIcon === null) {
            item.append(icon.cloneNode(true));
          } else if (existingIcon.hasAttribute("data-default") && !existingIcon.isEqualNode(icon)) {
            existingIcon.replaceWith(icon.cloneNode(true));
          }
        }
      });
    }
  }
  selectItem(selectedItem) {
    const previousSelection = [...this.selectedItems];
    if (this.selection === "multiple") {
      selectedItem.selected = !selectedItem.selected;
      if (selectedItem.lazy) {
        selectedItem.expanded = true;
      }
      syncCheckboxes(selectedItem);
    } else if (this.selection === "leaf-multiple") {
      if (selectedItem.isLeaf) {
        selectedItem.selected = !selectedItem.selected;
      } else {
        selectedItem.expanded = !selectedItem.expanded;
      }
    } else if (this.selection === "single" || selectedItem.isLeaf) {
      const items = this.getAllTreeItems();
      for (const item of items) {
        item.selected = item === selectedItem;
      }
    } else if (this.selection === "leaf") {
      selectedItem.expanded = !selectedItem.expanded;
    }
    const nextSelection = this.selectedItems;
    if (previousSelection.length !== nextSelection.length || nextSelection.some((item) => !previousSelection.includes(item))) {
      Promise.all(nextSelection.map((el) => el.updateComplete)).then(() => {
        this.dispatchEvent(new WaSelectionChangeEvent({ selection: nextSelection }));
      });
    }
  }
  getAllTreeItems() {
    return [...this.querySelectorAll("wa-tree-item")];
  }
  focusItem(item) {
    item?.focus();
  }
  handleKeyDown(event) {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "].includes(event.key)) {
      return;
    }
    if (event.composedPath().some((el) => ["input", "textarea"].includes(el?.tagName?.toLowerCase()))) {
      return;
    }
    const items = this.getFocusableItems();
    const isLtr = this.matches(":dir(ltr)");
    const isRtl = this.localize.dir() === "rtl";
    if (items.length > 0) {
      const activeItemIndex = items.findIndex((item) => item.matches(":focus"));
      const activeItem = items[activeItemIndex];
      if (!activeItem && (event.key === "Enter" || event.key === " ")) {
        return;
      }
      event.preventDefault();
      const focusItemAt = (index) => {
        const item = items[clamp(index, 0, items.length - 1)];
        this.focusItem(item);
      };
      const toggleExpand = (expanded) => {
        activeItem.expanded = expanded;
      };
      if (event.key === "ArrowDown") {
        focusItemAt(activeItemIndex + 1);
      } else if (event.key === "ArrowUp") {
        focusItemAt(activeItemIndex - 1);
      } else if (isLtr && event.key === "ArrowRight" || isRtl && event.key === "ArrowLeft") {
        if (!activeItem || activeItem.disabled || activeItem.expanded || activeItem.isLeaf && !activeItem.lazy) {
          focusItemAt(activeItemIndex + 1);
        } else {
          toggleExpand(true);
        }
      } else if (isLtr && event.key === "ArrowLeft" || isRtl && event.key === "ArrowRight") {
        if (!activeItem || activeItem.disabled || activeItem.isLeaf || !activeItem.expanded) {
          focusItemAt(activeItemIndex - 1);
        } else {
          toggleExpand(false);
        }
      } else if (event.key === "Home") {
        focusItemAt(0);
      } else if (event.key === "End") {
        focusItemAt(items.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        if (activeItem && !activeItem.disabled) {
          this.selectItem(activeItem);
        }
      }
    }
  }
  handleClick(event) {
    const target = event.target;
    const treeItem = target.closest("wa-tree-item");
    const isExpandButton = event.composedPath().some((el) => el?.classList?.contains("expand-button"));
    if (!treeItem || treeItem.disabled || target !== this.clickTarget) {
      return;
    }
    if (isExpandButton) {
      treeItem.expanded = !treeItem.expanded;
    } else {
      this.selectItem(treeItem);
    }
  }
  handleMouseDown(event) {
    this.clickTarget = event.target;
  }
  handleSlotChange() {
    this.initTreeItems(this.getAllTreeItems());
  }
  async handleSelectionChange() {
    const isSelectionMultiple = this.selection === "multiple";
    const isSelectionLeafMultiple = this.selection === "leaf-multiple";
    const items = this.getAllTreeItems();
    this.setAttribute("aria-multiselectable", isSelectionMultiple || isSelectionLeafMultiple ? "true" : "false");
    for (const item of items) {
      item.updateComplete.then(() => {
        item.selectable = isSelectionMultiple || isSelectionLeafMultiple && item.isLeaf;
      });
    }
    if (isSelectionMultiple) {
      await this.updateComplete;
      [...this.querySelectorAll(":scope > wa-tree-item")].forEach((treeItem) => {
        treeItem.updateComplete.then(() => {
          syncCheckboxes(treeItem, true);
        });
      });
    }
  }
  get selectedItems() {
    const items = this.getAllTreeItems();
    const isSelected = (item) => item.selected;
    return items.filter(isSelected);
  }
  getFocusableItems() {
    const items = this.getAllTreeItems();
    const collapsedItems = new Set;
    return items.filter((item) => {
      if (item.disabled)
        return false;
      const parent = item.parentElement?.closest("[role=treeitem]");
      if (parent && (!parent.expanded || parent.loading || collapsedItems.has(parent))) {
        collapsedItems.add(item);
      }
      return !collapsedItems.has(item);
    });
  }
  render() {
    return html`
      <div
        part="base tree"
        class="tree"
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleMouseDown}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
        <span hidden aria-hidden="true"><slot name="expand-icon" @slotchange=${this.handleSlotChange}></slot></span>
        <span hidden aria-hidden="true"><slot name="collapse-icon" @slotchange=${this.handleSlotChange}></slot></span>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaTree.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot[name=expand-icon]")
], WaTree.prototype, "expandedIconSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot[name=collapse-icon]")
], WaTree.prototype, "collapsedIconSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaTree.prototype, "selection", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "tabindex", reflect: true, type: Number })
], WaTree.prototype, "tabIndex", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaTree.prototype, "role", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("selection")
], WaTree.prototype, "handleSelectionChange", null);
WaTree = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-tree")
], WaTree);
