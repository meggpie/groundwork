import {
  evaluate,
  getAlignment,
  getSide,
  getSideAxis
} from "../../utils/index.js";
import { originSides } from "../constants";
async function convertValueToCoords(state, options) {
  const { placement, platform, elements } = state;
  const rtl = await platform.isRTL?.(elements.floating);
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let mainAxis;
  let crossAxis = 0;
  let alignmentAxis;
  if (typeof rawValue === "number") {
    mainAxis = rawValue;
  } else {
    mainAxis = rawValue.mainAxis || 0;
    crossAxis = rawValue.crossAxis || 0;
    alignmentAxis = rawValue.alignmentAxis;
  }
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? { x: crossAxis * crossAxisMulti, y: mainAxis * mainAxisMulti } : { x: mainAxis * mainAxisMulti, y: crossAxis * crossAxisMulti };
}
export const offset = (options = 0) => ({
  name: "offset",
  options,
  async fn(state) {
    const { x, y, placement, middlewareData } = state;
    const diffCoords = await convertValueToCoords(state, options);
    if (placement === middlewareData.offset?.placement && middlewareData.arrow?.alignmentOffset) {
      return {};
    }
    return {
      x: x + diffCoords.x,
      y: y + diffCoords.y,
      data: {
        ...diffCoords,
        placement
      }
    };
  }
});
