import { convertOffsetParentRelativeRectToViewportRelativeRect } from "./platform/convertOffsetParentRelativeRectToViewportRelativeRect.js";
import { getClientRects } from "./platform/getClientRects.js";
import { getClippingRect } from "./platform/getClippingRect.js";
import { getDimensions } from "./platform/getDimensions.js";
import { getDocumentElement } from "./platform/getDocumentElement.js";
import { getElementRects } from "./platform/getElementRects.js";
import { getOffsetParent } from "./platform/getOffsetParent.js";
import { getScale } from "./platform/getScale.js";
import { isElement } from "./platform/isElement.js";
import { isRTL } from "./platform/isRTL.js";
export const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
