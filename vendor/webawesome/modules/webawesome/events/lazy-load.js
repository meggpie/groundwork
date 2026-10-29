export class WaLazyLoadEvent extends Event {
  constructor() {
    super("wa-lazy-load", { bubbles: true, cancelable: false, composed: true });
  }
}
