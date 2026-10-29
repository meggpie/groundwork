export class WaCollapseEvent extends Event {
  constructor() {
    super("wa-collapse", { bubbles: true, cancelable: false, composed: true });
  }
}
