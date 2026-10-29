export class WaCompleteEvent extends Event {
  constructor() {
    super("wa-complete", { bubbles: true, cancelable: true, composed: true });
  }
}
