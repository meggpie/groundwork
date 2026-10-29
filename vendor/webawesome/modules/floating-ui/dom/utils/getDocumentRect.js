import { max } from "../../utils/index.js";
import { getComputedStyle, getNodeScroll } from "../../utils/dom.js";
import { getWindowScrollBarX } from "./getWindowScrollBarX.js";
export function getDocumentRect(html) {
  const scroll = getNodeScroll(html);
  const body = html.ownerDocument.body || html;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(html);
  const y = -scroll.scrollTop;
  if (getComputedStyle(body).direction === "rtl") {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
