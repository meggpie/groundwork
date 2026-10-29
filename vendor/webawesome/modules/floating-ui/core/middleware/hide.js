import { evaluate, sides } from "../../utils/index.js";
function getSideOffsets(overflow, rect) {
  return {
    top: overflow.top - rect.height,
    right: overflow.right - rect.width,
    bottom: overflow.bottom - rect.height,
    left: overflow.left - rect.width
  };
}
function isAnySideFullyClipped(overflow) {
  return sides.some((side) => overflow[side] >= 0);
}
export const hide = (options = {}) => ({
  name: "hide",
  options,
  async fn(state) {
    const { rects, platform } = state;
    const { strategy = "referenceHidden", ...detectOverflowOptions } = evaluate(options, state);
    const escaped = strategy === "escaped";
    const overflow = await platform.detectOverflow(state, {
      ...detectOverflowOptions,
      ...escaped ? { altBoundary: true } : { elementContext: "reference" }
    });
    const offsets = getSideOffsets(overflow, escaped ? rects.floating : rects.reference);
    return {
      data: {
        [`${strategy}Offsets`]: offsets,
        [strategy]: isAnySideFullyClipped(offsets)
      }
    };
  }
});
