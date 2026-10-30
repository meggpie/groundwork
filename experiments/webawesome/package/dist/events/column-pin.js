/*! Copyright 2026 Fonticons, Inc. - https://webawesome.com/license */
import "../chunks/chunk.7VGCIHDG.js";

// src/events/column-pin.ts
var WaColumnPinEvent = class extends Event {
  constructor(detail) {
    super("wa-column-pin", { bubbles: true, cancelable: false, composed: true });
    this.detail = detail;
  }
};
export {
  WaColumnPinEvent
};
