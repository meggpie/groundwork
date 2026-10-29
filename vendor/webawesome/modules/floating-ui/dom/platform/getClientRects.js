export function getClientRects(element) {
  return element.getClientRects ? Array.from(element.getClientRects()) : [];
}
