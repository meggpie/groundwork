import { noChange } from "../lit-html.js";
import {
  AsyncDirective,
  directive
} from "../async-directive.js";
import { Pauser, PseudoWeakRef, forAwaitOf } from "./private-async-helpers.js";

export class AsyncReplaceDirective extends AsyncDirective {
  constructor() {
    super(...arguments);
    this.__weakThis = new PseudoWeakRef(this);
    this.__pauser = new Pauser;
  }
  render(value, _mapper) {
    return noChange;
  }
  update(_part, [value, mapper]) {
    if (!this.isConnected) {
      this.disconnected();
    }
    if (value === this.__value) {
      return noChange;
    }
    this.__value = value;
    let i = 0;
    const { __weakThis: weakThis, __pauser: pauser } = this;
    forAwaitOf(value, async (v) => {
      while (pauser.get()) {
        await pauser.get();
      }
      const _this = weakThis.deref();
      if (_this !== undefined) {
        if (_this.__value !== value) {
          return false;
        }
        if (mapper !== undefined) {
          v = mapper(v, i);
        }
        _this.commitValue(v, i);
        i++;
      }
      return true;
    });
    return noChange;
  }
  commitValue(value, _index) {
    this.setValue(value);
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
export const asyncReplace = directive(AsyncReplaceDirective);
