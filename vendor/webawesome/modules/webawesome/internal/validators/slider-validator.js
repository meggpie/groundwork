function isStepMismatch(value, min, step) {
  const steps = (value - min) / step;
  return Math.abs(steps - Math.round(steps)) > 0.000000001;
}
export const SliderValidator = () => {
  return {
    observedAttributes: ["min", "max", "step"],
    checkValidity(element) {
      const validity = {
        message: "",
        isValid: true,
        invalidKeys: []
      };
      const createNativeRange = (value, min, max, step) => {
        if (typeof document === "undefined") {
          return "";
        }
        const input = document.createElement("input");
        input.type = "range";
        input.min = String(min);
        input.max = String(max);
        input.step = String(step);
        input.value = String(value);
        input.checkValidity();
        return input.validationMessage;
      };
      if (element.isRange) {
        const minValue = element.minValue;
        const maxValue = element.maxValue;
        if (minValue < element.min) {
          validity.isValid = false;
          validity.invalidKeys.push("rangeUnderflow");
          validity.message = createNativeRange(minValue, element.min, element.max, element.step) || `Value must be greater than or equal to ${element.min}.`;
          return validity;
        }
        if (maxValue > element.max) {
          validity.isValid = false;
          validity.invalidKeys.push("rangeOverflow");
          validity.message = createNativeRange(maxValue, element.min, element.max, element.step) || `Value must be less than or equal to ${element.max}.`;
          return validity;
        }
        if (element.step && element.step !== 1) {
          const minStepMismatch = isStepMismatch(minValue, element.min, element.step);
          const maxStepMismatch = isStepMismatch(maxValue, element.min, element.step);
          if (minStepMismatch || maxStepMismatch) {
            validity.isValid = false;
            validity.invalidKeys.push("stepMismatch");
            const testValue = minStepMismatch ? minValue : maxValue;
            validity.message = createNativeRange(testValue, element.min, element.max, element.step) || `Value must be a multiple of ${element.step}.`;
            return validity;
          }
        }
      } else {
        const value = element.value;
        if (value < element.min) {
          validity.isValid = false;
          validity.invalidKeys.push("rangeUnderflow");
          validity.message = createNativeRange(value, element.min, element.max, element.step) || `Value must be greater than or equal to ${element.min}.`;
          return validity;
        }
        if (value > element.max) {
          validity.isValid = false;
          validity.invalidKeys.push("rangeOverflow");
          validity.message = createNativeRange(value, element.min, element.max, element.step) || `Value must be less than or equal to ${element.max}.`;
          return validity;
        }
        if (element.step && element.step !== 1 && isStepMismatch(value, element.min, element.step)) {
          validity.isValid = false;
          validity.invalidKeys.push("stepMismatch");
          validity.message = createNativeRange(value, element.min, element.max, element.step) || `Value must be a multiple of ${element.step}.`;
          return validity;
        }
      }
      return validity;
    }
  };
};
