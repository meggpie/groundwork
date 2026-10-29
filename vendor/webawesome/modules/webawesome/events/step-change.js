export class WaStepChangeEvent extends Event {
  constructor(detail) {
    super("wa-step-change", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
