import { computePosition as computePositionCore } from "../core/index.js";
import { platform } from "./platform";
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



export { getOverflowAncestors } from "../utils/dom.js";
