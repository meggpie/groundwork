import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { WaMutationEvent } from "../../events/mutation.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./mutation-observer.styles.js";
export default class WaMutationObserver extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.attrOldValue = false;
    this.charData = false;
    this.charDataOldValue = false;
    this.childList = false;
    this.disabled = false;
    this.handleMutation = (mutationList) => {
      this.dispatchEvent(new WaMutationEvent({ mutationList }));
    };
  }
  static css = styles;
  connectedCallback() {
    super.connectedCallback();
    if (typeof MutationObserver !== "undefined") {
      this.mutationObserver = new MutationObserver(this.handleMutation);
      if (!this.disabled) {
        this.startObserver();
      }
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopObserver();
  }
  startObserver() {
    const observeAttributes = typeof this.attr === "string" && this.attr.length > 0;
    const attributeFilter = observeAttributes && this.attr !== "*" ? this.attr.split(" ") : undefined;
    try {
      this.mutationObserver.observe(this, {
        subtree: true,
        childList: this.childList,
        attributes: observeAttributes,
        attributeFilter,
        attributeOldValue: this.attrOldValue,
        characterData: this.charData,
        characterDataOldValue: this.charDataOldValue
      });
    } catch {}
  }
  stopObserver() {
    this.mutationObserver.disconnect();
  }
  handleDisabledChange() {
    if (this.disabled) {
      this.stopObserver();
    } else {
      this.startObserver();
    }
  }
  handleChange() {
    this.stopObserver();
    this.startObserver();
  }
  render() {
    return html` <slot></slot> `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaMutationObserver.prototype, "attr", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "attr-old-value", type: Boolean, reflect: true })
], WaMutationObserver.prototype, "attrOldValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "char-data", type: Boolean, reflect: true })
], WaMutationObserver.prototype, "charData", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "char-data-old-value", type: Boolean, reflect: true })
], WaMutationObserver.prototype, "charDataOldValue", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "child-list", type: Boolean, reflect: true })
], WaMutationObserver.prototype, "childList", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaMutationObserver.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("disabled")
], WaMutationObserver.prototype, "handleDisabledChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("attr", { waitUntilFirstUpdate: true }),
  watch("attr-old-value", { waitUntilFirstUpdate: true }),
  watch("char-data", { waitUntilFirstUpdate: true }),
  watch("char-data-old-value", { waitUntilFirstUpdate: true }),
  watch("childList", { waitUntilFirstUpdate: true })
], WaMutationObserver.prototype, "handleChange", null);
WaMutationObserver = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-mutation-observer")
], WaMutationObserver);
