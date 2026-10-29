export class WaAccordionAfterExpandEvent extends Event {
  constructor(detail) {
    super("wa-after-expand", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
