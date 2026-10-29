import {
  clamp,
  evaluate,
  getOppositeAxis,
  getSide,
  getSideAxis
} from "../../utils/index.js";
import { originSides } from "../constants.js";
export const shift = (options = {}) => ({
  name: "shift",
  options,
  async fn(state) {
    const { x, y, placement, platform } = state;
    const {
      mainAxis: checkMainAxis = true,
      crossAxis: checkCrossAxis = false,
      limiter = { fn: ({ x, y }) => ({ x, y }) },
      ...detectOverflowOptions
    } = evaluate(options, state);
    const overflow = await platform.detectOverflow(state, detectOverflowOptions);
    const crossAxis = getSideAxis(placement);
    const mainAxis = getOppositeAxis(crossAxis);
    let mainAxisCoord = state[mainAxis];
    let crossAxisCoord = state[crossAxis];
    const clampCoord = (axis, coord) => clamp(coord + overflow[axis === "y" ? "top" : "left"], coord, coord - overflow[axis === "y" ? "bottom" : "right"]);
    if (checkMainAxis) {
      mainAxisCoord = clampCoord(mainAxis, mainAxisCoord);
    }
    if (checkCrossAxis) {
      crossAxisCoord = clampCoord(crossAxis, crossAxisCoord);
    }
    const limitedCoords = limiter.fn({
      ...state,
      [mainAxis]: mainAxisCoord,
      [crossAxis]: crossAxisCoord
    });
    return {
      ...limitedCoords,
      data: {
        x: limitedCoords.x - x,
        y: limitedCoords.y - y,
        enabled: {
          [mainAxis]: checkMainAxis,
          [crossAxis]: checkCrossAxis
        }
      }
    };
  }
});
export const limitShift = (options = {}) => ({
  options,
  fn(state) {
    const { placement, rects, middlewareData } = state;
    const {
      offset = 0,
      mainAxis: checkMainAxis = true,
      crossAxis: checkCrossAxis = true
    } = evaluate(options, state);
    const crossAxis = getSideAxis(placement);
    const mainAxis = getOppositeAxis(crossAxis);
    let mainAxisCoord = state[mainAxis];
    let crossAxisCoord = state[crossAxis];
    const rawOffset = evaluate(offset, state);
    const { mainAxis: mainAxisOffset = 0, crossAxis: crossAxisOffset = 0 } = typeof rawOffset === "number" ? { mainAxis: rawOffset } : rawOffset;
    if (checkMainAxis) {
      const len = mainAxis === "y" ? "height" : "width";
      const limitMin = rects.reference[mainAxis] - rects.floating[len] + mainAxisOffset;
      const limitMax = rects.reference[mainAxis] + rects.reference[len] - mainAxisOffset;
      if (mainAxisCoord < limitMin) {
        mainAxisCoord = limitMin;
      } else if (mainAxisCoord > limitMax) {
        mainAxisCoord = limitMax;
      }
    }
    if (checkCrossAxis) {
      const len = mainAxis === "y" ? "width" : "height";
      const isOriginSide = originSides.has(getSide(placement));
      const offsetData = middlewareData.offset?.[crossAxis] || 0;
      const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? offsetData : crossAxisOffset);
      const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? -crossAxisOffset : offsetData);
      if (crossAxisCoord < limitMin) {
        crossAxisCoord = limitMin;
      } else if (crossAxisCoord > limitMax) {
        crossAxisCoord = limitMax;
      }
    }
    return {
      [mainAxis]: mainAxisCoord,
      [crossAxis]: crossAxisCoord
    };
  }
});
