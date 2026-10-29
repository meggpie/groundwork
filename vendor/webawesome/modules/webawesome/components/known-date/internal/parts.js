export const EMPTY_PARTS = { day: "", month: "", year: "" };
export function isComplete(parts) {
  return parts.day !== "" && parts.month !== "" && parts.year !== "";
}
export function isEmpty(parts) {
  return parts.day === "" && parts.month === "" && parts.year === "";
}
export function partsToIso(parts) {
  if (!isComplete(parts))
    return "";
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  if (!Number.isInteger(year) || year < 1 || year > 9999)
    return "";
  if (!Number.isInteger(month) || month < 1 || month > 12)
    return "";
  if (!Number.isInteger(day) || day < 1 || day > 31)
    return "";
  const date = new Date(2000, month - 1, day);
  date.setFullYear(year);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    return "";
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export function isoToParts(iso) {
  if (!iso)
    return { ...EMPTY_PARTS };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match)
    return { ...EMPTY_PARTS };
  return { year: match[1], month: match[2], day: match[3] };
}
