import { isServer } from "../../lit/lit/index.js";

export class RenderedWatcher {
  constructor(element, callback) {
    this.element = element;
    this.callback = callback;
  }
  start(...additionalTargets) {
    if (isServer) {
      return;
    }
    this.observer ??= new ResizeObserver(() => this.check());
    this.observer.observe(this.element);
    for (const target of additionalTargets) {
      this.observer.observe(target);
    }
    this.initialCheckHandle ??= requestAnimationFrame(() => {
      this.initialCheckHandle = undefined;
      this.check();
    });
  }
  stop() {
    if (this.initialCheckHandle !== undefined) {
      cancelAnimationFrame(this.initialCheckHandle);
      this.initialCheckHandle = undefined;
    }
    this.observer?.disconnect();
  }
  check() {
    this.callback(this.element.getClientRects().length > 0);
  }
}
