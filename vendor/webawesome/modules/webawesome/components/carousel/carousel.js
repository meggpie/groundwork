import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import"../../internal/scrollend-polyfill.js";
import { html, isServer } from "../../../lit/lit/index.js";
import { customElement, eventOptions, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { map } from "../../../lit/lit/directives/map.js";
import { range } from "../../../lit/lit/directives/range.js";
import { styleMap } from "../../../lit/lit/directives/style-map.js";
import { WaSlideChangeEvent } from "../../events/slide-change.js";
import { prefersReducedMotion } from "../../internal/animate.js";
import { waitForEvent } from "../../internal/event.js";
import { clamp } from "../../internal/math.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import { AutoplayController } from "./autoplay-controller.js";
import styles from "./carousel.styles.js";
export default class WaCarousel extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.loop = false;
    this.slides = 0;
    this.currentSlide = 0;
    this.navigation = false;
    this.pagination = false;
    this.autoplay = false;
    this.autoplayInterval = 3000;
    this.slidesPerPage = 1;
    this.slidesPerMove = 1;
    this.orientation = "horizontal";
    this.mouseDragging = false;
    this.activeSlide = 0;
    this.scrolling = false;
    this.dragging = false;
    this.awaitingInitialPosition = false;
    this.autoplayController = new AutoplayController(this, () => this.next());
    this.dragStartPosition = [-1, -1];
    this.localize = new LocalizeController(this);
    this.pendingSlideChange = false;
    this.handleMouseDrag = (event) => {
      if (!this.dragging) {
        this.scrollContainer.style.setProperty("scroll-snap-type", "none");
        this.dragging = true;
        this.dragStartPosition = [event.clientX, event.clientY];
      }
      this.scrollContainer.scrollBy({
        left: -event.movementX,
        top: -event.movementY,
        behavior: "instant"
      });
    };
    this.handleMouseDragEnd = () => {
      const scrollContainer = this.scrollContainer;
      document.removeEventListener("pointermove", this.handleMouseDrag, { capture: true });
      const startLeft = scrollContainer.scrollLeft;
      const startTop = scrollContainer.scrollTop;
      scrollContainer.style.removeProperty("scroll-snap-type");
      scrollContainer.style.setProperty("overflow", "hidden");
      const finalLeft = scrollContainer.scrollLeft;
      const finalTop = scrollContainer.scrollTop;
      scrollContainer.style.removeProperty("overflow");
      scrollContainer.style.setProperty("scroll-snap-type", "none");
      scrollContainer.scrollTo({ left: startLeft, top: startTop, behavior: "instant" });
      requestAnimationFrame(async () => {
        if (startLeft !== finalLeft || startTop !== finalTop) {
          scrollContainer.scrollTo({
            left: finalLeft,
            top: finalTop,
            behavior: prefersReducedMotion() ? "auto" : "smooth"
          });
          await waitForEvent(scrollContainer, "scrollend");
        }
        scrollContainer.style.removeProperty("scroll-snap-type");
        this.dragging = false;
        this.dragStartPosition = [-1, -1];
        this.handleScrollEnd();
      });
    };
    this.handleSlotChange = (mutations) => {
      const needsInitialization = mutations.some((mutation) => [...mutation.addedNodes, ...mutation.removedNodes].some((el) => this.isCarouselItem(el) && !el.hasAttribute("data-clone")));
      if (needsInitialization) {
        this.initializeSlides();
      }
      this.requestUpdate();
    };
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.setAttribute("role", "region");
      this.setAttribute("aria-label", this.localize.term("carousel"));
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.initializeSlides();
    this.mutationObserver = new MutationObserver(this.handleSlotChange);
    this.mutationObserver.observe(this, {
      childList: true,
      subtree: true
    });
    const startedHidden = this.loop && !this.scrollContainer?.clientWidth && !this.scrollContainer?.clientHeight;
    if (startedHidden) {
      this.awaitingInitialPosition = true;
    }
    this.resizeObserver = new ResizeObserver(() => {
      if (this.scrollContainer?.clientWidth || this.scrollContainer?.clientHeight) {
        this.goToSlide(this.activeSlide, "auto");
        this.synchronizeSlides();
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
        if (this.awaitingInitialPosition) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.awaitingInitialPosition = false;
            });
          });
        }
      }
    });
    this.resizeObserver.observe(this);
  }
  willUpdate(changedProperties) {
    if (changedProperties.has("slidesPerMove") || changedProperties.has("slidesPerPage")) {
      this.slidesPerMove = Math.min(this.slidesPerMove, this.slidesPerPage);
    }
  }
  getPageCount() {
    const slidesCount = this.getSlides().length;
    const { slidesPerPage, slidesPerMove, loop } = this;
    const pages = loop ? slidesCount / slidesPerMove : (slidesCount - slidesPerPage) / slidesPerMove + 1;
    return Math.ceil(pages);
  }
  getCurrentPage() {
    return Math.ceil(this.activeSlide / this.slidesPerMove);
  }
  canScrollNext() {
    return this.loop || this.getCurrentPage() < this.getPageCount() - 1;
  }
  canScrollPrev() {
    return this.loop || this.getCurrentPage() > 0;
  }
  getSlides({ excludeClones = true } = {}) {
    return [...this.children].filter((el) => this.isCarouselItem(el) && (!excludeClones || !el.hasAttribute("data-clone")));
  }
  handleClick(event) {
    if (this.dragging && this.dragStartPosition[0] > 0 && this.dragStartPosition[1] > 0) {
      const deltaX = Math.abs(this.dragStartPosition[0] - event.clientX);
      const deltaY = Math.abs(this.dragStartPosition[1] - event.clientY);
      const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (delta >= 10) {
        event.preventDefault();
      }
    }
  }
  handleKeyDown(event) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      const target = event.target;
      const isRtl = this.localize.dir() === "rtl";
      const isFocusInPagination = target.closest('[part~="pagination-item"]') !== null;
      const isNext = event.key === "ArrowDown" || !isRtl && event.key === "ArrowRight" || isRtl && event.key === "ArrowLeft";
      const isPrevious = event.key === "ArrowUp" || !isRtl && event.key === "ArrowLeft" || isRtl && event.key === "ArrowRight";
      event.preventDefault();
      if (isPrevious) {
        this.previous();
      }
      if (isNext) {
        this.next();
      }
      if (event.key === "Home") {
        this.goToSlide(0);
      }
      if (event.key === "End") {
        this.goToSlide(this.getSlides().length - 1);
      }
      if (isFocusInPagination) {
        this.updateComplete.then(() => {
          const activePaginationItem = this.shadowRoot?.querySelector('[part~="pagination-item-active"]');
          if (activePaginationItem) {
            activePaginationItem.focus();
          }
        });
      }
    }
  }
  handleMouseDragStart(event) {
    const canDrag = this.mouseDragging && event.button === 0;
    if (canDrag) {
      event.preventDefault();
      document.addEventListener("pointermove", this.handleMouseDrag, { capture: true, passive: true });
      document.addEventListener("pointerup", this.handleMouseDragEnd, { capture: true, once: true });
    }
  }
  handleScroll() {
    this.scrolling = true;
    if (!this.pendingSlideChange) {
      this.synchronizeSlides();
    }
  }
  synchronizeSlides() {
    const io = new IntersectionObserver((entries) => {
      io.disconnect();
      for (const entry of entries) {
        const slide = entry.target;
        slide.toggleAttribute("inert", !entry.isIntersecting);
        slide.classList.toggle("--in-view", entry.isIntersecting);
        slide.setAttribute("aria-hidden", entry.isIntersecting ? "false" : "true");
      }
      const firstIntersecting = entries.find((entry) => entry.isIntersecting);
      if (!firstIntersecting) {
        return;
      }
      const slidesWithClones = this.getSlides({ excludeClones: false });
      const slidesCount = this.getSlides().length;
      const slideIndex = slidesWithClones.indexOf(firstIntersecting.target);
      const normalizedIndex = this.loop ? slideIndex - this.slidesPerPage : slideIndex;
      if (firstIntersecting) {
        this.activeSlide = (Math.ceil(normalizedIndex / this.slidesPerMove) * this.slidesPerMove + slidesCount) % slidesCount;
        if (!this.scrolling && !this.pendingSlideChange) {
          if (this.loop && firstIntersecting.target.hasAttribute("data-clone")) {
            const clonePosition = Number(firstIntersecting.target.getAttribute("data-clone"));
            this.goToSlide(clonePosition, "instant");
          }
        }
      }
    }, {
      root: this.scrollContainer,
      threshold: 0.6
    });
    this.getSlides({ excludeClones: false }).forEach((slide) => {
      io.observe(slide);
    });
  }
  handleScrollEnd() {
    if (!this.scrolling || this.dragging)
      return;
    this.synchronizeSlides();
    this.scrolling = false;
    this.pendingSlideChange = false;
    this.synchronizeSlides();
  }
  isCarouselItem(node) {
    return node instanceof Element && node.tagName.toLowerCase() === "wa-carousel-item";
  }
  initializeSlides() {
    this.getSlides({ excludeClones: false }).forEach((slide, index) => {
      slide.classList.remove("--in-view");
      slide.classList.remove("--is-active");
      slide.setAttribute("aria-label", this.localize.term("slideNum", index + 1));
      if (slide.hasAttribute("data-clone")) {
        slide.remove();
      }
    });
    this.updateSlidesSnap();
    if (this.loop) {
      this.createClones();
    }
    this.goToSlide(this.activeSlide, "auto");
    this.synchronizeSlides();
  }
  createClones() {
    const slides = this.getSlides();
    const slidesPerPage = this.slidesPerPage;
    const lastSlides = slides.slice(-slidesPerPage);
    const firstSlides = slides.slice(0, slidesPerPage);
    lastSlides.reverse().forEach((slide, i) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-clone", String(slides.length - i - 1));
      this.prepend(clone);
    });
    firstSlides.forEach((slide, i) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute("data-clone", String(i));
      this.append(clone);
    });
  }
  handleSlideChange() {
    const slides = this.getSlides();
    slides.forEach((slide, i) => {
      slide.classList.toggle("--is-active", i === this.activeSlide);
    });
    if (this.hasUpdated) {
      this.dispatchEvent(new WaSlideChangeEvent({
        index: this.activeSlide,
        slide: slides[this.activeSlide]
      }));
    }
  }
  updateSlidesSnap() {
    const slides = this.getSlides();
    const slidesPerMove = this.slidesPerMove;
    slides.forEach((slide, i) => {
      const shouldSnap = (i + slidesPerMove) % slidesPerMove === 0;
      if (shouldSnap) {
        slide.style.removeProperty("scroll-snap-align");
      } else {
        slide.style.setProperty("scroll-snap-align", "none");
      }
    });
  }
  handleAutoplayChange() {
    this.autoplayController.stop();
    if (this.autoplay) {
      this.autoplayController.start(this.autoplayInterval);
    }
  }
  previous(behavior = "smooth") {
    this.goToSlide(this.activeSlide - this.slidesPerMove, behavior);
  }
  next(behavior = "smooth") {
    this.goToSlide(this.activeSlide + this.slidesPerMove, behavior);
  }
  addSlide(slide) {
    if (!this.isCarouselItem(slide)) {
      throw new TypeError("addSlide() expects a <wa-carousel-item>.");
    }
    if (slide.hasAttribute("data-clone")) {
      throw new TypeError("addSlide() cannot add a cloned carousel item.");
    }
    const slides = this.getSlides();
    const lastSlide = slides[slides.length - 1];
    this.insertBefore(slide, lastSlide?.nextElementSibling ?? null);
  }
  removeSlide(index) {
    if (!Number.isInteger(index)) {
      return;
    }
    const slides = this.getSlides();
    const slide = slides[index];
    if (!slide) {
      return;
    }
    const lastIndexAfterRemoval = Math.max(0, slides.length - 2);
    if (index < this.activeSlide) {
      this.activeSlide = Math.max(0, this.activeSlide - 1);
    } else if (index === this.activeSlide) {
      this.activeSlide = clamp(this.activeSlide, 0, lastIndexAfterRemoval);
    }
    slide.remove();
  }
  goToSlide(index, behavior = "smooth") {
    const { slidesPerPage, loop } = this;
    const slides = this.getSlides();
    const slidesWithClones = this.getSlides({ excludeClones: false });
    if (!slides.length) {
      return;
    }
    const newActiveSlide = loop ? (index + slides.length) % slides.length : clamp(index, 0, slides.length - slidesPerPage);
    this.activeSlide = newActiveSlide;
    const isRtl = this.localize.dir() === "rtl";
    const nextSlideIndex = clamp(index + (loop ? slidesPerPage : 0) + (isRtl ? slidesPerPage - 1 : 0), 0, slidesWithClones.length - 1);
    const nextSlide = slidesWithClones[nextSlideIndex];
    this.scrollToSlide(nextSlide, prefersReducedMotion() ? "auto" : behavior);
  }
  scrollToSlide(slide, behavior = "smooth") {
    this.pendingSlideChange = true;
    window.requestAnimationFrame(() => {
      if (!this.scrollContainer) {
        return;
      }
      const scrollContainer = this.scrollContainer;
      const scrollContainerRect = scrollContainer.getBoundingClientRect();
      const nextSlideRect = slide.getBoundingClientRect();
      const nextLeft = nextSlideRect.left - scrollContainerRect.left;
      const nextTop = nextSlideRect.top - scrollContainerRect.top;
      if (nextLeft || nextTop) {
        this.pendingSlideChange = true;
        scrollContainer.scrollTo({
          left: nextLeft + scrollContainer.scrollLeft,
          top: nextTop + scrollContainer.scrollTop,
          behavior
        });
      } else {
        this.pendingSlideChange = false;
      }
    });
  }
  render() {
    const { slidesPerMove, scrolling } = this;
    let pagesCount = 0;
    let currentPage = 0;
    let prevEnabled = false;
    let nextEnabled = false;
    if (this.hasUpdated) {
      pagesCount = this.getPageCount();
      currentPage = this.getCurrentPage();
      prevEnabled = this.canScrollPrev();
      nextEnabled = this.canScrollNext();
    }
    const isRTL = isServer ? this.dir === "rtl" : this.localize.dir() === "rtl";
    return html`
      <div part="base carousel" class="carousel">
        <div
          id="scroll-container"
          part="scroll-container"
          class="${classMap({
      slides: true,
      "slides-horizontal": this.orientation === "horizontal",
      "slides-vertical": this.orientation === "vertical",
      "slides-dragging": this.dragging,
      "slides-awaiting-position": this.awaitingInitialPosition
    })}"
          style=${styleMap({ "--slides-per-page": this.slidesPerPage })}
          aria-busy="${scrolling ? "true" : "false"}"
          aria-atomic="true"
          tabindex="0"
          @keydown=${this.handleKeyDown}
          @mousedown="${this.handleMouseDragStart}"
          @scroll="${this.handleScroll}"
          @scrollend=${this.handleScrollEnd}
          @click=${this.handleClick}
        >
          <slot @slotchange=${() => this.requestUpdate()}></slot>
        </div>

        ${this.navigation ? html`
              <div part="navigation" class="navigation">
                <button
                  part="navigation-button navigation-button-previous"
                  class="${classMap({
      "navigation-button": true,
      "navigation-button-previous": true,
      "navigation-button-disabled": !prevEnabled
    })}"
                  aria-label="${this.localize.term("previousSlide")}"
                  aria-controls="scroll-container"
                  aria-disabled="${prevEnabled ? "false" : "true"}"
                  @click=${prevEnabled ? () => this.previous() : null}
                >
                  <slot name="previous-icon">
                    <wa-icon library="system" name="${isRTL ? "chevron-right" : "chevron-left"}"></wa-icon>
                  </slot>
                </button>

                <button
                  part="navigation-button navigation-button-next"
                  class=${classMap({
      "navigation-button": true,
      "navigation-button-next": true,
      "navigation-button-disabled": !nextEnabled
    })}
                  aria-label="${this.localize.term("nextSlide")}"
                  aria-controls="scroll-container"
                  aria-disabled="${nextEnabled ? "false" : "true"}"
                  @click=${nextEnabled ? () => this.next() : null}
                >
                  <slot name="next-icon">
                    <wa-icon library="system" name="${isRTL ? "chevron-left" : "chevron-right"}"></wa-icon>
                  </slot>
                </button>
              </div>
            ` : ""}
        ${this.pagination ? html`
              <div
                part="pagination"
                role="tablist"
                class="${classMap({
      pagination: true,
      "pagination-awaiting-position": this.awaitingInitialPosition
    })}"
                aria-controls="scroll-container"
              >
                ${map(range(pagesCount), (index) => {
      const isActive = index === currentPage;
      return html`
                    <button
                      part="pagination-item ${isActive ? "pagination-item-active" : ""}"
                      class="${classMap({
        "pagination-item": true,
        "pagination-item-active": isActive
      })}"
                      role="tab"
                      aria-selected="${isActive ? "true" : "false"}"
                      aria-label="${this.localize.term("goToSlide", index + 1, pagesCount)}"
                      tabindex=${isActive ? "0" : "-1"}
                      @click=${() => this.goToSlide(index * slidesPerMove)}
                      @keydown=${this.handleKeyDown}
                    ></button>
                  `;
    })}
              </div>
            ` : html``}
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCarousel.prototype, "loop", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaCarousel.prototype, "slides", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, reflect: true })
], WaCarousel.prototype, "currentSlide", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCarousel.prototype, "navigation", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCarousel.prototype, "pagination", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCarousel.prototype, "autoplay", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, attribute: "autoplay-interval" })
], WaCarousel.prototype, "autoplayInterval", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, attribute: "slides-per-page" })
], WaCarousel.prototype, "slidesPerPage", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Number, attribute: "slides-per-move" })
], WaCarousel.prototype, "slidesPerMove", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaCarousel.prototype, "orientation", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true, attribute: "mouse-dragging" })
], WaCarousel.prototype, "mouseDragging", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".slides")
], WaCarousel.prototype, "scrollContainer", undefined);
__legacyDecorateClassTS_3r173x8m([
  query(".pagination")
], WaCarousel.prototype, "paginationContainer", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaCarousel.prototype, "activeSlide", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaCarousel.prototype, "scrolling", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaCarousel.prototype, "dragging", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaCarousel.prototype, "awaitingInitialPosition", undefined);
__legacyDecorateClassTS_3r173x8m([
  eventOptions({ passive: true })
], WaCarousel.prototype, "handleScroll", null);
__legacyDecorateClassTS_3r173x8m([
  watch("loop", { waitUntilFirstUpdate: true }),
  watch("slidesPerPage", { waitUntilFirstUpdate: true })
], WaCarousel.prototype, "initializeSlides", null);
__legacyDecorateClassTS_3r173x8m([
  watch("activeSlide")
], WaCarousel.prototype, "handleSlideChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("slidesPerMove")
], WaCarousel.prototype, "updateSlidesSnap", null);
__legacyDecorateClassTS_3r173x8m([
  watch("autoplay")
], WaCarousel.prototype, "handleAutoplayChange", null);
WaCarousel = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-carousel")
], WaCarousel);
