import {
  evaluate,
  getAlignment,
  getAlignmentSides,
  getOppositeAlignmentPlacement,
  getSide,
  placements as ALL_PLACEMENTS
} from "../../utils/index.js";
export function getPlacementList(alignment, autoAlignment, allowedPlacements) {
  return alignment ? [
    ...allowedPlacements.filter((placement) => getAlignment(placement) === alignment),
    ...autoAlignment ? allowedPlacements.filter((placement) => getAlignment(placement) === getOppositeAlignmentPlacement(alignment)) : []
  ] : allowedPlacements.filter((placement) => getSide(placement) === placement);
}
export const autoPlacement = (options = {}) => ({
  name: "autoPlacement",
  options,
  async fn(state) {
    const { rects, middlewareData, placement, platform, elements } = state;
    const {
      crossAxis = false,
      alignment,
      allowedPlacements = ALL_PLACEMENTS,
      autoAlignment = true,
      ...detectOverflowOptions
    } = evaluate(options, state);
    const placements = alignment !== undefined || allowedPlacements === ALL_PLACEMENTS ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
    const currentIndex = middlewareData.autoPlacement?.index || 0;
    const currentPlacement = placements[currentIndex];
    if (currentPlacement == null) {
      return {};
    }
    if (placement !== currentPlacement) {
      return {
        reset: {
          placement: placements[0]
        }
      };
    }
    const overflow = await platform.detectOverflow(state, detectOverflowOptions);
    const alignmentSides = getAlignmentSides(currentPlacement, rects, await platform.isRTL?.(elements.floating));
    const currentOverflows = [
      overflow[getSide(currentPlacement)],
      overflow[alignmentSides[0]],
      overflow[alignmentSides[1]]
    ];
    const allOverflows = [
      ...middlewareData.autoPlacement?.overflows || [],
      { placement: currentPlacement, overflows: currentOverflows }
    ];
    const nextPlacement = placements[currentIndex + 1];
    let resetPlacement = nextPlacement;
    if (!nextPlacement) {
      const getSpace = ({
        placement,
        overflows
      }) => getAlignment(placement) && crossAxis ? overflows[0] + overflows[1] : overflows[0];
      const placementsSortedByMostSpace = [...allOverflows].sort((a, b) => getSpace(a) - getSpace(b));
      resetPlacement = (placementsSortedByMostSpace.find((d) => d.overflows.slice(0, getAlignment(d.placement) ? 2 : 3).every((v) => v <= 0)) || placementsSortedByMostSpace[0]).placement;
    }
    if (nextPlacement || resetPlacement !== placement) {
      return {
        data: {
          index: currentIndex + 1,
          overflows: allOverflows
        },
        reset: {
          placement: resetPlacement
        }
      };
    }
    return {};
  }
});
