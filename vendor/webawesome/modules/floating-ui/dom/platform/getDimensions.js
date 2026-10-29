import { getCssDimensions } from "../utils/getCssDimensions.js";
export function getDimensions(element) {
  const { width, height } = getCssDimensions(element);
  return { width, height };
}
