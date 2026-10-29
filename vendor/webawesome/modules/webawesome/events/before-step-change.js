export class WaBeforeStepChangeEvent extends Event {
  constructor(detail) {
    super("wa-before-step-change", { bubbles: true, cancelable: true, composed: true });
    this.detail = detail;
  }
}
