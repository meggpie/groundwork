import defaultLibrary from "./library.default.js";
import systemLibrary from "./library.system.js";
let defaultIconFamily = "classic";
let registry = [defaultLibrary, systemLibrary];
let watchedIcons = new Set;
export function watchIcon(icon) {
  watchedIcons.add(icon);
}
export function unwatchIcon(icon) {
  watchedIcons.delete(icon);
}
export function getIconLibrary(name) {
  return registry.find((lib) => lib.name === name);
}
export function registerIconLibrary(name, options) {
  unregisterIconLibrary(name);
  registry.push({
    name,
    resolver: options.resolver,
    mutator: options.mutator,
    spriteSheet: options.spriteSheet
  });
  watchedIcons.forEach((icon) => {
    if (icon.library === name) {
      icon.setIcon();
    }
  });
}
export function unregisterIconLibrary(name) {
  registry = registry.filter((lib) => lib.name !== name);
}
export function setDefaultIconFamily(family) {
  defaultIconFamily = family;
  watchedIcons.forEach((icon) => icon.setIcon());
}
export function getDefaultIconFamily() {
  return defaultIconFamily;
}
