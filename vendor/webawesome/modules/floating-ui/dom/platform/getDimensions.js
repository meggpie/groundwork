import { getCssDimensions } from "../utils/getCssDimensions";
export function getDimensions(element) {
  const { width, height } = getCssDimensions(element);
  return { width, height };
}
