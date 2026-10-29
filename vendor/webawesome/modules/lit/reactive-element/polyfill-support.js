export {};
const SCOPED = "__scoped";
var DEV_MODE = false;
const polyfillSupport = ({
  ReactiveElement
}) => {
  if (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow && !window.ShadyCSS.ApplyShim) {
    return;
  }
  const elementProto = ReactiveElement.prototype;
  if (window.ShadyDOM && window.ShadyDOM.inUse && window.ShadyDOM.noPatch === true) {
    window.ShadyDOM.patchElementProto(elementProto);
  }
  const createRenderRoot = elementProto.createRenderRoot;
  elementProto.createRenderRoot = function() {
    const name = this.localName;
    if (window.ShadyCSS.nativeShadow) {
      return createRenderRoot.call(this);
    } else {
      if (!this.constructor.hasOwnProperty(SCOPED)) {
        this.constructor[SCOPED] = true;
        const css = this.constructor.elementStyles.map((v) => v instanceof CSSStyleSheet ? Array.from(v.cssRules).reduce((a, r) => a += r.cssText, "") : v.cssText);
        window.ShadyCSS?.ScopingShim?.prepareAdoptedCssText(css, name);
        if (this.constructor._$handlesPrepareStyles === undefined) {
          window.ShadyCSS.prepareTemplateStyles(document.createElement("template"), name);
        }
      }
      return this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    }
  };
  const connectedCallback = elementProto.connectedCallback;
  elementProto.connectedCallback = function() {
    connectedCallback.call(this);
    if (this.hasUpdated) {
      window.ShadyCSS.styleElement(this);
    }
  };
  const didUpdate = elementProto._$didUpdate;
  elementProto._$didUpdate = function(changedProperties) {
    if (!this.hasUpdated) {
      window.ShadyCSS.styleElement(this);
    }
    didUpdate.call(this, changedProperties);
  };
};
if (DEV_MODE) {
  globalThis.reactiveElementPolyfillSupportDevMode ??= polyfillSupport;
} else {
  globalThis.reactiveElementPolyfillSupport ??= polyfillSupport;
}
