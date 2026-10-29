export class WaExpandEvent extends Event {
  constructor() {
    super("wa-expand", { bubbles: true, cancelable: false, composed: true });
  }
}
