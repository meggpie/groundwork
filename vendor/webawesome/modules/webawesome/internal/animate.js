export async function animate(el, keyframes, options) {
  return el.animate(keyframes, options).finished.catch(() => {});
}
export async function animateWithClass(el, className) {
  el.getAnimations();
  el.classList.add(className);
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const animationPromises = [];
  for (const animation of el.getAnimations()) {
    if (animation instanceof CSSAnimation && animation.effect?.getComputedTiming().endTime !== 1 / 0) {
      animationPromises.push(animation.finished);
    }
  }
  await Promise.allSettled(animationPromises);
  el.classList.remove(className);
}
export function parseDuration(duration) {
  duration = duration.toString().toLowerCase();
  if (duration.indexOf("ms") > -1) {
    return parseFloat(duration) || 0;
  }
  if (duration.indexOf("s") > -1) {
    return (parseFloat(duration) || 0) * 1000;
  }
  return parseFloat(duration) || 0;
}
export function prefersReducedMotion() {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  return query.matches;
}
