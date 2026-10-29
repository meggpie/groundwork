export class WaIncludeErrorEvent extends Event {
  constructor(detail) {
    super("wa-include-error", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
