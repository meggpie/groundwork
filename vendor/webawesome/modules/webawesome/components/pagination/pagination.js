import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { ifDefined } from "../../../lit/lit/directives/if-defined.js";
import { WaBeforePageChangeEvent } from "../../events/before-page-change.js";
import { WaPageChangeEvent } from "../../events/page-change.js";
import { getDeepestActiveElement } from "../../internal/active-elements.js";
import { announce } from "../../internal/live-announcer.js";
import { clamp } from "../../internal/math.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import styles from "./pagination.styles.js";
function range(start, end) {
  const length = end - start + 1;
  return length > 0 ? Array.from({ length }, (_, i) => start + i) : [];
}
function getPaginationRange(options) {
  const totalPages = Math.max(1, Math.trunc(options.totalPages));
  const page = Math.min(Math.max(1, Math.trunc(options.page)), totalPages);
  const siblingCount = Math.max(0, Math.trunc(options.siblingCount));
  const boundaryCount = Math.max(0, Math.trunc(options.boundaryCount));
  const totalSlots = siblingCount * 2 + boundaryCount * 2 + 3;
  if (totalSlots >= totalPages) {
    return range(1, totalPages).map((value) => ({ type: "page", value }));
  }
  const firstMiddle = boundaryCount + 1;
  const lastMiddle = totalPages - boundaryCount;
  let windowStart = page - siblingCount;
  let windowEnd = page + siblingCount;
  if (windowStart < firstMiddle) {
    windowEnd += firstMiddle - windowStart;
    windowStart = firstMiddle;
  }
  if (windowEnd > lastMiddle) {
    windowStart -= windowEnd - lastMiddle;
    windowEnd = lastMiddle;
  }
  windowStart = Math.max(windowStart, firstMiddle);
  windowEnd = Math.min(windowEnd, lastMiddle);
  let freedSlots = (windowStart > firstMiddle ? 0 : 1) + (windowEnd < lastMiddle ? 0 : 1);
  while (freedSlots > 0) {
    if (windowEnd < lastMiddle) {
      windowEnd++;
    } else if (windowStart > firstMiddle) {
      windowStart--;
    } else {
      break;
    }
    freedSlots--;
  }
  const showStartEllipsis = windowStart > firstMiddle;
  const showEndEllipsis = windowEnd < lastMiddle;
  const items = [];
  range(1, boundaryCount).forEach((value) => items.push({ type: "page", value }));
  if (showStartEllipsis)
    items.push({ type: "ellipsis", position: "start" });
  range(windowStart, windowEnd).forEach((value) => items.push({ type: "page", value }));
  if (showEndEllipsis)
    items.push({ type: "ellipsis", position: "end" });
  range(totalPages - boundaryCount + 1, totalPages).forEach((value) => items.push({ type: "page", value }));
  return items;
}
export default class WaPagination extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.total = 0;
    this.pageSize = 10;
    this.page = 1;
    this.siblingCount = 2;
    this.boundaryCount = 1;
    this.withoutNav = false;
    this.withEdges = false;
    this.withSummary = false;
    this.format = "standard";
    this.hrefTemplate = "";
    this.hideSinglePage = false;
    this.label = "";
    this.appearance = "outlined";
    this.disabled = false;
    this.shouldRestoreFocus = false;
  }
  static css = styles;
  static jumpDistance = 5;
  get totalPages() {
    if (this.pageSize <= 0)
      return 1;
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
  handleDisabledChange() {
    this.customStates.set("disabled", this.disabled);
  }
  handlePageBoundsChange() {
    const clamped = clamp(Math.trunc(this.page) || 1, 1, this.totalPages);
    if (clamped !== this.page) {
      this.page = clamped;
    }
  }
  getHref(page) {
    if (!this.hrefTemplate)
      return;
    if (typeof this.hrefTemplate === "function")
      return this.hrefTemplate(page);
    return this.hrefTemplate.split("{page}").join(String(page));
  }
  async requestPage(page, restoreFocus) {
    const target = clamp(page, 1, this.totalPages);
    if (this.disabled || target === this.page)
      return;
    const beforeEvent = new WaBeforePageChangeEvent({ page: target, pageSize: this.pageSize });
    this.dispatchEvent(beforeEvent);
    if (beforeEvent.defaultPrevented)
      return;
    this.shouldRestoreFocus = restoreFocus;
    this.page = target;
    await this.updateComplete;
    this.dispatchEvent(new WaPageChangeEvent({ page: this.page, pageSize: this.pageSize }));
    this.announcePage();
  }
  restoreFocusToCurrentPage() {
    const current = this.shadowRoot?.querySelector('[part~="page-current"]');
    const active = getDeepestActiveElement();
    if (current && active && this.shadowRoot?.contains(active)) {
      current.focus();
    }
  }
  announcePage() {
    announce(this.localize.term("pageXOfY", this.page, this.totalPages), "polite");
  }
  updated() {
    if (this.shouldRestoreFocus) {
      this.shouldRestoreFocus = false;
      this.restoreFocusToCurrentPage();
    }
  }
  renderNavButton(options) {
    const { part, targetPage, enabled, label, icon, slotName } = options;
    const isDisabled = this.disabled || !enabled;
    const href = this.getHref(targetPage);
    if (href !== undefined) {
      return html`
        <li role="listitem">
          <a
            part="button ${part}"
            class="button nav-button"
            href=${ifDefined(isDisabled ? undefined : href)}
            aria-label=${label}
            aria-disabled=${isDisabled ? "true" : "false"}
          >
            <slot name=${slotName}><wa-icon library="system" name=${icon}></wa-icon></slot>
          </a>
        </li>
      `;
    }
    return html`
      <li role="listitem">
        <button
          part="button ${part}"
          class="button nav-button"
          type="button"
          aria-label=${label}
          aria-disabled=${isDisabled ? "true" : "false"}
          @click=${isDisabled ? null : () => this.requestPage(targetPage, true)}
        >
          <slot name=${slotName}><wa-icon library="system" name=${icon}></wa-icon></slot>
        </button>
      </li>
    `;
  }
  renderPage(page) {
    const isCurrent = page === this.page;
    const href = this.getHref(page);
    const label = this.localize.number(page);
    const part = `button page${isCurrent ? " page-current" : ""}`;
    if (href !== undefined) {
      return html`
        <li role="listitem">
          <a
            part=${part}
            class=${classMap({ button: true, page: true, current: isCurrent })}
            href=${ifDefined(isCurrent || this.disabled ? undefined : href)}
            aria-current=${ifDefined(isCurrent ? "page" : undefined)}
            aria-disabled=${ifDefined(this.disabled ? "true" : undefined)}
            >${label}</a
          >
        </li>
      `;
    }
    return html`
      <li role="listitem">
        <button
          part=${part}
          class=${classMap({ button: true, page: true, current: isCurrent })}
          type="button"
          aria-current=${ifDefined(isCurrent ? "page" : undefined)}
          aria-disabled=${ifDefined(this.disabled ? "true" : undefined)}
          @click=${this.disabled || isCurrent ? null : () => this.requestPage(page, true)}
        >
          ${label}
        </button>
      </li>
    `;
  }
  renderEllipsis(position, index) {
    const jump = WaPagination.jumpDistance;
    const isStart = position === "start";
    const targetPage = clamp(isStart ? this.page - jump : this.page + jump, 1, this.totalPages);
    const label = this.localize.term(isStart ? "jumpBackwardX" : "jumpForwardX", jump);
    const href = this.getHref(targetPage);
    const content = html`
      <wa-icon class="ellipsis-default" library="system" name="ellipsis" label=${label}></wa-icon>
    `;
    if (href !== undefined) {
      return html`
        <li role="listitem">
          <a
            part="ellipsis"
            class="button ellipsis"
            data-ellipsis=${index}
            href=${ifDefined(this.disabled ? undefined : href)}
            aria-label=${label}
            aria-disabled=${ifDefined(this.disabled ? "true" : undefined)}
          >
            ${content}
          </a>
        </li>
      `;
    }
    return html`
      <li role="listitem">
        <button
          part="ellipsis"
          class="button ellipsis"
          data-ellipsis=${index}
          type="button"
          aria-label=${label}
          aria-disabled=${ifDefined(this.disabled ? "true" : undefined)}
          @click=${this.disabled ? null : () => this.requestPage(targetPage, true)}
        >
          ${content}
        </button>
      </li>
    `;
  }
  render() {
    const totalPages = this.totalPages;
    if (this.hideSinglePage && totalPages <= 1) {
      return html``;
    }
    const isRtl = this.localize.dir() === "rtl";
    const onFirstPage = this.page <= 1;
    const onLastPage = this.page >= totalPages;
    if (this.format === "compact") {
      return html`
        <div class="container">
          ${this.renderSummary()}
          <nav part="base pagination" class="pagination" aria-label=${this.label || this.localize.term("pagination")}>
            <ul part="pages" class="pages" role="list">
              ${this.renderNavButton({
        part: "previous-button",
        targetPage: this.page - 1,
        enabled: !onFirstPage,
        label: this.localize.term("previousPage"),
        icon: isRtl ? "chevron-right" : "chevron-left",
        slotName: "previous-icon"
      })}
              <li role="listitem">
                <span part="label" class="label" aria-current="page">
                  ${this.localize.term("compactPageXOfY", this.page, totalPages)}
                </span>
              </li>
              ${this.renderNavButton({
        part: "next-button",
        targetPage: this.page + 1,
        enabled: !onLastPage,
        label: this.localize.term("nextPage"),
        icon: isRtl ? "chevron-left" : "chevron-right",
        slotName: "next-icon"
      })}
            </ul>
          </nav>
        </div>
      `;
    }
    const items = getPaginationRange({
      page: this.page,
      totalPages,
      siblingCount: this.siblingCount,
      boundaryCount: this.boundaryCount
    });
    let ellipsisCount = 0;
    return html`
      <div class="container">
        ${this.renderSummary()}
        <nav part="base pagination" class="pagination" aria-label=${this.label || this.localize.term("pagination")}>
          <ul part="pages" class="pages" role="list">
            ${this.withEdges ? this.renderNavButton({
      part: "first-button",
      targetPage: 1,
      enabled: !onFirstPage,
      label: this.localize.term("firstPage"),
      icon: isRtl ? "angles-right" : "angles-left",
      slotName: "first-icon"
    }) : ""}
            ${this.withoutNav ? "" : this.renderNavButton({
      part: "previous-button",
      targetPage: this.page - 1,
      enabled: !onFirstPage,
      label: this.localize.term("previousPage"),
      icon: isRtl ? "chevron-right" : "chevron-left",
      slotName: "previous-icon"
    })}
            ${items.map((item) => {
      if (item.type === "ellipsis") {
        ellipsisCount++;
        return this.renderEllipsis(item.position, ellipsisCount);
      }
      return this.renderPage(item.value);
    })}
            ${this.withoutNav ? "" : this.renderNavButton({
      part: "next-button",
      targetPage: this.page + 1,
      enabled: !onLastPage,
      label: this.localize.term("nextPage"),
      icon: isRtl ? "chevron-left" : "chevron-right",
      slotName: "next-icon"
    })}
            ${this.withEdges ? this.renderNavButton({
      part: "last-button",
      targetPage: totalPages,
      enabled: !onLastPage,
      label: this.localize.term("lastPage"),
      icon: isRtl ? "angles-left" : "angles-right",
      slotName: "last-icon"
    }) : ""}
          </ul>
        </nav>
      </div>
    `;
  }
  renderSummary() {
    if (!this.withSummary)
      return "";
    const start = this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.total);
    return html`
      <span part="summary" class="summary"> ${this.localize.term("showingXtoYofZ", start, end, this.total)} </span>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaPagination.prototype, "total", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "page-size", type: Number })
], WaPagination.prototype, "pageSize", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaPagination.prototype, "page", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "sibling-count", type: Number })
], WaPagination.prototype, "siblingCount", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "boundary-count", type: Number })
], WaPagination.prototype, "boundaryCount", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "without-nav", type: Boolean })
], WaPagination.prototype, "withoutNav", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-edges", type: Boolean })
], WaPagination.prototype, "withEdges", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "with-summary", type: Boolean })
], WaPagination.prototype, "withSummary", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaPagination.prototype, "format", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "href-template" })
], WaPagination.prototype, "hrefTemplate", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "hide-single-page", type: Boolean })
], WaPagination.prototype, "hideSinglePage", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaPagination.prototype, "label", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaPagination.prototype, "appearance", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaPagination.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaPagination.prototype, "shouldRestoreFocus", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled", { waitUntilFirstUpdate: true })
], WaPagination.prototype, "handleDisabledChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("page"),
  watch("total"),
  watch("pageSize")
], WaPagination.prototype, "handlePageBoundsChange", null);
WaPagination = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-pagination")
], WaPagination);
