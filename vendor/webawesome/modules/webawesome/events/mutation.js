export class WaMutationEvent extends Event {
  constructor(detail) {
    super("wa-mutation", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
}
