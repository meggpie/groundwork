export class WaSlideChangeEvent extends Event {
  constructor(detail) {
    super("wa-slide-change", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
