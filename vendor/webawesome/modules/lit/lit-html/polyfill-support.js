export {};
const styledScopes = new Set;
const scopeCssStore = new Map;
const ENABLE_SHADYDOM_NOPATCH = true;
var DEV_MODE = false;
const polyfillSupport = (Template, ChildPart) => {
  if (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow && !window.ShadyCSS.ApplyShim) {
    return;
  }
  const wrap = ENABLE_SHADYDOM_NOPATCH && window.ShadyDOM?.inUse && window.ShadyDOM?.noPatch === true ? window.ShadyDOM.wrap : (node) => node;
  const needsPrepareStyles = (name) => name !== undefined && !styledScopes.has(name);
  const cssForScope = (name) => {
    let scopeCss = scopeCssStore.get(name);
    if (scopeCss === undefined) {
      scopeCssStore.set(name, scopeCss = []);
    }
    return scopeCss;
  };
  const prepareStyles = (name, template) => {
    const scopeCss = cssForScope(name);
    const hasScopeCss = scopeCss.length !== 0;
    if (hasScopeCss) {
      const style = document.createElement("style");
      style.textContent = scopeCss.join(`
`);
      template.content.appendChild(style);
    }
    styledScopes.add(name);
    scopeCssStore.delete(name);
    window.ShadyCSS.prepareTemplateStyles(template, name);
    if (hasScopeCss && window.ShadyCSS.nativeShadow) {
      const style = template.content.querySelector("style");
      if (style !== null) {
        template.content.appendChild(style);
      }
    }
  };
  const scopedTemplateCache = new Map;
  const originalCreateElement = Template.createElement;
  Template.createElement = function(html, options) {
    const element = originalCreateElement.call(Template, html, options);
    const scope = options?.scope;
    if (scope !== undefined) {
      if (!window.ShadyCSS.nativeShadow) {
        window.ShadyCSS.prepareTemplateDom(element, scope);
      }
      if (needsPrepareStyles(scope)) {
        const scopeCss = cssForScope(scope);
        const styles = element.content.querySelectorAll("style");
        scopeCss.push(...Array.from(styles).map((style) => {
          style.parentNode?.removeChild(style);
          return style.textContent;
        }));
      }
    }
    return element;
  };
  const renderContainer = document.createDocumentFragment();
  const renderContainerMarker = document.createComment("");
  const childPartProto = ChildPart.prototype;
  const setValue = childPartProto._$setValue;
  childPartProto._$setValue = function(value, directiveParent = this) {
    const container = wrap(this._$startNode).parentNode;
    const scope = this.options?.scope;
    if (container instanceof ShadowRoot && needsPrepareStyles(scope)) {
      const startNode = this._$startNode;
      const endNode = this._$endNode;
      renderContainer.appendChild(renderContainerMarker);
      this._$startNode = renderContainerMarker;
      this._$endNode = null;
      setValue.call(this, value, directiveParent);
      const template = value?.["_$litType$"] ? this._$committedValue._$template.el : document.createElement("template");
      prepareStyles(scope, template);
      renderContainer.removeChild(renderContainerMarker);
      if (window.ShadyCSS?.nativeShadow) {
        const style = template.content.querySelector("style");
        if (style !== null) {
          renderContainer.appendChild(style.cloneNode(true));
        }
      }
      container.insertBefore(renderContainer, endNode);
      this._$startNode = startNode;
      this._$endNode = endNode;
    } else {
      setValue.call(this, value, directiveParent);
    }
  };
  childPartProto._$getTemplate = function(result) {
    const scope = this.options?.scope;
    let templateCache = scopedTemplateCache.get(scope);
    if (templateCache === undefined) {
      scopedTemplateCache.set(scope, templateCache = new Map);
    }
    let template = templateCache.get(result.strings);
    if (template === undefined) {
      templateCache.set(result.strings, template = new Template(result, this.options));
    }
    return template;
  };
};
if (ENABLE_SHADYDOM_NOPATCH) {
  polyfillSupport.noPatchSupported = ENABLE_SHADYDOM_NOPATCH;
}
if (DEV_MODE) {
  globalThis.litHtmlPolyfillSupportDevMode ??= polyfillSupport;
} else {
  globalThis.litHtmlPolyfillSupport ??= polyfillSupport;
}
