const orderCache = new Map;
export function localeFieldOrder(locale) {
  const key = locale || "en";
  const cached = orderCache.get(key);
  if (cached)
    return cached;
  const formatter = new Intl.DateTimeFormat(key, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    calendar: "gregory",
    numberingSystem: "latn"
  });
  const parts = formatter.formatToParts(new Date(2026, 0, 23));
  const order = [];
  for (const part of parts) {
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      order.push(part.type);
    }
  }
  const resolved = order.length === 3 ? order : ["month", "day", "year"];
  orderCache.set(key, resolved);
  return resolved;
}
