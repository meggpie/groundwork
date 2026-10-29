import { ContextRequestEvent } from "./context-request-event.js";

export class ContextRoot {
  constructor() {
    this.pendingContextRequests = new Map;
    this.onContextProvider = (event) => {
      const pendingRequestData = this.pendingContextRequests.get(event.context);
      if (pendingRequestData === undefined) {
        return;
      }
      this.pendingContextRequests.delete(event.context);
      const { requests } = pendingRequestData;
      for (const { elementRef, callbackRef } of requests) {
        const element = elementRef.deref();
        const callback = callbackRef.deref();
        if (element === undefined || callback === undefined) {} else {
          element.dispatchEvent(new ContextRequestEvent(event.context, element, callback, true));
        }
      }
    };
    this.onContextRequest = (event) => {
      if (event.subscribe !== true) {
        return;
      }
      const element = event.contextTarget ?? event.composedPath()[0];
      const callback = event.callback;
      let pendingContextRequests = this.pendingContextRequests.get(event.context);
      if (pendingContextRequests === undefined) {
        this.pendingContextRequests.set(event.context, pendingContextRequests = {
          callbacks: new WeakMap,
          requests: []
        });
      }
      let callbacks = pendingContextRequests.callbacks.get(element);
      if (callbacks === undefined) {
        pendingContextRequests.callbacks.set(element, callbacks = new WeakSet);
      }
      if (callbacks.has(callback)) {
        return;
      }
      callbacks.add(callback);
      pendingContextRequests.requests.push({
        elementRef: new WeakRef(element),
        callbackRef: new WeakRef(callback)
      });
    };
  }
  attach(element) {
    element.addEventListener("context-request", this.onContextRequest);
    element.addEventListener("context-provider", this.onContextProvider);
  }
  detach(element) {
    element.removeEventListener("context-request", this.onContextRequest);
    element.removeEventListener("context-provider", this.onContextProvider);
  }
}
