export const forAwaitOf = async (iterable, callback) => {
  for await (const v of iterable) {
    if (await callback(v) === false) {
      return;
    }
  }
};

export class PseudoWeakRef {
  constructor(ref) {
    this._ref = ref;
  }
  disconnect() {
    this._ref = undefined;
  }
  reconnect(ref) {
    this._ref = ref;
  }
  deref() {
    return this._ref;
  }
}

export class Pauser {
  constructor() {
    this._promise = undefined;
    this._resolve = undefined;
  }
  get() {
    return this._promise;
  }
  pause() {
    this._promise ??= new Promise((resolve) => this._resolve = resolve);
  }
  resume() {
    this._resolve?.();
    this._promise = this._resolve = undefined;
  }
}
