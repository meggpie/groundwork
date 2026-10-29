import { getComputedStyle, getWindow, isWebKit } from "../../utils/dom.js";
import { getDocumentElement } from "../platform/getDocumentElement.js";
import { getCurrentCSSZoom } from "./getCurrentCSSZoom.js";
import { getWindowScrollBarX } from "./getWindowScrollBarX.js";
const SCROLLBAR_MAX = 25;
export function getViewportRect(element, strategy, rootBoundary = "viewport") {
  const isLayoutViewport = rootBoundary === "layoutViewport";
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    const layoutRelativeClientCoords = !isWebKit() || strategy === "fixed";
    if (isLayoutViewport) {
      if (!layoutRelativeClientCoords) {
        x = -visualViewport.offsetLeft;
        y = -visualViewport.offsetTop;
      }
    } else {
      width = visualViewport.width;
      height = visualViewport.height;
      if (layoutRelativeClientCoords) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
  }
  const htmlRect = html.getBoundingClientRect();
  const windowScrollbarX = getWindowScrollBarX(html, htmlRect);
  const reservedWidth = win.document.compatMode === "BackCompat" ? width - html.clientWidth : html.clientWidth - html.offsetWidth * getCurrentCSSZoom(html);
  if (windowScrollbarX <= 0 && reservedWidth > 0 && reservedWidth / getCurrentCSSZoom(html.ownerDocument.body || html) <= SCROLLBAR_MAX) {
    const scrollbarGutter = getComputedStyle(html).scrollbarGutter;
    if (scrollbarGutter && scrollbarGutter !== "auto") {
      width -= reservedWidth;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}
