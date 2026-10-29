import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, state } from "../../../lit/lit/decorators.js";
import { WaContentChangeEvent } from "../../events/random-content-change.js";
import { prefersReducedMotion } from "../../internal/animate.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import visuallyHidden from "../../styles/component/visually-hidden.styles.js";
import { AutoplayController } from "../carousel/autoplay-controller.js";
import styles from "./random-content.styles.js";
if (typeof document !== "undefined") {
  const sheet = new CSSStyleSheet;
  sheet.replaceSync(`
    @keyframes wa-rc-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes wa-rc-fade-up {
      from { opacity: 0; transform: translateY(var(--animation-translate, 0.5em)); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes wa-rc-fade-down {
      from { opacity: 0; transform: translateY(calc(-1 * var(--animation-translate, 0.5em))); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes wa-rc-fade-left {
      from { opacity: 0; transform: translateX(var(--animation-translate, 0.5em)); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes wa-rc-fade-right {
      from { opacity: 0; transform: translateX(calc(-1 * var(--animation-translate, 0.5em))); }
      to { opacity: 1; transform: translateX(0); }
    }
  `);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}
export default class WaRandomContent extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.sequenceCursor = 0;
    this.uniqueQueue = [];
    this.currentSelection = new Set;
    this.isInitialSelection = true;
    this.autoplayController = new AutoplayController(this, () => this.randomize());
    this.animationCleanups = new WeakMap;
    this.liveAnnouncement = "";
    this.items = 1;
    this.mode = "unique";
    this.autoplay = false;
    this.autoplayInterval = 3000;
    this.animation = "none";
  }
  static css = [styles, visuallyHidden];
  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated)
      this.syncAutoplay();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.syncAutoplay();
  }
  handleAutoplayChange() {
    this.syncAutoplay();
  }
  handleModeChange() {
    this.sequenceCursor = 0;
    this.uniqueQueue = [];
    this.currentSelection.clear();
    this.randomize();
  }
  handleItemsChange() {
    this.uniqueQueue = [];
    this.randomize();
  }
  randomize() {
    const children = this.assignedChildren();
    if (!children.length)
      return [];
    const count = Math.min(Math.max(1, this.items), children.length);
    let selected;
    if (this.mode === "sequence") {
      selected = [];
      Array.from({ length: count }).forEach((_, i) => {
        selected.push(children[(this.sequenceCursor + i) % children.length]);
      });
      this.sequenceCursor = (this.sequenceCursor + count) % children.length;
    } else if (this.mode === "unique") {
      if (this.uniqueQueue.length < count) {
        const queued = new Set(this.uniqueQueue);
        const rest = children.filter((c) => !this.currentSelection.has(c) && !queued.has(c));
        const current = children.filter((c) => this.currentSelection.has(c) && !queued.has(c));
        this.uniqueQueue.push(...this.sample(rest, rest.length), ...this.sample(current, current.length));
        if (this.uniqueQueue.length < count) {
          this.uniqueQueue = this.sample([...children], children.length);
        }
      }
      selected = this.uniqueQueue.splice(0, count);
      this.currentSelection = new Set(selected);
    } else {
      const pool = children.filter((c) => !this.currentSelection.has(c));
      selected = this.sample(pool.length >= count ? pool : children, count);
      this.currentSelection = new Set(selected);
    }
    const firstShown = selected[0];
    const lastShown = selected[selected.length - 1];
    children.forEach((el) => {
      const htmlEl = el;
      const isSelected = selected.includes(el);
      delete htmlEl.dataset["waAnimation"];
      htmlEl.style.display = "";
      htmlEl.hidden = !isSelected;
      htmlEl.style.marginBlockStart = isSelected && el === firstShown ? "0" : "";
      htmlEl.style.marginBlockEnd = isSelected && el === lastShown ? "0" : "";
    });
    if (this.animation !== "none" && !prefersReducedMotion()) {
      selected.forEach((el) => {
        const htmlEl = el;
        if (this.animation !== "fade" && getComputedStyle(el).display === "inline") {
          htmlEl.style.display = "inline-block";
        }
        el.getAnimations().forEach((a) => a.cancel());
        htmlEl.dataset["waAnimation"] = this.animation;
        this.animationCleanups.get(el)?.abort();
        const cleanup = new AbortController;
        this.animationCleanups.set(el, cleanup);
        htmlEl.addEventListener("animationend", () => delete htmlEl.dataset["waAnimation"], {
          once: true,
          signal: cleanup.signal
        });
      });
    }
    if (this.isInitialSelection) {
      this.isInitialSelection = false;
    } else {
      this.liveAnnouncement = selected.map((el) => el.textContent?.trim()).filter(Boolean).join(", ");
    }
    this.dispatchEvent(new WaContentChangeEvent({ items: selected }));
    return selected;
  }
  syncAutoplay() {
    this.autoplayController.stop();
    if (this.autoplay && this.autoplayInterval > 0) {
      this.autoplayController.start(this.autoplayInterval);
    }
  }
  assignedChildren() {
    const slot = this.shadowRoot?.querySelector("slot");
    return slot?.assignedElements() ?? [];
  }
  sample(pool, count) {
    const arr = [...pool];
    Array.from({ length: count }).forEach((_, i) => {
      const j = i + Math.floor(Math.random() * (arr.length - i));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    });
    return arr.slice(0, count);
  }
  handleSlotChange() {
    this.randomize();
  }
  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
      <div class="wa-visually-hidden" role="status" aria-live="polite" aria-atomic="true">${this.liveAnnouncement}</div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  state()
], WaRandomContent.prototype, "liveAnnouncement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number })
], WaRandomContent.prototype, "items", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRandomContent.prototype, "mode", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaRandomContent.prototype, "autoplay", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, attribute: "autoplay-interval" })
], WaRandomContent.prototype, "autoplayInterval", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaRandomContent.prototype, "animation", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch(["autoplay", "autoplayInterval"], { waitUntilFirstUpdate: true })
], WaRandomContent.prototype, "handleAutoplayChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("mode", { waitUntilFirstUpdate: true })
], WaRandomContent.prototype, "handleModeChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("items", { waitUntilFirstUpdate: true })
], WaRandomContent.prototype, "handleItemsChange", null);
WaRandomContent = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-random-content")
], WaRandomContent);
