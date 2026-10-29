const DEPRECATION_MAP = {
  small: "s",
  medium: "m",
  large: "l"
};
export function normalizeSize(size) {
  return DEPRECATION_MAP[size] ?? size;
}
const warned = new Set;
export function warnDeprecatedSize(tagName, value) {
  if (value in DEPRECATION_MAP && !warned.has(`${tagName}:${value}`)) {
    warned.add(`${tagName}:${value}`);
    console.warn(`[${tagName}] size="${value}" is deprecated. Use size="${DEPRECATION_MAP[value]}" instead. ` + `The long-form value will be removed in the next major version.`);
  }
}
