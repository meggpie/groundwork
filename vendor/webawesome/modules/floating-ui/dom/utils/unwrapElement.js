import { isElement } from "../platform/isElement.js";
export function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
