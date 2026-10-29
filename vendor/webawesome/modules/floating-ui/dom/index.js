import { computePosition as computePositionCore } from "../core/index.js";
import { platform } from "./platform.js";
export const computePosition = (reference, floating, options) => {
  const cache = new Map;
  const mergedOptions = options ?? {};
  const platformWithCache = {
    ...platform,
    ...mergedOptions.platform,
    _c: cache
  };
  return computePositionCore(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};
export { autoUpdate } from "./autoUpdate.js";
export {
  arrow,
  autoPlacement,
  detectOverflow,
  flip,
  hide,
  inline,
  limitShift,
  offset,
  shift,
  size
} from "./middleware.js";
export { platform } from "./platform.js";
export { getOverflowAncestors } from "../utils/dom.js";
