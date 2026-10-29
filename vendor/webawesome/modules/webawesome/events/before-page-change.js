export class WaBeforePageChangeEvent extends Event {
  constructor(detail) {
    super("wa-before-page-change", { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}
