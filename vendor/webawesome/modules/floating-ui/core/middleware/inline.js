import {
  evaluate,
  getPaddingObject,
  getSide,
  getSideAxis,
  max,
  min,
  rectToClientRect
} from "../../utils/index.js";
function getClientRect(left, top, right, bottom) {
  return rectToClientRect({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  });
}
function getBoundingRect(rects) {
  return getClientRect(min(...rects.map((rect) => rect.left)), min(...rects.map((rect) => rect.top)), max(...rects.map((rect) => rect.right)), max(...rects.map((rect) => rect.bottom)));
}
export function getRectsByLine(rects) {
  const sortedRects = rects.slice().sort((a, b) => a.y - b.y);
  const groups = [];
  let prevRect = null;
  for (let i = 0;i < sortedRects.length; i++) {
    const rect = sortedRects[i];
    if (!prevRect || rect.y - prevRect.y > prevRect.height / 2) {
      groups.push([rect]);
    } else {
      groups[groups.length - 1].push(rect);
    }
    prevRect = rect;
  }
  return groups.map(getBoundingRect);
}
export const inline = (options = {}) => ({
  name: "inline",
  options,
  async fn(state) {
    const { placement, elements, rects, platform, strategy } = state;
    const { padding = 2, x, y } = evaluate(options, state);
    const nativeClientRects = Array.from(await platform.getClientRects?.(elements.reference) || []);
    if (!nativeClientRects.length) {
      return {};
    }
    const clientRects = getRectsByLine(nativeClientRects);
    const fallback = getBoundingRect(nativeClientRects);
    const paddingObject = getPaddingObject(padding);
    function getBoundingClientRect() {
      if (clientRects.length === 2 && (clientRects[0].left > clientRects[1].right || clientRects[1].left > clientRects[0].right) && x != null && y != null) {
        return clientRects.find((rect) => x > rect.left - paddingObject.left && x < rect.right + paddingObject.right && y > rect.top - paddingObject.top && y < rect.bottom + paddingObject.bottom) || fallback;
      }
      if (clientRects.length >= 2) {
        if (getSideAxis(placement) === "y") {
          const firstRect = clientRects[0];
          const lastRect = clientRects[clientRects.length - 1];
          const { left, right } = getSide(placement) === "top" ? firstRect : lastRect;
          return getClientRect(left, firstRect.top, right, lastRect.bottom);
        }
        const isLeftSide = getSide(placement) === "left";
        const maxRight = max(...clientRects.map((rect) => rect.right));
        const minLeft = min(...clientRects.map((rect) => rect.left));
        const measureRects = clientRects.filter((rect) => isLeftSide ? rect.left === minLeft : rect.right === maxRight);
        return getClientRect(minLeft, measureRects[0].top, maxRight, measureRects[measureRects.length - 1].bottom);
      }
      return fallback;
    }
    const resetRects = await platform.getElementRects({
      reference: { getBoundingClientRect },
      floating: elements.floating,
      strategy
    });
    if (rects.reference.x !== resetRects.reference.x || rects.reference.y !== resetRects.reference.y || rects.reference.width !== resetRects.reference.width || rects.reference.height !== resetRects.reference.height) {
      return {
        reset: {
          rects: resetRects
        }
      };
    }
    return {};
  }
});
