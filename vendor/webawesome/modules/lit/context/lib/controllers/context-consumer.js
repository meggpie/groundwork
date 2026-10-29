import {
  ContextRequestEvent
} from "../context-request-event.js";

export class ContextConsumer {
  constructor(host, contextOrOptions, callback, subscribe) {
    this.subscribe = false;
    this.provided = false;
    this.value = undefined;
    this._callback = (value, unsubscribe) => {
      if (this.unsubscribe) {
        if (this.unsubscribe !== unsubscribe) {
          this.provided = false;
          this.unsubscribe();
        }
        if (!this.subscribe) {
          this.unsubscribe();
        }
      }
      this.value = value;
      this.host.requestUpdate();
      if (!this.provided || this.subscribe) {
        this.provided = true;
        if (this.callback) {
          this.callback(value, unsubscribe);
        }
      }
      this.unsubscribe = unsubscribe;
    };
    this.host = host;
    if (contextOrOptions.context !== undefined) {
      const options = contextOrOptions;
      this.context = options.context;
      this.callback = options.callback;
      this.subscribe = options.subscribe ?? false;
    } else {
      this.context = contextOrOptions;
      this.callback = callback;
      this.subscribe = subscribe ?? false;
    }
    this.host.addController(this);
  }
  hostConnected() {
    this.dispatchRequest();
  }
  hostDisconnected() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }
  dispatchRequest() {
    this.host.dispatchEvent(new ContextRequestEvent(this.context, this.host, this._callback, this.subscribe));
  }
}
