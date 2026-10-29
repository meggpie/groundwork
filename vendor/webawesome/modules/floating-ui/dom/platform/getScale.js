import { createCoords, round } from "../../utils/index.js";
import { isHTMLElement } from "../../utils/dom.js";
import { getCssDimensions } from "../utils/getCssDimensions.js";
import { unwrapElement } from "../utils/unwrapElement.js";
export function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const { width, height, $ } = getCssDimensions(domElement);
  const x = ($ ? round(rect.width) : rect.width) / width;
  const y = ($ ? round(rect.height) : rect.height) / height;
  return {
    x: x && Number.isFinite(x) ? x : 1,
    y: y && Number.isFinite(y) ? y : 1
  };
}
