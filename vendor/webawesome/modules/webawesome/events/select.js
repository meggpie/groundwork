export class WaSelectEvent extends Event {
  constructor(detail) {
    super("wa-select", { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}
