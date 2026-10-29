import { isSingleExpression } from "./directive-helpers.js";
import { Directive, PartType } from "./directive.js";

export * from "./directive.js";
const DEV_MODE = false;
const notifyChildrenConnectedChanged = (parent, isConnected) => {
  const children = parent._$disconnectableChildren;
  if (children === undefined) {
    return false;
  }
  for (const obj of children) {
    obj["_$notifyDirectiveConnectionChanged"]?.(isConnected, false);
    notifyChildrenConnectedChanged(obj, isConnected);
  }
  return true;
};
const removeDisconnectableFromParent = (obj) => {
  let parent, children;
  do {
    if ((parent = obj._$parent) === undefined) {
      break;
    }
    children = parent._$disconnectableChildren;
    children.delete(obj);
    obj = parent;
  } while (children?.size === 0);
};
const addDisconnectableToParent = (obj) => {
  for (let parent;parent = obj._$parent; obj = parent) {
    let children = parent._$disconnectableChildren;
    if (children === undefined) {
      parent._$disconnectableChildren = children = new Set;
    } else if (children.has(obj)) {
      break;
    }
    children.add(obj);
    installDisconnectAPI(parent);
  }
};
function reparentDisconnectables(newParent) {
  if (this._$disconnectableChildren !== undefined) {
    removeDisconnectableFromParent(this);
    this._$parent = newParent;
    addDisconnectableToParent(this);
  } else {
    this._$parent = newParent;
  }
}
function notifyChildPartConnectedChanged(isConnected, isClearingValue = false, fromPartIndex = 0) {
  const value = this._$committedValue;
  const children = this._$disconnectableChildren;
  if (children === undefined || children.size === 0) {
    return;
  }
  if (isClearingValue) {
    if (Array.isArray(value)) {
      for (let i = fromPartIndex;i < value.length; i++) {
        notifyChildrenConnectedChanged(value[i], false);
        removeDisconnectableFromParent(value[i]);
      }
    } else if (value != null) {
      notifyChildrenConnectedChanged(value, false);
      removeDisconnectableFromParent(value);
    }
  } else {
    notifyChildrenConnectedChanged(this, isConnected);
  }
}
const installDisconnectAPI = (obj) => {
  if (obj.type == PartType.CHILD) {
    obj._$notifyConnectionChanged ??= notifyChildPartConnectedChanged;
    obj._$reparentDisconnectables ??= reparentDisconnectables;
  }
};

export class AsyncDirective extends Directive {
  constructor() {
    super(...arguments);
    this._$disconnectableChildren = undefined;
  }
  _$initialize(part, parent, attributeIndex) {
    super._$initialize(part, parent, attributeIndex);
    addDisconnectableToParent(this);
    this.isConnected = part._$isConnected;
  }
  ["_$notifyDirectiveConnectionChanged"](isConnected, isClearingDirective = true) {
    if (isConnected !== this.isConnected) {
      this.isConnected = isConnected;
      if (isConnected) {
        this.reconnected?.();
      } else {
        this.disconnected?.();
      }
    }
    if (isClearingDirective) {
      notifyChildrenConnectedChanged(this, isConnected);
      removeDisconnectableFromParent(this);
    }
  }
  setValue(value) {
    if (isSingleExpression(this.__part)) {
      this.__part._$setValue(value, this);
    } else {
      if (DEV_MODE && this.__attributeIndex === undefined) {
        throw new Error(`Expected this.__attributeIndex to be a number`);
      }
      const newValues = [...this.__part._$committedValue];
      newValues[this.__attributeIndex] = value;
      this.__part._$setValue(newValues, this, 0);
    }
  }
  disconnected() {}
  reconnected() {}
}
