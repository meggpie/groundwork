export class ContextRequestEvent extends Event {
  constructor(context, contextTarget, callback, subscribe) {
    super("context-request", { bubbles: true, composed: true });
    this.context = context;
    this.contextTarget = contextTarget;
    this.callback = callback;
    this.subscribe = subscribe ?? false;
  }
}
