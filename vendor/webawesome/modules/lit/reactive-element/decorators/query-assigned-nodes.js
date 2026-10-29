import { desc } from "./base.js";
export function queryAssignedNodes(options) {
  return (obj, name) => {
    const { slot } = options ?? {};
    const slotSelector = `slot${slot ? `[name=${slot}]` : ":not([name])"}`;
    return desc(obj, name, {
      get() {
        const slotEl = this.renderRoot?.querySelector(slotSelector);
        return slotEl?.assignedNodes(options) ?? [];
      }
    });
  };
}
