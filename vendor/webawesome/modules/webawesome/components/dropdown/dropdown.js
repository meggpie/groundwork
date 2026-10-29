import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { autoUpdate, computePosition, flip, offset, shift } from "../../../floating-ui/dom/index.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { WaAfterHideEvent } from "../../events/after-hide.js";
import { WaAfterShowEvent } from "../../events/after-show.js";
import { WaHideEvent } from "../../events/hide.js";
import { WaSelectEvent } from "../../events/select.js";
import { WaShowEvent } from "../../events/show.js";
import { activeElements } from "../../internal/active-elements.js";
import { animateWithClass } from "../../internal/animate.js";
import { isTopDismissible, registerDismissible, unregisterDismissible } from "../../internal/dismissible-stack.js";
import { uniqueId } from "../../internal/math.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import sizeStyles from "../../styles/component/size.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../dropdown-item/dropdown-item.js";
import"../popup/popup.js";
import styles from "./dropdown.styles.js";
const openDropdowns = new Set;
export default class WaDropdown extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.submenuCleanups = new Map;
    this.localize = new LocalizeController(this);
    this.userTypedQuery = "";
    this.openSubmenuStack = [];
    this.open = false;
    this.size = "m";
    this.placement = "bottom-start";
    this.distance = 0;
    this.skidding = 0;
    this.handleDocumentKeyDown = async (event) => {
      const isRtl = this.localize.dir() === "rtl";
      if (event.key === "Escape" && this.open && isTopDismissible(this)) {
        const trigger = this.getTrigger();
        event.preventDefault();
        event.stopPropagation();
        this.open = false;
        trigger?.focus({ preventScroll: true });
        return;
      }
      const activeElement = [...activeElements()].find((el) => el.localName === "wa-dropdown-item");
      const isFocusedOnItem = activeElement?.localName === "wa-dropdown-item";
      const currentSubmenuItem = this.getCurrentSubmenuItem();
      const isInSubmenu = !!currentSubmenuItem;
      const items = isInSubmenu ? this.getSubmenuItems(currentSubmenuItem) : this.getItems();
      const activeItem = items.find((item) => item === activeElement) ?? items.find((item) => item.active);
      const activeItemIndex = activeItem ? items.indexOf(activeItem) : -1;
      let itemToSelect;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        if (activeItemIndex > 0) {
          itemToSelect = items[activeItemIndex - 1];
        } else {
          itemToSelect = items[items.length - 1];
        }
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        if (activeItemIndex !== -1 && activeItemIndex < items.length - 1) {
          itemToSelect = items[activeItemIndex + 1];
        } else {
          itemToSelect = items[0];
        }
      }
      if (event.key === (isRtl ? "ArrowLeft" : "ArrowRight") && isFocusedOnItem && activeItem) {
        if (activeItem.hasSubmenu) {
          event.preventDefault();
          event.stopPropagation();
          activeItem.submenuOpen = true;
          this.addToSubmenuStack(activeItem);
          setTimeout(() => {
            const submenuItems = this.getSubmenuItems(activeItem);
            if (submenuItems.length > 0) {
              submenuItems.forEach((item, index) => item.active = index === 0);
              submenuItems[0].focus({ preventScroll: true });
            }
          }, 0);
          return;
        }
      }
      if (event.key === (isRtl ? "ArrowRight" : "ArrowLeft") && isInSubmenu) {
        event.preventDefault();
        event.stopPropagation();
        const removedItem = this.removeFromSubmenuStack();
        if (removedItem) {
          removedItem.submenuOpen = false;
          setTimeout(() => {
            removedItem.focus({ preventScroll: true });
            removedItem.active = true;
            const parentItems = removedItem.slot === "submenu" ? this.getSubmenuItems(removedItem.parentElement) : this.getItems();
            parentItems.forEach((item) => {
              if (item !== removedItem) {
                item.active = false;
              }
            });
          }, 0);
        }
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        event.stopPropagation();
        itemToSelect = event.key === "Home" ? items[0] : items[items.length - 1];
      }
      if (event.key === "Tab") {
        await this.hideMenu();
      }
      if (event.key.length === 1 && !(event.metaKey || event.ctrlKey || event.altKey) && !(event.key === " " && this.userTypedQuery === "")) {
        clearTimeout(this.userTypedTimeout);
        this.userTypedTimeout = setTimeout(() => {
          this.userTypedQuery = "";
        }, 1000);
        this.userTypedQuery += event.key;
        items.some((item) => {
          const label = (item.textContent || "").trim().toLowerCase();
          const selectionQuery = this.userTypedQuery.trim().toLowerCase();
          if (label.startsWith(selectionQuery)) {
            itemToSelect = item;
            return true;
          }
          return false;
        });
      }
      if (itemToSelect) {
        event.preventDefault();
        event.stopPropagation();
        items.forEach((item) => item.active = item === itemToSelect);
        itemToSelect.focus({ preventScroll: true });
        itemToSelect.scrollIntoView({ block: "nearest" });
        return;
      }
      if ((event.key === "Enter" || event.key === " " && this.userTypedQuery === "") && isFocusedOnItem && activeItem) {
        event.preventDefault();
        event.stopPropagation();
        if (activeItem.hasSubmenu) {
          activeItem.submenuOpen = true;
          this.addToSubmenuStack(activeItem);
          setTimeout(() => {
            const submenuItems = this.getSubmenuItems(activeItem);
            if (submenuItems.length > 0) {
              submenuItems.forEach((item, index) => item.active = index === 0);
              submenuItems[0].focus({ preventScroll: true });
            }
          }, 0);
        } else {
          this.makeSelection(activeItem, event);
        }
      }
    };
    this.handleDocumentPointerDown = (event) => {
      const path = event.composedPath();
      const isInDropdownHierarchy = path.some((el) => {
        if (el instanceof HTMLElement) {
          return el === this || el.closest('wa-dropdown, [part="submenu"]');
        }
        return false;
      });
      if (!isInDropdownHierarchy) {
        this.open = false;
      }
    };
    this.handleGlobalMouseMove = (event) => {
      const currentSubmenuItem = this.getCurrentSubmenuItem();
      if (!currentSubmenuItem?.submenuOpen || !currentSubmenuItem.submenuElement)
        return;
      const submenuRect = currentSubmenuItem.submenuElement.getBoundingClientRect();
      const isRtl = this.localize.dir() === "rtl";
      const submenuEdgeX = isRtl ? submenuRect.right : submenuRect.left;
      const constrainedX = isRtl ? Math.max(event.clientX, submenuEdgeX) : Math.min(event.clientX, submenuEdgeX);
      const constrainedY = Math.max(submenuRect.top, Math.min(event.clientY, submenuRect.bottom));
      currentSubmenuItem.submenuElement.style.setProperty("--safe-triangle-cursor-x", `${constrainedX}px`);
      currentSubmenuItem.submenuElement.style.setProperty("--safe-triangle-cursor-y", `${constrainedY}px`);
      const composedPath = event.composedPath();
      const submenuItemHovered = () => currentSubmenuItem.matches(":hover");
      const submenuElementHovered = () => Boolean(currentSubmenuItem.submenuElement?.matches(":hover"));
      const isOverItem = submenuItemHovered() || !!composedPath.find((el) => el === currentSubmenuItem);
      const isOverSubmenu = submenuElementHovered() || !!composedPath.find((el) => el instanceof HTMLElement && el.closest('[part="submenu"]') === currentSubmenuItem.submenuElement);
      if (!isOverItem && !isOverSubmenu) {
        setTimeout(() => {
          if (!submenuItemHovered() && !submenuElementHovered()) {
            currentSubmenuItem.submenuOpen = false;
          }
        }, 100);
      }
    };
  }
  static css = [sizeStyles, styles];
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.userTypedTimeout);
    this.closeAllSubmenus();
    this.submenuCleanups.forEach((cleanup) => cleanup());
    this.submenuCleanups.clear();
    document.removeEventListener("mousemove", this.handleGlobalMouseMove);
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
    unregisterDismissible(this);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.syncAriaAttributes();
  }
  async updated(changedProperties) {
    if (changedProperties.has("open")) {
      const previousOpen = changedProperties.get("open");
      if (previousOpen === this.open) {
        return;
      }
      if (previousOpen === undefined && this.open === false) {
        return;
      }
      this.customStates.set("open", this.open);
      if (this.open) {
        await this.showMenu();
      } else {
        this.closeAllSubmenus();
        await this.hideMenu();
      }
    }
    if (changedProperties.has("size")) {
      this.syncItemSizes();
    }
  }
  getItems(includeDisabled = false) {
    const items = (this.defaultSlot?.assignedElements({ flatten: true }) ?? []).filter((el) => el.localName === "wa-dropdown-item");
    return includeDisabled ? items : items.filter((item) => !item.disabled);
  }
  getSubmenuItems(parentItem, includeDisabled = false) {
    const submenuSlot = parentItem.shadowRoot?.querySelector('slot[name="submenu"]') || parentItem.querySelector('slot[name="submenu"]');
    if (!submenuSlot) {
      return [];
    }
    const items = submenuSlot.assignedElements({ flatten: true }).filter((el) => el.localName === "wa-dropdown-item");
    return includeDisabled ? items : items.filter((item) => !item.disabled);
  }
  syncItemSizes() {
    const items = (this.defaultSlot?.assignedElements({ flatten: true }) ?? []).filter((el) => el.localName === "wa-dropdown-item");
    items.forEach((item) => item.size = this.size);
  }
  addToSubmenuStack(item) {
    const index = this.openSubmenuStack.indexOf(item);
    if (index !== -1) {
      this.openSubmenuStack = this.openSubmenuStack.slice(0, index + 1);
    } else {
      this.openSubmenuStack.push(item);
    }
  }
  removeFromSubmenuStack() {
    return this.openSubmenuStack.pop();
  }
  getCurrentSubmenuItem() {
    return this.openSubmenuStack.length > 0 ? this.openSubmenuStack[this.openSubmenuStack.length - 1] : undefined;
  }
  closeAllSubmenus() {
    const items = this.getItems(true);
    items.forEach((item) => {
      item.submenuOpen = false;
    });
    this.openSubmenuStack = [];
  }
  closeSiblingSubmenus(item) {
    const parentDropdownItem = item.closest('wa-dropdown-item:not([slot="submenu"])');
    let siblingItems;
    if (parentDropdownItem) {
      siblingItems = this.getSubmenuItems(parentDropdownItem, true);
    } else {
      siblingItems = this.getItems(true);
    }
    siblingItems.forEach((siblingItem) => {
      if (siblingItem !== item && siblingItem.submenuOpen) {
        siblingItem.submenuOpen = false;
      }
    });
    if (!this.openSubmenuStack.includes(item)) {
      this.openSubmenuStack.push(item);
    }
  }
  getTrigger() {
    return this.querySelector('[slot="trigger"]');
  }
  async showMenu() {
    const anchor = this.getTrigger();
    if (!anchor || !this.popup || !this.menu)
      return;
    const focused = [...activeElements()].pop();
    const showEvent = new WaShowEvent;
    this.dispatchEvent(showEvent);
    if (showEvent.defaultPrevented) {
      this.open = false;
      return;
    }
    if (this.popup.active) {
      return;
    }
    openDropdowns.forEach((dropdown) => dropdown.open = false);
    this.popup.active = true;
    this.open = true;
    openDropdowns.add(this);
    registerDismissible(this);
    this.syncAriaAttributes();
    document.addEventListener("keydown", this.handleDocumentKeyDown);
    document.addEventListener("pointerdown", this.handleDocumentPointerDown);
    document.addEventListener("mousemove", this.handleGlobalMouseMove);
    this.menu.classList.remove("hide");
    const animation = animateWithClass(this.menu, "show");
    await this.popup.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    if (!this.open || !this.isConnected)
      return;
    const submenu = this.getCurrentSubmenuItem();
    const items = submenu ? this.getSubmenuItems(submenu) : this.getItems();
    const content = this.defaultSlot.assignedElements({ flatten: true });
    const activeEls = [...activeElements()];
    const focusedContent = activeEls.find((element) => element instanceof HTMLElement && element.closest("wa-dropdown") === this && !element.matches(":disabled, [disabled]") && content.some((root) => root.contains(element)));
    if (focusedContent || activeEls.pop() === focused) {
      const initialItem = focusedContent ?? items[0];
      items.forEach((item) => item.active = item === initialItem);
      if (!focusedContent) {
        items[0]?.focus({ preventScroll: true });
      }
    }
    await animation;
    if (!this.open || !this.isConnected)
      return;
    this.dispatchEvent(new WaAfterShowEvent);
  }
  async hideMenu() {
    if (!this.popup || !this.menu)
      return;
    const hideEvent = new WaHideEvent({ source: this });
    this.dispatchEvent(hideEvent);
    if (hideEvent.defaultPrevented) {
      this.open = true;
      return;
    }
    this.open = false;
    openDropdowns.delete(this);
    unregisterDismissible(this);
    this.syncAriaAttributes();
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
    document.removeEventListener("mousemove", this.handleGlobalMouseMove);
    this.menu.classList.remove("show");
    await animateWithClass(this.menu, "hide");
    this.popup.active = this.open;
    this.dispatchEvent(new WaAfterHideEvent);
  }
  handleMenuClick(event) {
    const item = event.target.closest("wa-dropdown-item");
    if (!item || item.disabled)
      return;
    if (item.hasSubmenu) {
      if (!item.submenuOpen) {
        this.closeSiblingSubmenus(item);
        this.addToSubmenuStack(item);
        item.submenuOpen = true;
      }
      event.stopPropagation();
      return;
    }
    this.makeSelection(item, event);
  }
  async handleMenuSlotChange() {
    const items = this.getItems(true);
    await Promise.all(items.map((item) => item.updateComplete));
    this.syncItemSizes();
    const hasCheckbox = items.some((item) => item.type === "checkbox");
    const hasSubmenu = items.some((item) => item.hasSubmenu);
    items.forEach((item, index) => {
      item.setAttribute("aria-posinset", String(index + 1));
      item.setAttribute("aria-setsize", String(items.length));
      item.active = index === 0;
      item.checkboxAdjacent = hasCheckbox;
      item.submenuAdjacent = hasSubmenu;
    });
  }
  handleTriggerClick() {
    this.open = !this.open;
  }
  handleSubmenuOpening(event) {
    const openingItem = event.detail.item;
    this.closeSiblingSubmenus(openingItem);
    this.addToSubmenuStack(openingItem);
    this.setupSubmenuPosition(openingItem);
    this.processSubmenuItems(openingItem);
  }
  setupSubmenuPosition(item) {
    if (!item.submenuElement)
      return;
    this.cleanupSubmenuPosition(item);
    const cleanup = autoUpdate(item, item.submenuElement, () => {
      this.positionSubmenu(item);
      this.updateSafeTriangleCoordinates(item);
    });
    this.submenuCleanups.set(item, cleanup);
    const submenuSlot = item.submenuElement.querySelector('slot[name="submenu"]');
    if (submenuSlot) {
      submenuSlot.removeEventListener("slotchange", WaDropdown.handleSubmenuSlotChange);
      submenuSlot.addEventListener("slotchange", WaDropdown.handleSubmenuSlotChange);
      WaDropdown.handleSubmenuSlotChange({ target: submenuSlot });
    }
  }
  static handleSubmenuSlotChange(event) {
    const slot = event.target;
    if (!slot)
      return;
    const items = slot.assignedElements().filter((el) => el.localName === "wa-dropdown-item");
    if (items.length === 0)
      return;
    const hasSubmenuItems = items.some((item) => item.hasSubmenu);
    const hasCheckboxItems = items.some((item) => item.type === "checkbox");
    items.forEach((item) => {
      item.submenuAdjacent = hasSubmenuItems;
      item.checkboxAdjacent = hasCheckboxItems;
    });
  }
  processSubmenuItems(item) {
    if (!item.submenuElement)
      return;
    const submenuItems = this.getSubmenuItems(item, true);
    const hasSubmenuItems = submenuItems.some((subItem) => subItem.hasSubmenu);
    submenuItems.forEach((subItem) => {
      subItem.submenuAdjacent = hasSubmenuItems;
    });
  }
  cleanupSubmenuPosition(item) {
    const cleanup = this.submenuCleanups.get(item);
    if (cleanup) {
      cleanup();
      this.submenuCleanups.delete(item);
    }
  }
  positionSubmenu(item) {
    if (!item.submenuElement)
      return;
    const isRtl = this.localize.dir() === "rtl";
    const placement = isRtl ? "left-start" : "right-start";
    computePosition(item, item.submenuElement, {
      placement,
      middleware: [
        offset({
          mainAxis: 0,
          crossAxis: -5
        }),
        flip({
          fallbackStrategy: "bestFit"
        }),
        shift({
          padding: 8,
          crossAxis: true
        })
      ]
    }).then(({ x, y, placement }) => {
      item.submenuElement.setAttribute("data-placement", placement);
      Object.assign(item.submenuElement.style, {
        left: `${x}px`,
        top: `${y}px`
      });
    });
  }
  updateSafeTriangleCoordinates(item) {
    if (!item.submenuElement || !item.submenuOpen)
      return;
    const isKeyboardNavigation = document.activeElement?.matches(":focus-visible");
    if (isKeyboardNavigation) {
      item.submenuElement.style.setProperty("--safe-triangle-visible", "none");
      return;
    }
    item.submenuElement.style.setProperty("--safe-triangle-visible", "block");
    const submenuRect = item.submenuElement.getBoundingClientRect();
    const isRtl = this.localize.dir() === "rtl";
    item.submenuElement.style.setProperty("--safe-triangle-submenu-start-x", `${isRtl ? submenuRect.right : submenuRect.left}px`);
    item.submenuElement.style.setProperty("--safe-triangle-submenu-start-y", `${submenuRect.top}px`);
    item.submenuElement.style.setProperty("--safe-triangle-submenu-end-x", `${isRtl ? submenuRect.right : submenuRect.left}px`);
    item.submenuElement.style.setProperty("--safe-triangle-submenu-end-y", `${submenuRect.bottom}px`);
  }
  makeSelection(item, sourceEvent) {
    const trigger = this.getTrigger();
    if (item.disabled) {
      return;
    }
    if (item.type === "checkbox") {
      item.checked = !item.checked;
    }
    const selectEvent = new WaSelectEvent({ item });
    this.dispatchEvent(selectEvent);
    if (!selectEvent.defaultPrevented) {
      item.navigate(sourceEvent);
      this.open = false;
      trigger?.focus({ preventScroll: true });
    }
  }
  async syncAriaAttributes() {
    const trigger = this.getTrigger();
    let nativeButton;
    if (!trigger) {
      return;
    }
    if (trigger.localName === "wa-button") {
      await customElements.whenDefined("wa-button");
      await trigger.updateComplete;
      nativeButton = trigger.shadowRoot.querySelector('[part~="base"]');
    } else {
      nativeButton = trigger;
    }
    if (!nativeButton.hasAttribute("id")) {
      nativeButton.setAttribute("id", uniqueId("wa-dropdown-trigger-"));
    }
    nativeButton.setAttribute("aria-haspopup", "menu");
    nativeButton.setAttribute("aria-expanded", this.open ? "true" : "false");
    this.menu?.setAttribute("aria-expanded", "false");
  }
  render() {
    let active = this.didSSR && !this.hasUpdated ? this.open : this.popup?.active;
    return html`
      <wa-popup
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        ?active=${active}
        flip
        flip-fallback-strategy="best-fit"
        shift
        shift-padding="10"
        auto-size="vertical"
        auto-size-padding="10"
      >
        <slot
          name="trigger"
          slot="anchor"
          @click=${this.handleTriggerClick}
          @slotchange=${this.syncAriaAttributes}
        ></slot>
        <div
          id="menu"
          part="menu"
          role="menu"
          tabindex="-1"
          aria-orientation="vertical"
          @click=${this.handleMenuClick}
          @submenu-opening=${this.handleSubmenuOpening}
        >
          <slot @slotchange=${this.handleMenuSlotChange}></slot>
        </div>
      </wa-popup>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaDropdown.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("#menu")
], WaDropdown.prototype, "menu", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("wa-popup")
], WaDropdown.prototype, "popup", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaDropdown.prototype, "open", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDropdown.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaDropdown.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDropdown.prototype, "placement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaDropdown.prototype, "distance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaDropdown.prototype, "skidding", undefined);
WaDropdown = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-dropdown")
], WaDropdown);
