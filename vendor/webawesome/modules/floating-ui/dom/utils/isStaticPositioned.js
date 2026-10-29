import { getComputedStyle } from "../../utils/dom.js";
export function isStaticPositioned(element) {
  return getComputedStyle(element).position === "static";
}
