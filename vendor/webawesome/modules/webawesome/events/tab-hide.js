export class WaTabHideEvent extends Event {
  constructor(detail) {
    super("wa-tab-hide", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
