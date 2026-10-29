import {
  directive,
  PartType
} from "../directive.js";
import { AsyncReplaceDirective } from "./async-replace.js";
import {
  clearPart,
  insertPart,
  setChildPartValue
} from "../directive-helpers.js";

class AsyncAppendDirective extends AsyncReplaceDirective {
  constructor(partInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.CHILD) {
      throw new Error("asyncAppend can only be used in child expressions");
    }
  }
  update(part, params) {
    this.__childPart = part;
    return super.update(part, params);
  }
  commitValue(value, index) {
    if (index === 0) {
      clearPart(this.__childPart);
    }
    const newPart = insertPart(this.__childPart);
    setChildPartValue(newPart, value);
  }
}
export const asyncAppend = directive(AsyncAppendDirective);
