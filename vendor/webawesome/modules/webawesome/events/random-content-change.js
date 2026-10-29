export class WaContentChangeEvent extends Event {
  constructor(detail) {
    super("wa-content-change", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
