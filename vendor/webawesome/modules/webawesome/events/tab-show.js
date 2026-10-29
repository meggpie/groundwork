export class WaTabShowEvent extends Event {
  constructor(detail) {
    super("wa-tab-show", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
