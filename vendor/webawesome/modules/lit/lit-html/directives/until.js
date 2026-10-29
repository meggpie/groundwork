import { noChange } from "../lit-html.js";
import { isPrimitive } from "../directive-helpers.js";
import {
  directive,
  AsyncDirective
} from "../async-directive.js";
import { Pauser, PseudoWeakRef } from "./private-async-helpers.js";
const isPromise = (x) => {
  return !isPrimitive(x) && typeof x.then === "function";
};
const _infinity = 1073741823;

export class UntilDirective extends AsyncDirective {
  constructor() {
    super(...arguments);
    this.__lastRenderedIndex = _infinity;
    this.__values = [];
    this.__weakThis = new PseudoWeakRef(this);
    this.__pauser = new Pauser;
  }
  render(...args) {
    return args.find((x) => !isPromise(x)) ?? noChange;
  }
  update(_part, args) {
    const previousValues = this.__values;
    let previousLength = previousValues.length;
    this.__values = args;
    const weakThis = this.__weakThis;
    const pauser = this.__pauser;
    if (!this.isConnected) {
      this.disconnected();
    }
    for (let i = 0;i < args.length; i++) {
      if (i > this.__lastRenderedIndex) {
        break;
      }
      const value = args[i];
      if (!isPromise(value)) {
        this.__lastRenderedIndex = i;
        return value;
      }
      if (i < previousLength && value === previousValues[i]) {
        continue;
      }
      this.__lastRenderedIndex = _infinity;
      previousLength = 0;
      Promise.resolve(value).then(async (result) => {
        while (pauser.get()) {
          await pauser.get();
        }
        const _this = weakThis.deref();
        if (_this !== undefined) {
          const index = _this.__values.indexOf(value);
          if (index > -1 && index < _this.__lastRenderedIndex) {
            _this.__lastRenderedIndex = index;
            _this.setValue(result);
          }
        }
      });
    }
    return noChange;
  }
  disconnected() {
    this.__weakThis.disconnect();
    this.__pauser.pause();
  }
  reconnected() {
    this.__weakThis.reconnect(this);
    this.__pauser.resume();
  }
}
export const until = directive(UntilDirective);
