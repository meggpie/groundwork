function flatTreeParent(el) {
  if (el.assignedSlot)
    return el.assignedSlot;
  if (el.parentNode instanceof ShadowRoot)
    return el.parentNode.host;
  return el.parentNode;
}
export function offsetParent(element) {
  for (let a = element;a; a = flatTreeParent(a)) {
    if (a instanceof Element && getComputedStyle(a).display === "none")
      return null;
  }
  for (let a = flatTreeParent(element);a; a = flatTreeParent(a)) {
    if (!(a instanceof Element))
      continue;
    const s = getComputedStyle(a);
    if (s.display === "contents")
      continue;
    if (s.position !== "static" || s.filter !== "none")
      return a;
    if (a.tagName === "BODY")
      return a;
  }
  return null;
}
export function offsetLeft(el) {
  return el.offsetLeft;
}
export function offsetTop(el) {
  return el.offsetTop;
}
