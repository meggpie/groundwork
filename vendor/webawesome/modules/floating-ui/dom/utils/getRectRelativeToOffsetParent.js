import { createCoords } from "../../utils/index.js";
import {
  getNodeName,
  getNodeScroll,
  isElement,
  isHTMLElement,
  isOverflowElement
} from "../../utils/dom.js";
import { getDocumentElement } from "../platform/getDocumentElement";
import { getBoundingClientRect } from "./getBoundingClientRect";
import { getCurrentCSSZoom } from "./getCurrentCSSZoom";
import { getWindowScrollBarX } from "./getWindowScrollBarX";
import { getHTMLOffset } from "./getHTMLOffset";
export function getRectRelativeToOffsetParent(element, offsetParent, strategy, floating) {
  const isOffsetParentAnHTMLElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = { scrollLeft: 0, scrollTop: 0 };
  let offsetX = 0;
  let offsetY = 0;
  if (isOffsetParentAnHTMLElement || !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnHTMLElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsetX = offsetRect.x + offsetParent.clientLeft;
      offsetY = offsetRect.y + offsetParent.clientTop;
    }
  }
  if (!isOffsetParentAnHTMLElement) {
    offsetX = getWindowScrollBarX(documentElement);
  }
  const htmlOffset = !isOffsetParentAnHTMLElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const zoom = isElement(offsetParent) ? 1 : getCurrentCSSZoom(floating);
  return {
    x: (rect.left + scroll.scrollLeft - offsetX - htmlOffset.x) / zoom,
    y: (rect.top + scroll.scrollTop - offsetY - htmlOffset.y) / zoom,
    width: rect.width / zoom,
    height: rect.height / zoom
  };
}
