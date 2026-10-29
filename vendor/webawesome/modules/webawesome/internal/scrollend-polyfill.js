import { isServer } from "../../lit/lit/index.js";
(() => {
  if (isServer) {
    return;
  }
  const debounce = (fn, delay) => {
    let timerId = 0;
    return function(...args) {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        fn.call(this, ...args);
      }, delay);
    };
  };
  const decorate = (proto, method, decorateFn) => {
    const superFn = proto[method];
    proto[method] = function(...args) {
      superFn.call(this, ...args);
      decorateFn.call(this, superFn, ...args);
    };
  };
  const isSupported = "onscrollend" in window;
  if (!isSupported) {
    const pointers = new Set;
    const scrollHandlers = new WeakMap;
    const handlePointerDown = (event) => {
      pointers.add(event.pointerId);
    };
    const handlePointerUp = (event) => {
      pointers.delete(event.pointerId);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    decorate(EventTarget.prototype, "addEventListener", function(addEventListener, type) {
      if (type !== "scroll")
        return;
      const handleScrollEnd = debounce(() => {
        if (!pointers.size) {
          this.dispatchEvent(new Event("scrollend"));
        } else {
          handleScrollEnd();
        }
      }, 100);
      addEventListener.call(this, "scroll", handleScrollEnd, { passive: true });
      scrollHandlers.set(this, handleScrollEnd);
    });
    decorate(EventTarget.prototype, "removeEventListener", function(removeEventListener, type) {
      if (type !== "scroll")
        return;
      const scrollHandler = scrollHandlers.get(this);
      if (scrollHandler) {
        removeEventListener.call(this, "scroll", scrollHandler, { passive: true });
      }
    });
  }
})();

export {};
