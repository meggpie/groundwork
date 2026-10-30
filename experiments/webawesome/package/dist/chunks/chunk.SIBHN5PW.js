/*! Copyright 2026 Fonticons, Inc. - https://webawesome.com/license */
import {
  WaTagInput
} from "./chunk.2H56ALYD.js";

// src/react/tag-input/index.ts
import { createComponent } from "@lit/react";
import * as React from "react";
import "@lit/react";
var tagName = "wa-tag-input";
var reactWrapper = createComponent({
  tagName,
  elementClass: WaTagInput,
  react: React,
  events: {
    onWaCreate: "wa-create",
    onWaClear: "wa-clear",
    onWaInvalid: "wa-invalid"
  },
  displayName: "WaTagInput"
});
var tag_input_default = reactWrapper;

export {
  tag_input_default
};
