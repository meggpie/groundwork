import { desc } from "./base.js";
let fragment;
export function queryAll(selector) {
  return (obj, name) => {
    return desc(obj, name, {
      get() {
        const container = this.renderRoot ?? (fragment ??= document.createDocumentFragment());
        return container.querySelectorAll(selector);
      }
    });
  };
}
