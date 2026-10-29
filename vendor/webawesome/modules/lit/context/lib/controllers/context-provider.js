import { ContextRequestEvent } from "../context-request-event.js";
import { ValueNotifier } from "../value-notifier.js";

export class ContextProviderEvent extends Event {
  constructor(context, contextTarget) {
    super("context-provider", { bubbles: true, composed: true });
    this.context = context;
    this.contextTarget = contextTarget;
  }
}

export class ContextProvider extends ValueNotifier {
  constructor(host, contextOrOptions, initialValue) {
    super(contextOrOptions.context !== undefined ? contextOrOptions.initialValue : initialValue);
    this.onContextRequest = (ev) => {
      if (ev.context !== this.context) {
        return;
      }
      const consumerHost = ev.contextTarget ?? ev.composedPath()[0];
      if (consumerHost === this.host) {
        return;
      }
      ev.stopPropagation();
      this.addCallback(ev.callback, consumerHost, ev.subscribe);
    };
    this.onProviderRequest = (ev) => {
      if (ev.context !== this.context) {
        return;
      }
      const childProviderHost = ev.contextTarget ?? ev.composedPath()[0];
      if (childProviderHost === this.host) {
        return;
      }
      const seen = new Set;
      for (const [callback, { consumerHost }] of this.subscriptions) {
        if (seen.has(callback)) {
          continue;
        }
        seen.add(callback);
        consumerHost.dispatchEvent(new ContextRequestEvent(this.context, consumerHost, callback, true));
      }
      ev.stopPropagation();
    };
    this.host = host;
    if (contextOrOptions.context !== undefined) {
      this.context = contextOrOptions.context;
    } else {
      this.context = contextOrOptions;
    }
    this.attachListeners();
    this.host.addController?.(this);
  }
  attachListeners() {
    this.host.addEventListener("context-request", this.onContextRequest);
    this.host.addEventListener("context-provider", this.onProviderRequest);
  }
  hostConnected() {
    this.host.dispatchEvent(new ContextProviderEvent(this.context, this.host));
  }
}
