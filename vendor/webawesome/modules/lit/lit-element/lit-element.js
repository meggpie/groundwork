import { ReactiveElement } from "../reactive-element/reactive-element.js";
import { render, noChange } from "../lit-html/lit-html.js";

export * from "../reactive-element/reactive-element.js";
export * from "../lit-html/lit-html.js";
const JSCompiler_renameProperty = (prop, _obj) => prop;
const DEV_MODE = false;
const global = globalThis;
let issueWarning;
if (DEV_MODE) {
  global.litIssuedWarnings ??= new Set;
  issueWarning = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!global.litIssuedWarnings.has(warning) && !global.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global.litIssuedWarnings.add(warning);
    }
  };
}

export class LitElement extends ReactiveElement {
  constructor() {
    super(...arguments);
    this.renderOptions = { host: this };
    this.__childPart = undefined;
  }
  static ["_$litElement$"] = true;
  createRenderRoot() {
    const renderRoot = super.createRenderRoot();
    this.renderOptions.renderBefore ??= renderRoot.firstChild;
    return renderRoot;
  }
  update(changedProperties) {
    const value = this.render();
    if (!this.hasUpdated) {
      this.renderOptions.isConnected = this.isConnected;
    }
    super.update(changedProperties);
    this.__childPart = render(value, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback();
    this.__childPart?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.__childPart?.setConnected(false);
  }
  render() {
    return noChange;
  }
}
LitElement[JSCompiler_renameProperty("finalized", LitElement)] = true;
global.litElementHydrateSupport?.({ LitElement });
const polyfillSupport = DEV_MODE ? global.litElementPolyfillSupportDevMode : global.litElementPolyfillSupport;
polyfillSupport?.({ LitElement });
export const _$LE = {
  _$attributeToProperty: (el, name, value) => {
    el._$attributeToProperty(name, value);
  },
  _$changedProperties: (el) => el._$changedProperties
};
(global.litElementVersions ??= []).push("4.2.2");
if (DEV_MODE && global.litElementVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions ` + `is not recommended.`);
  });
}
