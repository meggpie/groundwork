export const sides = ["top", "right", "bottom", "left"];
export const alignments = ["start", "end"];
export const placements = sides.reduce((acc, side) => acc.concat(side, `${side}-start`, `${side}-end`), []);
export const min = Math.min;
export const max = Math.max;
export const round = Math.round;
export const floor = Math.floor;
export const createCoords = (v) => ({ x: v, y: v });
const oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
export function clamp(start, value, end) {
  return max(start, min(value, end));
}
export function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
export function getSide(placement) {
  return placement.split("-")[0];
}
export function getAlignment(placement) {
  return placement.split("-")[1];
}
export function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
export function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
export function getSideAxis(placement) {
  const firstChar = placement[0];
  return firstChar === "t" || firstChar === "b" ? "y" : "x";
}
export function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
export function getAlignmentSides(placement, rects, rtl = false) {
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
export function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [
    getOppositeAlignmentPlacement(placement),
    oppositePlacement,
    getOppositeAlignmentPlacement(oppositePlacement)
  ];
}
export function getOppositeAlignmentPlacement(placement) {
  return placement.includes("start") ? placement.replace("start", "end") : placement.replace("end", "start");
}
function getSideList(placement, isStart, rtl) {
  if (getSideAxis(placement) === "y") {
    return isStart !== !!rtl ? ["left", "right"] : ["right", "left"];
  }
  return isStart ? ["top", "bottom"] : ["bottom", "top"];
}
export function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(placement, direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => `${side}-${alignment}`);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
export function getOppositePlacement(placement) {
  const side = getSide(placement);
  return oppositeSideMap[side] + placement.slice(side.length);
}
export function expandPaddingObject(padding) {
  return {
    top: padding.top ?? 0,
    right: padding.right ?? 0,
    bottom: padding.bottom ?? 0,
    left: padding.left ?? 0
  };
}
export function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : { top: padding, right: padding, bottom: padding, left: padding };
}
export function rectToClientRect(rect) {
  const { x, y, width, height } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}
