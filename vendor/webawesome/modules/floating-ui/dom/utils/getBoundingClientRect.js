import { rectToClientRect } from "../../core/index.js";
import { createCoords } from "../../utils/index.js";
import {
  getComputedStyle,
  getFrameElement,
  getWindow
} from "../../utils/dom.js";
import { getScale } from "../platform/getScale.js";
import { isElement } from "../platform/isElement.js";
import { getVisualOffsets, shouldAddVisualOffsets } from "./getVisualOffsets.js";
import { unwrapElement } from "./unwrapElement.js";
export function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false, offsetParent) {
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  const scale = includeScale && (!offsetParent || isElement(offsetParent)) ? getScale(offsetParent || element) : createCoords(1);
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement && offsetParent) {
    const win = getWindow(domElement);
    const offsetWin = isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({ width, height, x, y });
}
