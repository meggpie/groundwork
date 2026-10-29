export class WaAccordionCollapseEvent extends Event {
  constructor(detail) {
    super("wa-collapse", { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}
