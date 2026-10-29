export class WaCreateEvent extends Event {
  constructor(detail) {
    super("wa-create", { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}
