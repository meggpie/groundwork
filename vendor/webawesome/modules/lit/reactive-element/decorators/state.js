import { property } from "./property.js";
export function state(options) {
  return property({
    ...options,
    state: true,
    attribute: false
  });
}
