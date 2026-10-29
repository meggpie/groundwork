import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { css, html, isServer } from "../../../lit/lit/index.js";
import { customElement, property, query } from "../../../lit/lit/decorators.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { live } from "../../../lit/lit/directives/live.js";
import { unsafeHTML } from "../../../lit/lit/directives/unsafe-html.js";
import { when } from "../../../lit/lit/directives/when.js";
import { HasSlotController } from "../../internal/slot.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import visuallyHidden from "../../styles/component/visually-hidden.styles.js";
import"../button/button.js";
import"../drawer/drawer.js";
import"../icon/icon.js";
import mobileStyles from "./page.mobile.styles.js";
import styles from "./page.styles.js";
function toPx(value, element) {
  if (!Number.isNaN(Number(value))) {
    return Number(value);
  }
  if (!globalThis.CSS || !globalThis.CSS.registerProperty) {
    if (typeof value === "string" && value.endsWith("px")) {
      return parseFloat(value);
    }
    return Number(value) || 0;
  }
  const resolver = "--wa-length-resolver";
  if (!CSS.registerProperty.toString().includes(resolver)) {
    try {
      CSS.registerProperty({
        name: resolver,
        syntax: "<length>",
        inherits: false,
        initialValue: "0px"
      });
    } catch (e) {}
  }
  if (!element) {
    element = document.documentElement;
  }
  const previousValue = element.style.getPropertyValue(resolver);
  element.style.setProperty(resolver, value);
  const computedValue = getComputedStyle(element)?.getPropertyValue(resolver);
  element.style.setProperty(resolver, previousValue);
  if (computedValue?.endsWith("px")) {
    return parseFloat(computedValue);
  }
  return Number(computedValue) || 0;
}
function toLength(px) {
  return Number.isNaN(Number(px)) ? px : `${px}px`;
}
export default class WaPage extends WebAwesomeElement {
  static css = [
    visuallyHidden,
    css`
      @layer wa-page {
        ${styles}
      }
    `
  ];
  slotResizeObserver(slot) {
    return new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        for (const entry of entries) {
          if (entry.borderBoxSize) {
            const borderBoxSize = entry.borderBoxSize[0];
            this.style.setProperty(`--${slot}-height`, `${Math.round(borderBoxSize.blockSize)}px`);
          }
        }
      });
    });
  }
  updated(changedProperties) {
    if (changedProperties.has("view")) {
      this.hideNavigation();
    }
    super.updated(changedProperties);
  }
  willUpdate(changed) {
    if (changed.has("mobileBreakpoint")) {
      this.internalMobileBreakpointPx = toPx(this.mobileBreakpoint);
    }
  }
  constructor() {
    super();
    this.hasSlotController = new HasSlotController(this, "navigation-footer", "mobile-navigation-footer");
    this.headerResizeObserver = !isServer ? this.slotResizeObserver("header") : null;
    this.subheaderResizeObserver = !isServer ? this.slotResizeObserver("subheader") : null;
    this.bannerResizeObserver = !isServer ? this.slotResizeObserver("banner") : null;
    this.footerResizeObserver = !isServer ? this.slotResizeObserver("footer") : null;
    this.hasExplicitNavigationToggleSetting = false;
    this.handleNavigationToggle = (e) => {
      if (this.view === "desktop") {
        this.hideNavigation();
        return;
      }
      const path = e.composedPath();
      const navigationToggleSlot = this.navigationToggleSlot;
      if (path.find((el) => {
        return el.hasAttribute?.("data-toggle-nav") || el.assignedSlot === navigationToggleSlot || el === navigationToggleSlot;
      })) {
        e.preventDefault();
        this.toggleNavigation();
      }
    };
    this.view = "desktop";
    this.navOpen = false;
    this.mobileBreakpoint = "768px";
    this.internalMobileBreakpointPx = toPx(this.mobileBreakpoint);
    this.disableSticky = null;
    this.navigationPlacement = "start";
    this.disableNavigationToggle = false;
    this.pageResizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        for (const entry of entries) {
          if (entry.target === this.widthMeasurer) {
            const width = this.offsetWidth;
            const view = width >= this.internalMobileBreakpointPx ? "desktop" : "mobile";
            if (view !== this.view) {
              this.view = view;
            }
          }
        }
      });
    }) : null;
    this.updateNavigationToggleState = (e) => {
      if (e) {
        const slotName = e.target.name;
        if (!["navigation", "navigation-header", "navigation-footer"].includes(slotName))
          return;
      }
      if (this.hasExplicitNavigationToggleSetting)
        return;
      const hasCustomToggle = Boolean(this.querySelector(":not([slot='navigation-toggle']) [data-toggle-nav]"));
      const hasNavigationContent = Boolean(this.querySelector('[slot="navigation"]')) || Boolean(this.querySelector('[slot="navigation-header"]')) || Boolean(this.querySelector('[slot="navigation-footer"]'));
      this.disableNavigationToggle = hasCustomToggle || !hasNavigationContent;
    };
    if ("addEventListener" in this) {
      this.addEventListener("click", this.handleNavigationToggle);
    }
  }
  visiblePixelsInViewport(element) {
    if (!element) {
      return null;
    }
    const elementHeight = element.clientHeight;
    const windowHeight = window.innerHeight;
    const rect = element.getBoundingClientRect?.();
    if (!rect) {
      return null;
    }
    const { top, bottom } = rect;
    return Math.max(0, top > 0 ? Math.min(elementHeight, windowHeight - top) : Math.min(bottom, windowHeight));
  }
  firstUpdated(changedProperties) {
    this.pageResizeObserver?.observe(this.widthMeasurer);
    this.headerResizeObserver?.observe(this.header);
    this.subheaderResizeObserver?.observe(this.subheader);
    this.bannerResizeObserver?.observe(this.banner);
    this.footerResizeObserver?.observe(this.footer);
    if (!document.getElementById("main-content")) {
      const div = document.createElement("div");
      div.id = "main-content";
      div.slot = "skip-to-content-target";
      this.prepend(div);
    }
    this.hasExplicitNavigationToggleSetting = this.disableNavigationToggle;
    this.shadowRoot.addEventListener("slotchange", this.updateNavigationToggleState);
    this.updateNavigationToggleState();
    super.firstUpdated(changedProperties);
  }
  showNavigation() {
    this.navOpen = true;
  }
  hideNavigation() {
    this.navOpen = false;
  }
  toggleNavigation() {
    this.navOpen = !this.navOpen;
  }
  render() {
    const hasMobileNavigationFooter = this.view === "mobile" && (this.hasSlotController.test("navigation-footer") || this.hasSlotController.test("mobile-navigation-footer"));
    let nonce = this.nonce || globalThis.litNonce || null;
    return html`
      <!--
        This looks weird, but because all other slots rely on the slotted content widths, we use this to get the actual width. By having the ResizeObserver here instead of on the host, we bypass the ResizeObserver loop limit shenanigans.
        We set the height to 0 so changing view never resizes the host.
        -->
      <div class="width-measurer" style="display: block; height: 0;"></div>
      <a href="#main-content" part="skip-to-content" class="wa-visually-hidden">
        <slot name="skip-to-content">Skip to content</slot>
      </a>

      <!-- unsafeHTML needed for SSR until this is solved: https://github.com/lit/lit/issues/4696 -->
      ${unsafeHTML(`
        <style
          ${nonce ? `nonce="${nonce}"` : ""}
          id="mobile-styles"
        >
          ${mobileStyles(toLength(this.mobileBreakpoint))}
        </style>
      `)}

      <div class="base" part="base page">
        <div class="banner" part="banner">
          <slot name="banner"></slot>
        </div>
        <div class="header" part="header">
          <slot name="navigation-toggle">
            <wa-button part="navigation-toggle" size="s" appearance="plain" variant="neutral">
              <slot name="navigation-toggle-icon">
                <wa-icon
                  library="system"
                  name="bars"
                  part="navigation-toggle-icon"
                  label="Toggle navigation drawer"
                ></wa-icon>
              </slot>
            </wa-button>
          </slot>
          <slot name="header"></slot>
        </div>
        <div class="subheader" part="subheader">
          <slot name="subheader"></slot>
        </div>
        <div class="body" part="body">
          <div class="menu" part="menu">
            <slot name="menu">
              <nav name="navigation" class="navigation" part="navigation navigation-desktop">
                <!-- Add fallback divs so that CSS grid works properly. -->
                <slot name="desktop-navigation-header">
                  ${when(this.view === "desktop", () => html`<slot name="navigation-header"><div></div></slot>`, () => html`<div></div>`)}
                </slot>
                <slot name="desktop-navigation">
                  ${when(this.view === "desktop", () => html`<slot name="navigation"><div></div></slot>`, () => html`<div></div>`)}
                </slot>
                <slot name="desktop-navigation-footer">
                  ${when(this.view === "desktop", () => html`<slot name="navigation-footer"><div></div></slot>`, () => html`<div></div>`)}
                </slot>
              </nav>
            </slot>
          </div>
          <div class="main" part="main">
            <div class="main-header" part="main-header">
              <slot name="main-header"></slot>
            </div>
            <div class="main-content" part="main-content">
              <slot name="skip-to-content-target"></slot>
              <slot></slot>
            </div>
            <div class="main-footer" part="main-footer">
              <slot name="main-footer"></slot>
            </div>
          </div>
          <div class="aside" part="aside">
            <slot name="aside"></slot>
          </div>
        </div>
        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
      <wa-drawer
        part="drawer"
        placement=${this.navigationPlacement}
        light-dismiss
        ?open=${live(this.navOpen)}
        @wa-after-show=${() => this.navOpen = this.navigationDrawer.open}
        @wa-after-hide=${() => this.navOpen = this.navigationDrawer.open}
        exportparts="
          dialog:drawer__dialog,
          overlay:drawer__overlay,
          panel:drawer__panel,
          header:drawer__header,
          header-actions:drawer__header-actions,
          title:drawer__title,
          close-button:drawer__close-button,
          close-button__base:drawer__close-button__base,
          body:drawer__body,
          footer:drawer__footer
        "
        class="navigation-drawer"
      >
        <slot slot="label" part="navigation-header" name="mobile-navigation-header">
          ${when(this.view === "mobile", () => html`<slot name="navigation-header"><div></div></slot>`, () => html`<div></div>`)}
        </slot>
        <slot name="mobile-navigation">
          ${when(this.view === "mobile", () => html`<slot name="navigation"><div></div></slot>`, () => html`<div></div>`)}
        </slot>

        <slot
          slot=${ifDefined(hasMobileNavigationFooter ? "footer" : undefined)}
          name="mobile-navigation-footer"
          ?hidden=${!hasMobileNavigationFooter}
        >
          ${when(this.view === "mobile", () => html`<slot part="navigation-footer" name="navigation-footer"><div></div></slot>`, () => html`<div></div>`)}
        </slot>
      </wa-drawer>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query("[part~='header']")
], WaPage.prototype, "header", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("[part~='menu']")
], WaPage.prototype, "menu", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("[part~='main']")
], WaPage.prototype, "main", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("[part~='aside']")
], WaPage.prototype, "aside", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("[part~='subheader']")
], WaPage.prototype, "subheader", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("[part~='footer']")
], WaPage.prototype, "footer", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("[part~='banner']")
], WaPage.prototype, "banner", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("[part~='drawer']")
], WaPage.prototype, "navigationDrawer", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".width-measurer")
], WaPage.prototype, "widthMeasurer", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot[name~='navigation-toggle']")
], WaPage.prototype, "navigationToggleSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "view", reflect: true })
], WaPage.prototype, "view", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaPage.prototype, "nonce", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "nav-open", reflect: true, type: Boolean })
], WaPage.prototype, "navOpen", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "mobile-breakpoint", type: String })
], WaPage.prototype, "mobileBreakpoint", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "disable-sticky", reflect: true })
], WaPage.prototype, "disableSticky", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "navigation-placement", reflect: true })
], WaPage.prototype, "navigationPlacement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "disable-navigation-toggle", reflect: true, type: Boolean })
], WaPage.prototype, "disableNavigationToggle", undefined);
WaPage = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-page")
], WaPage);
