import { createCoords } from "../../utils/index.js";
import { getWindow, isWebKit } from "../../utils/dom.js";
const noOffsets = createCoords(0);
export function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
export function shouldAddVisualOffsets(element, isFixed = false, floatingOffsetParent) {
  return !!floatingOffsetParent && isFixed && floatingOffsetParent === getWindow(element);
}
