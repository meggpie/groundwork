export class WaAfterCollapseEvent extends Event {
  constructor() {
    super("wa-after-collapse", { bubbles: true, cancelable: false, composed: true });
  }
}
