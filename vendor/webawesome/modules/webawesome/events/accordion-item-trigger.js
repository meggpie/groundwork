export class WaAccordionItemTriggerEvent extends Event {
  constructor(detail) {
    super("wa-accordion-item-trigger", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
