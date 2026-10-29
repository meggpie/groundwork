import {
  html as coreHtml,
  svg as coreSvg,
  mathml as coreMathml
} from "./lit-html.js";
const brand = Symbol.for("");
const unwrapStaticValue = (value) => {
  if (value?.r !== brand) {
    return;
  }
  return value?.["_$litStatic$"];
};
export const unsafeStatic = (value) => ({
  ["_$litStatic$"]: value,
  r: brand
});
const textFromStatic = (value) => {
  if (value["_$litStatic$"] !== undefined) {
    return value["_$litStatic$"];
  } else {
    throw new Error(`Value passed to 'literal' function must be a 'literal' result: ${value}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
  }
};
export const literal = (strings, ...values) => ({
  ["_$litStatic$"]: values.reduce((acc, v, idx) => acc + textFromStatic(v) + strings[idx + 1], strings[0]),
  r: brand
});
const stringsCache = new Map;
export const withStatic = (coreTag) => (strings, ...values) => {
  const l = values.length;
  let staticValue;
  let dynamicValue;
  const staticStrings = [];
  const dynamicValues = [];
  let i = 0;
  let hasStatics = false;
  let s;
  while (i < l) {
    s = strings[i];
    while (i < l && (dynamicValue = values[i], staticValue = unwrapStaticValue(dynamicValue)) !== undefined) {
      s += staticValue + strings[++i];
      hasStatics = true;
    }
    if (i !== l) {
      dynamicValues.push(dynamicValue);
    }
    staticStrings.push(s);
    i++;
  }
  if (i === l) {
    staticStrings.push(strings[l]);
  }
  if (hasStatics) {
    const key = staticStrings.join("$$lit$$");
    strings = stringsCache.get(key);
    if (strings === undefined) {
      staticStrings.raw = staticStrings;
      stringsCache.set(key, strings = staticStrings);
    }
    values = dynamicValues;
  }
  return coreTag(strings, ...values);
};
export const html = withStatic(coreHtml);
export const svg = withStatic(coreSvg);
export const mathml = withStatic(coreMathml);
