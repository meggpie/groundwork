import {
  evaluate,
  getAlignmentSides,
  getExpandedPlacements,
  getOppositeAxisPlacements,
  getOppositePlacement,
  getSide,
  getSideAxis
} from "../../utils/index.js";
export const flip = (options = {}) => ({
  name: "flip",
  options,
  async fn(state) {
    const {
      placement,
      middlewareData,
      rects,
      initialPlacement,
      platform,
      elements
    } = state;
    const {
      mainAxis: checkMainAxis = true,
      crossAxis: checkCrossAxis = true,
      fallbackPlacements: specifiedFallbackPlacements,
      fallbackStrategy = "bestFit",
      fallbackAxisSideDirection = "none",
      flipAlignment = true,
      ...detectOverflowOptions
    } = evaluate(options, state);
    if (middlewareData.arrow?.alignmentOffset) {
      return {};
    }
    const side = getSide(placement);
    const initialSideAxis = getSideAxis(initialPlacement);
    const isBasePlacement = getSide(initialPlacement) === initialPlacement;
    const rtl = await platform.isRTL?.(elements.floating);
    const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
    const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
    if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
      fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
    }
    const placements = [initialPlacement, ...fallbackPlacements];
    const overflow = await platform.detectOverflow(state, detectOverflowOptions);
    const overflows = [];
    let overflowsData = middlewareData.flip?.overflows || [];
    if (checkMainAxis) {
      overflows.push(overflow[side]);
    }
    if (checkCrossAxis) {
      const sides = getAlignmentSides(placement, rects, rtl);
      overflows.push(overflow[sides[0]], overflow[sides[1]]);
    }
    overflowsData = [...overflowsData, { placement, overflows }];
    if (!overflows.every((side) => side <= 0)) {
      const nextIndex = (middlewareData.flip?.index || 0) + 1;
      const nextPlacement = placements[nextIndex];
      if (nextPlacement) {
        const ignoreCrossAxisOverflow = checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false;
        if (!ignoreCrossAxisOverflow || overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
      }
      let resetPlacement = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]?.placement;
      if (!resetPlacement) {
        if (fallbackStrategy === "bestFit") {
          resetPlacement = overflowsData.filter((d) => {
            const currentSideAxis = getSideAxis(d.placement);
            return !hasFallbackAxisSideDirection || currentSideAxis === initialSideAxis || currentSideAxis === "y";
          }).map((d) => [
            d.placement,
            d.overflows.reduce((acc, overflow) => acc + (overflow > 0 ? overflow : 0), 0)
          ]).sort((a, b) => a[1] - b[1])[0]?.[0];
        } else if (fallbackStrategy === "initialPlacement") {
          resetPlacement = initialPlacement;
        }
      }
      if (placement !== resetPlacement) {
        return {
          reset: {
            placement: resetPlacement
          }
        };
      }
    }
    return {};
  }
});
