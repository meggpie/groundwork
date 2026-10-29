import {
  render,
  nothing
} from "../lit-html.js";
import {
  directive,
  Directive
} from "../directive.js";
import {
  clearPart,
  getCommittedValue,
  insertPart,
  isCompiledTemplateResult,
  isTemplateResult,
  setCommittedValue
} from "../directive-helpers.js";
const getStringsFromTemplateResult = (result) => isCompiledTemplateResult(result) ? result["_$litType$"].h : result.strings;

class CacheDirective extends Directive {
  constructor(partInfo) {
    super(partInfo);
    this._templateCache = new WeakMap;
  }
  render(v) {
    return [v];
  }
  update(containerPart, [v]) {
    const _valueKey = isTemplateResult(this._value) ? getStringsFromTemplateResult(this._value) : null;
    const vKey = isTemplateResult(v) ? getStringsFromTemplateResult(v) : null;
    if (_valueKey !== null && (vKey === null || _valueKey !== vKey)) {
      const partValue = getCommittedValue(containerPart);
      const childPart = partValue.pop();
      let cachedContainerPart = this._templateCache.get(_valueKey);
      if (cachedContainerPart === undefined) {
        const fragment = document.createDocumentFragment();
        cachedContainerPart = render(nothing, fragment);
        cachedContainerPart.setConnected(false);
        this._templateCache.set(_valueKey, cachedContainerPart);
      }
      setCommittedValue(cachedContainerPart, [childPart]);
      insertPart(cachedContainerPart, undefined, childPart);
    }
    if (vKey !== null) {
      if (_valueKey === null || _valueKey !== vKey) {
        const cachedContainerPart = this._templateCache.get(vKey);
        if (cachedContainerPart !== undefined) {
          const partValue = getCommittedValue(cachedContainerPart);
          const cachedPart = partValue.pop();
          clearPart(containerPart);
          insertPart(containerPart, undefined, cachedPart);
          setCommittedValue(containerPart, [cachedPart]);
        }
      }
      this._value = v;
    } else {
      this._value = undefined;
    }
    return this.render(v);
  }
}
export const cache = directive(CacheDirective);
