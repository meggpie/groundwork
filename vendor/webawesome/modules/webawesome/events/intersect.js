export class WaIntersectEvent extends Event {
  constructor(detail) {
    super("wa-intersect", { bubbles: false, cancelable: false, composed: true });
    this.detail = detail;
  }
}
