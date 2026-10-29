export class WaAccordionExpandEvent extends Event {
  constructor(detail) {
    super("wa-expand", { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}
