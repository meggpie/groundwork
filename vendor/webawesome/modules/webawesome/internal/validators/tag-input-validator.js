export const TagInputValidator = () => {
  const nativeRequired = typeof document !== "undefined" && "createElement" in document ? Object.assign(document.createElement("input"), { required: true }) : undefined;
  return {
    observedAttributes: ["required", "min-tags", "max-tags"],
    checkValidity(element) {
      const validity = {
        message: "",
        isValid: true,
        invalidKeys: []
      };
      const count = element.value.length;
      if (element.required && count === 0) {
        validity.isValid = false;
        validity.invalidKeys.push("valueMissing");
        validity.message = nativeRequired?.validationMessage || "Please fill out this field.";
        return validity;
      }
      if (element.minTags != null && count > 0 && count < element.minTags) {
        validity.isValid = false;
        validity.invalidKeys.push("rangeUnderflow");
        validity.message = element.localize.term("tooFewTags", element.minTags);
        return validity;
      }
      if (element.maxTags != null && count > element.maxTags) {
        validity.isValid = false;
        validity.invalidKeys.push("rangeOverflow");
        validity.message = element.localize.term("tooManyTags", element.maxTags);
      }
      return validity;
    }
  };
};
