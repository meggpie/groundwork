/*! Copyright 2026 Fonticons, Inc. - https://webawesome.com/license */
import {
  WaStepper
} from "./chunk.4GRRYRIN.js";

// src/react/stepper/index.ts
import { createComponent } from "@lit/react";
import * as React from "react";
import "@lit/react";
var tagName = "wa-stepper";
var reactWrapper = createComponent({
  tagName,
  elementClass: WaStepper,
  react: React,
  events: {
    onWaBeforeStepChange: "wa-before-step-change",
    onWaStepChange: "wa-step-change"
  },
  displayName: "WaStepper"
});
var stepper_default = reactWrapper;

export {
  stepper_default
};
