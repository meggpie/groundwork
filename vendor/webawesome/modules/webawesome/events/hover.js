export class WaHoverEvent extends Event {
  constructor(detail) {
    super("wa-hover", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
