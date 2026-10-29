import { isElement } from "../platform/isElement";
export function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
