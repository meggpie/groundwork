import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { animateWithClass } from "../../internal/animate.js";
import { warnDeprecatedSize } from "../../internal/size.js";
import { HasSlotController } from "../../internal/slot.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import"../icon/icon.js";
import styles from "./dropdown-item.styles.js";
export default class WaDropdownItem extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "[default]", "start", "end");
    this.active = false;
    this.variant = "default";
    this.size = "m";
    this.checkboxAdjacent = false;
    this.submenuAdjacent = false;
    this.type = "normal";
    this.checked = false;
    this.disabled = false;
    this.submenuOpen = false;
    this.hasSubmenu = false;
    this.handleSlotChange = () => {
      this.hasSubmenu = this.hasSlotController.test("submenu");
      this.updateHasSubmenuState();
      if (this.hasSubmenu) {
        this.setAttribute("aria-haspopup", "menu");
        this.setAttribute("aria-expanded", this.submenuOpen ? "true" : "false");
      } else {
        this.removeAttribute("aria-haspopup");
        this.removeAttribute("aria-expanded");
      }
    };
    this.handleHostClick = (event) => {
      if (this.disabled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    this.handleClick = (event) => {
      if (this.disabled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    this.handlePointerEnter = (event) => {
      if (event.pointerType === "mouse" && this.hasSubmenu && !this.disabled) {
        this.notifyParentOfOpening();
        this.submenuOpen = true;
      }
    };
  }
  static css = styles;
  handleSizeChange() {
    warnDeprecatedSize(this.localName, this.size);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener?.("click", this.handleHostClick);
    this.addEventListener?.("pointerenter", this.handlePointerEnter);
    this.shadowRoot?.addEventListener?.("click", this.handleClick, { capture: true });
    this.shadowRoot?.addEventListener?.("slotchange", this.handleSlotChange);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.closeSubmenu();
    this.removeEventListener?.("click", this.handleHostClick);
    this.removeEventListener?.("pointerenter", this.handlePointerEnter);
    this.shadowRoot?.removeEventListener?.("click", this.handleClick, { capture: true });
    this.shadowRoot?.removeEventListener?.("slotchange", this.handleSlotChange);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.setAttribute("tabindex", "-1");
    this.hasSubmenu = this.hasSlotController.test("submenu");
    this.updateHasSubmenuState();
  }
  updated(changedProperties) {
    if (changedProperties.has("active")) {
      this.setAttribute("tabindex", this.active ? "0" : "-1");
      this.customStates.set("active", this.active);
    }
    if (changedProperties.has("checked")) {
      if (this.type === "checkbox") {
        this.setAttribute("aria-checked", this.checked ? "true" : "false");
      } else {
        this.removeAttribute("aria-checked");
      }
      this.customStates.set("checked", this.checked);
    }
    if (changedProperties.has("disabled")) {
      this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
      this.customStates.set("disabled", this.disabled);
    }
    if (changedProperties.has("type")) {
      if (this.type === "checkbox") {
        this.setAttribute("role", "menuitemcheckbox");
        this.setAttribute("aria-checked", this.checked ? "true" : "false");
      } else {
        this.setAttribute("role", "menuitem");
        this.removeAttribute("aria-checked");
      }
    }
    if (changedProperties.has("href") || changedProperties.has("hasSubmenu")) {
      this.customStates.set("link", this.isLink());
    }
    if (changedProperties.has("submenuOpen")) {
      this.customStates.set("submenu-open", this.submenuOpen);
      if (this.submenuOpen) {
        this.openSubmenu();
      } else {
        this.closeSubmenu();
      }
    }
  }
  updateHasSubmenuState() {
    this.customStates.set("has-submenu", this.hasSubmenu);
  }
  async openSubmenu() {
    const submenu = this.submenuElement;
    if (!this.hasSubmenu || !submenu || !this.isConnected)
      return;
    this.notifyParentOfOpening();
    submenu.showPopover?.();
    submenu.hidden = false;
    submenu.setAttribute("data-visible", "");
    this.submenuOpen = true;
    this.setAttribute("aria-expanded", "true");
    await animateWithClass(submenu, "show");
    setTimeout(() => {
      const items = this.getSubmenuItems();
      if (items.length > 0) {
        items.forEach((item, index) => item.active = index === 0);
        items[0].focus({ preventScroll: true });
      }
    }, 0);
  }
  notifyParentOfOpening() {
    const event = new CustomEvent("submenu-opening", {
      bubbles: true,
      composed: true,
      detail: { item: this }
    });
    this.dispatchEvent(event);
    const parent = this.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter((el) => el !== this && el.localName === "wa-dropdown-item" && el.getAttribute("slot") === this.getAttribute("slot") && el.submenuOpen);
      siblings.forEach((sibling) => {
        sibling.submenuOpen = false;
      });
    }
  }
  async closeSubmenu() {
    const submenu = this.submenuElement;
    if (!this.hasSubmenu || !submenu)
      return;
    this.submenuOpen = false;
    this.setAttribute("aria-expanded", "false");
    if (!submenu.hidden) {
      await animateWithClass(submenu, "hide");
      if (submenu?.isConnected) {
        submenu.hidden = true;
        submenu.removeAttribute("data-visible");
        submenu.hidePopover?.();
      }
    }
  }
  isLink() {
    return Boolean(this.href) && !this.hasSubmenu;
  }
  navigate(sourceEvent) {
    const link = this.linkElement;
    if (!this.isLink() || this.disabled || !link) {
      return;
    }
    link.dispatchEvent(new MouseEvent("click", {
      bubbles: false,
      cancelable: true,
      composed: false,
      altKey: sourceEvent?.altKey ?? false,
      ctrlKey: sourceEvent?.ctrlKey ?? false,
      metaKey: sourceEvent?.metaKey ?? false,
      shiftKey: sourceEvent?.shiftKey ?? false
    }));
  }
  getSubmenuItems() {
    return [...this.children].filter((el) => el.localName === "wa-dropdown-item" && el.getAttribute("slot") === "submenu" && !el.hasAttribute("disabled"));
  }
  render() {
    return html`
      ${this.href ? html`
            <a
              id="link"
              href=${this.href}
              target=${ifDefined(this.target)}
              rel=${ifDefined(this.rel)}
              download=${ifDefined(this.download)}
              tabindex="-1"
              aria-hidden="true"
            ></a>
          ` : ""}
      ${this.type === "checkbox" ? html`
            <wa-icon
              id="check"
              part="checkmark"
              exportparts="svg:checkmark__svg"
              library="system"
              name="check"
            ></wa-icon>
          ` : ""}

      <span id="icon" part="icon">
        <slot name="icon"></slot>
      </span>

      <span id="label" part="label">
        <slot></slot>
      </span>

      <span id="details" part="details">
        <slot name="details"></slot>
      </span>

      ${this.hasSubmenu ? html`
            <wa-icon
              id="submenu-indicator"
              part="submenu-icon"
              exportparts="svg:submenu-icon__svg"
              library="system"
              name="chevron-right"
            ></wa-icon>
          ` : ""}
      ${this.hasSubmenu ? html`
            <div
              id="submenu"
              part="submenu"
              popover="manual"
              role="menu"
              tabindex="-1"
              aria-orientation="vertical"
              hidden
            >
              <slot name="submenu"></slot>
            </div>
          ` : html`<slot name="submenu" hidden></slot>`}
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("#submenu")
], WaDropdownItem.prototype, "submenuElement", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("#link")
], WaDropdownItem.prototype, "linkElement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaDropdownItem.prototype, "active", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDropdownItem.prototype, "variant", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDropdownItem.prototype, "size", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("size")
], WaDropdownItem.prototype, "handleSizeChange", null);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "checkbox-adjacent", type: Boolean, reflect: true })
], WaDropdownItem.prototype, "checkboxAdjacent", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "submenu-adjacent", type: Boolean, reflect: true })
], WaDropdownItem.prototype, "submenuAdjacent", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaDropdownItem.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDropdownItem.prototype, "type", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean })
], WaDropdownItem.prototype, "checked", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaDropdownItem.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaDropdownItem.prototype, "submenuOpen", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaDropdownItem.prototype, "href", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaDropdownItem.prototype, "target", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaDropdownItem.prototype, "rel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaDropdownItem.prototype, "download", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaDropdownItem.prototype, "hasSubmenu", undefined);
WaDropdownItem = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-dropdown-item")
], WaDropdownItem);
