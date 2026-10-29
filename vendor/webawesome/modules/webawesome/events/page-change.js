export class WaPageChangeEvent extends Event {
  constructor(detail) {
    super("wa-page-change", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
