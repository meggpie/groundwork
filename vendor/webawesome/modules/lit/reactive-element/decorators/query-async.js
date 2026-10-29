import { desc } from "./base.js";
export function queryAsync(selector) {
  return (obj, name) => {
    return desc(obj, name, {
      async get() {
        await this.updateComplete;
        return this.renderRoot?.querySelector(selector) ?? null;
      }
    });
  };
}
