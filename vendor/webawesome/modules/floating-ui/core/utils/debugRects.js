export function paintDebugRects(elementRect, clippingRect) {
  const elNode = document.getElementById("elementRect");
  elNode.style.left = `${elementRect.x}px`;
  elNode.style.top = `${elementRect.y}px`;
  elNode.style.width = `${elementRect.width}px`;
  elNode.style.height = `${elementRect.height}px`;
  const clNode = document.getElementById("clippingRect");
  clNode.style.left = `${clippingRect.x}px`;
  clNode.style.top = `${clippingRect.y}px`;
  clNode.style.width = `${clippingRect.width}px`;
  clNode.style.height = `${clippingRect.height}px`;
}
