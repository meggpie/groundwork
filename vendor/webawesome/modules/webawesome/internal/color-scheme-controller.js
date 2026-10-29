export class ColorSchemeController {
  constructor(host, onThemeChange) {
    this.handleTransitionEnd = () => {
      this.onThemeChange();
    };
    (this.host = host).addController(this);
    this.onThemeChange = onThemeChange;
    if (typeof document !== "undefined") {
      this.hiddenElement = document.createElement("div");
      this.hiddenElement.setAttribute("aria-hidden", "true");
      Object.assign(this.hiddenElement.style, {
        position: "absolute",
        width: "0",
        height: "0",
        overflow: "hidden",
        pointerEvents: "none",
        opacity: "0",
        color: "var(--wa-color-surface-default, transparent)",
        transition: "color 0.001ms"
      });
    }
  }
  hostConnected() {
    if (this.hiddenElement) {
      this.host.appendChild(this.hiddenElement);
      this.hiddenElement.addEventListener("transitionend", this.handleTransitionEnd);
    }
  }
  hostDisconnected() {
    if (this.hiddenElement) {
      this.hiddenElement.removeEventListener("transitionend", this.handleTransitionEnd);
      this.hiddenElement.remove();
    }
  }
}
