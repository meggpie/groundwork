export function getWindowScrollBarX(html, rect = html.getBoundingClientRect()) {
  return rect.left + html.scrollLeft;
}
