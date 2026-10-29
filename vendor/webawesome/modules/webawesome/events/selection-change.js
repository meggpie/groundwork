export class WaSelectionChangeEvent extends Event {
  constructor(detail) {
    super("wa-selection-change", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
