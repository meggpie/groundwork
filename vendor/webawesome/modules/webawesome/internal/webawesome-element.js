import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../shims/bun-wrap.js";
import { LitElement, isServer } from "../../lit/lit/index.js";
import { property } from "../../lit/lit/decorators.js";
import hostStyles from "../styles/component/host.styles.js";
const HAS_ENDING_COLON = /;\s+$/;
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
function buildStyleAttribute(options) {
  const { property, value, element } = options;
  if (value) {
    let style = element.getAttribute("style") || "";
    if (style) {
      if (!style.match(HAS_ENDING_COLON)) {
        style += ";";
      }
      style += " ";
    }
    const str = `${property}: ${value}`;
    if (style.includes(str)) {
      return;
    }
    return `${style}${str};`;
  }
  return null;
}
export default class WebAwesomeElement extends LitElement {
  static css;
  static get styles() {
    const styles = Array.isArray(this.css) ? this.css : this.css ? [this.css] : [];
    return [hostStyles, ...styles];
  }
  #hasRecordedInitialProperties;
  constructor() {
    super();
    this.#hasRecordedInitialProperties = false;
    this.initialReflectedProperties = new Map;
    this.didSSR = isServer || Boolean(this.shadowRoot);
    this.customStates = {
      set: (customState, active) => {
        if (!Boolean(this.internals?.states))
          return;
        try {
          if (active) {
            this.internals.states.add(customState);
          } else {
            this.internals.states.delete(customState);
          }
        } catch (e) {
          if (String(e).includes("must start with '--'")) {
            console.error("Your browser implements an outdated version of CustomStateSet. Consider using a polyfill");
          } else {
            throw e;
          }
        }
      },
      has: (customState) => {
        if (!Boolean(this.internals?.states))
          return false;
        try {
          return this.internals.states.has(customState);
        } catch {
          return false;
        }
      }
    };
    try {
      this.internals = this.attachInternals();
    } catch {
      console.error("Element internals are not supported in your browser. Consider using a polyfill");
    }
    this.customStates.set("wa-defined", true);
    let Self = this.constructor;
    for (let [property, spec] of Self.elementProperties) {
      if (spec.default === "inherit" && spec.initial !== undefined && typeof property === "string") {
        this.customStates.set(`initial-${property}-${spec.initial}`, true);
      }
    }
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.didSSR) {
      this.shadowRoot?.prepend(document.createComment(` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-", "")} `));
    }
    if (this.didSSR) {
      this.updateComplete.then(() => {
        this.shadowRoot?.prepend(document.createComment(` Web Awesome: https://webawesome.com/docs/components/${this.localName.replace("wa-", "")} `));
      });
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.#hasRecordedInitialProperties) {
      this.constructor.elementProperties.forEach((obj, prop) => {
        if (obj.reflect && this[prop] != null) {
          this.initialReflectedProperties.set(prop, this[prop]);
        }
      });
      this.#hasRecordedInitialProperties = true;
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    this.initialReflectedProperties.forEach((value, prop) => {
      if (changedProperties.has(prop) && this[prop] == null) {
        this[prop] = value;
      }
    });
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.didSSR) {
      this.shadowRoot?.querySelectorAll("slot").forEach((slotElement) => {
        slotElement.dispatchEvent(new Event("slotchange", { bubbles: true, composed: false, cancelable: false }));
      });
    }
  }
  update(changedProperties) {
    try {
      super.update(changedProperties);
    } catch (e) {
      if (this.didSSR && !this.hasUpdated) {
        const event = new Event("lit-hydration-error", { bubbles: true, composed: true, cancelable: false });
        event.error = e;
        this.dispatchEvent(event);
      }
      throw e;
    }
  }
  setStyle(property, value) {
    if (!this.style) {
      const str = buildStyleAttribute({
        property: camelToKebab(property),
        value,
        element: this
      });
      if (str) {
        this.setAttribute("style", str);
      }
      return;
    }
    this.style[property] = value;
  }
  setStyleProperty(property, value) {
    if (!this.style) {
      const str = buildStyleAttribute({
        property,
        value,
        element: this
      });
      if (str) {
        this.setAttribute("style", str);
      }
      return;
    }
    this.style.setProperty(property, value);
  }
  relayNativeEvent(event, eventOptions) {
    event.stopImmediatePropagation();
    this.dispatchEvent(new event.constructor(event.type, {
      ...event,
      ...eventOptions
    }));
  }
}
__legacyDecorateClassTS_3r173x8m([
  property()
], WebAwesomeElement.prototype, "dir", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WebAwesomeElement.prototype, "lang", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true, attribute: "did-ssr" })
], WebAwesomeElement.prototype, "didSSR", undefined);
