import { nothing } from "../lit-html.js";
import { directive, AsyncDirective } from "../async-directive.js";
export const createRef = () => new Ref;

class Ref {
  constructor() {}
}
const lastElementForContextAndCallback = new WeakMap;

class RefDirective extends AsyncDirective {
  constructor() {
    super(...arguments);
  }
  render(_ref) {
    return nothing;
  }
  update(part, [ref]) {
    const refChanged = ref !== this._ref;
    if (refChanged) {
      this._updateRefValue(undefined);
    }
    if (refChanged || this._lastElementForRef !== this._element) {
      this._ref = ref;
      this._context = part.options?.host;
      this._updateRefValue(this._element = part.element);
    }
    return nothing;
  }
  _updateRefValue(element) {
    if (this._ref === undefined) {
      return;
    }
    if (!this.isConnected) {
      element = undefined;
    }
    if (typeof this._ref === "function") {
      const context = this._context ?? globalThis;
      let lastElementForCallback = lastElementForContextAndCallback.get(context);
      if (lastElementForCallback === undefined) {
        lastElementForCallback = new WeakMap;
        lastElementForContextAndCallback.set(context, lastElementForCallback);
      }
      if (lastElementForCallback.get(this._ref) !== undefined) {
        this._ref.call(this._context, undefined);
      }
      lastElementForCallback.set(this._ref, element);
      if (element !== undefined) {
        this._ref.call(this._context, element);
      }
    } else {
      this._ref.value = element;
    }
  }
  get _lastElementForRef() {
    return typeof this._ref === "function" ? lastElementForContextAndCallback.get(this._context ?? globalThis)?.get(this._ref) : this._ref?.value;
  }
  disconnected() {
    if (this._lastElementForRef === this._element) {
      this._updateRefValue(undefined);
    }
  }
  reconnected() {
    this._updateRefValue(this._element);
  }
}
export const ref = directive(RefDirective);
