import { nothing } from "../lit-html.js";
import {
  directive,
  Directive
} from "../directive.js";
import { setCommittedValue } from "../directive-helpers.js";

class Keyed extends Directive {
  constructor() {
    super(...arguments);
    this.key = nothing;
  }
  render(k, v) {
    this.key = k;
    return v;
  }
  update(part, [k, v]) {
    if (k !== this.key) {
      setCommittedValue(part);
      this.key = k;
    }
    return v;
  }
}
export const keyed = directive(Keyed);
