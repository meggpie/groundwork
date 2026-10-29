import"../reactive-element/polyfill-support.js";
import"../lit-html/polyfill-support.js";
var DEV_MODE = false;
const polyfillSupport = ({ LitElement }) => {
  if (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow && !window.ShadyCSS.ApplyShim) {
    return;
  }
  LitElement._$handlesPrepareStyles = true;
  const litElementProto = LitElement.prototype;
  const createRenderRoot = litElementProto.createRenderRoot;
  litElementProto.createRenderRoot = function() {
    this.renderOptions.scope = this.localName;
    return createRenderRoot.call(this);
  };
};
if (DEV_MODE) {
  globalThis.litElementPolyfillSupportDevMode ??= polyfillSupport;
} else {
  globalThis.litElementPolyfillSupport ??= polyfillSupport;
}
