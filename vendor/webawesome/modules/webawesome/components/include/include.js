import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property } from "../../../lit/lit/decorators.js";
import { WaIncludeErrorEvent } from "../../events/include-error.js";
import { WaLoadEvent } from "../../events/load.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import styles from "./include.styles.js";
import { requestInclude } from "./request.js";
export default class WaInclude extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.mode = "cors";
    this.allowScripts = false;
  }
  static css = styles;
  executeScript(script) {
    const newScript = document.createElement("script");
    [...script.attributes].forEach((attr) => newScript.setAttribute(attr.name, attr.value));
    newScript.textContent = script.textContent;
    script.parentNode.replaceChild(newScript, script);
  }
  cloneFragment(element, ownerDocument) {
    const content = element.localName === "template" ? element.content : this.childNodesToFragment(element);
    return ownerDocument.importNode(content, true);
  }
  childNodesToFragment(element) {
    const fragment = element.ownerDocument.createDocumentFragment();
    element.childNodes.forEach((child) => fragment.append(child.cloneNode(true)));
    return fragment;
  }
  async handleSrcChange() {
    try {
      const src = this.src;
      const url = new URL(src, document.baseURI);
      const fragmentId = url.hash.slice(1);
      if (src.startsWith("#")) {
        const element = fragmentId ? document.getElementById(decodeURIComponent(fragmentId)) : null;
        if (element) {
          this.replaceChildren(this.cloneFragment(element, document));
        } else {
          this.replaceChildren();
        }
        this.dispatchEvent(new WaLoadEvent);
        return;
      }
      let fetchSrc = src;
      if (fragmentId) {
        url.hash = "";
        fetchSrc = url.href;
      }
      const file = await requestInclude(fetchSrc, this.mode);
      if (src !== this.src) {
        return;
      }
      if (!file.ok) {
        this.dispatchEvent(new WaIncludeErrorEvent({ status: file.status }));
        return;
      }
      if (fragmentId) {
        const doc = new DOMParser().parseFromString(file.html, "text/html");
        const element = doc.getElementById(decodeURIComponent(fragmentId));
        if (!element) {
          this.dispatchEvent(new WaIncludeErrorEvent({ status: file.status }));
          return;
        }
        this.replaceChildren(this.cloneFragment(element, document));
      } else {
        this.innerHTML = file.html;
      }
      if (this.allowScripts) {
        [...this.querySelectorAll("script")].forEach((script) => this.executeScript(script));
      }
      this.dispatchEvent(new WaLoadEvent);
    } catch {
      this.dispatchEvent(new WaIncludeErrorEvent({ status: -1 }));
    }
  }
  render() {
    return html`<slot></slot>`;
  }
}
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInclude.prototype, "src", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaInclude.prototype, "mode", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "allow-scripts", type: Boolean })
], WaInclude.prototype, "allowScripts", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("src")
], WaInclude.prototype, "handleSrcChange", null);
WaInclude = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-include")
], WaInclude);
