import { noChange } from "../lit-html.js";
import {
  directive,
  Directive
} from "../directive.js";
const initialValue = {};

class GuardDirective extends Directive {
  constructor() {
    super(...arguments);
    this._previousValue = initialValue;
  }
  render(_value, f) {
    return f();
  }
  update(_part, [value, f]) {
    if (Array.isArray(value)) {
      if (Array.isArray(this._previousValue) && this._previousValue.length === value.length && value.every((v, i) => v === this._previousValue[i])) {
        return noChange;
      }
    } else if (this._previousValue === value) {
      return noChange;
    }
    this._previousValue = Array.isArray(value) ? Array.from(value) : value;
    const r = this.render(value, f);
    return r;
  }
}
export const guard = directive(GuardDirective);
