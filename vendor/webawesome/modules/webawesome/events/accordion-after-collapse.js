export class WaAccordionAfterCollapseEvent extends Event {
  constructor(detail) {
    super("wa-after-collapse", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
