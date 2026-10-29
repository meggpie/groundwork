export class WaResizeEvent extends Event {
  constructor(detail) {
    super("wa-resize", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
