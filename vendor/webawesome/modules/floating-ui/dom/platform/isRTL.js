import { getComputedStyle } from "../../utils/dom.js";
export function isRTL(element) {
  return getComputedStyle(element).direction === "rtl";
}
