import { evaluate, getPaddingObject, rectToClientRect } from "../utils/index.js";
export async function detectOverflow(state, options = {}) {
  const { x, y, platform, rects, elements, strategy } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
    element: await platform.isElement?.(element) ?? true ? element : element.contextElement || await platform.getDocumentElement?.(elements.floating),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? { x, y, width: rects.floating.width, height: rects.floating.height } : rects.reference;
  const offsetParent = await platform.getOffsetParent?.(elements.floating);
  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  const scaleX = rect.width ? elementClientRect.width / rect.width : 0;
  const scaleY = rect.height ? elementClientRect.height / rect.height : 0;
  const offsetScale = await platform.isElement?.(offsetParent) && await platform.getScale?.(offsetParent) || {
    x: scaleX || scaleY || 1,
    y: scaleY || scaleX || 1
  };
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
