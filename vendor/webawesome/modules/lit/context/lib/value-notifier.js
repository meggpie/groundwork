export class ValueNotifier {
  get value() {
    return this._value;
  }
  set value(v) {
    this.setValue(v);
  }
  setValue(v, force = false) {
    const update = force || !Object.is(v, this._value);
    this._value = v;
    if (update) {
      this.updateObservers();
    }
  }
  constructor(defaultValue) {
    this.subscriptions = new Map;
    this.updateObservers = () => {
      for (const [callback, { disposer }] of this.subscriptions) {
        callback(this._value, disposer);
      }
    };
    if (defaultValue !== undefined) {
      this.value = defaultValue;
    }
  }
  addCallback(callback, consumerHost, subscribe) {
    if (!subscribe) {
      callback(this.value);
      return;
    }
    if (!this.subscriptions.has(callback)) {
      this.subscriptions.set(callback, {
        disposer: () => {
          this.subscriptions.delete(callback);
        },
        consumerHost
      });
    }
    const { disposer } = this.subscriptions.get(callback);
    callback(this.value, disposer);
  }
  clearCallbacks() {
    this.subscriptions.clear();
  }
}
