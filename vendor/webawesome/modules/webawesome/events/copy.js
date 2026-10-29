export class WaCopyEvent extends Event {
  constructor(detail) {
    super("wa-copy", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
