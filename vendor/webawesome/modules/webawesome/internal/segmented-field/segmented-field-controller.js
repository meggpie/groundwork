const DEFAULT_SEPARATORS = ["/", ".", "-", ":", ",", " "];

export class SegmentedFieldController {
  constructor(host, config) {
    this.buffers = new Map;
    this.active = null;
    this.handleFocus = (event) => {
      const el = event.currentTarget;
      const group = el.dataset.group;
      const field = el.dataset.segment;
      this.active = { group, field };
      for (const segment of this.segmentElements()) {
        segment.tabIndex = segment === el ? 0 : -1;
      }
    };
    this.handleBlur = (event) => {
      const el = event.currentTarget;
      const group = el.dataset.group;
      const field = el.dataset.segment;
      if (this.getBuffer(group, field))
        this.flushBuffer(group, field);
    };
    this.handleKeyDown = (event) => {
      const el = event.currentTarget ?? event.composedPath().find((t) => {
        return t instanceof HTMLElement && t.dataset.group && t.dataset.segment;
      }) ?? null;
      if (!el)
        return;
      const group = el.dataset.group;
      const field = el.dataset.segment;
      if (!group || !field)
        return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        if (this.isReadonlyOrDisabled())
          return;
        if (this.getBuffer(group, field))
          this.flushBuffer(group, field);
        const delta = event.key === "ArrowUp" ? 1 : -1;
        const result = this.config.rules.step(group, field, delta);
        if (result)
          this.config.onCommit?.(group, field, result.value);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        if (this.getBuffer(group, field))
          this.flushBuffer(group, field);
        const visualLeft = event.key === "ArrowLeft";
        const logicalPrev = this.config.isRtl() ? !visualLeft : visualLeft;
        this.moveFocus(el, logicalPrev ? -1 : 1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        this.segmentElements()[0]?.focus({ preventScroll: true });
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        const segments = this.segmentElements();
        segments[segments.length - 1]?.focus({ preventScroll: true });
        return;
      }
      if (event.key === "Tab") {
        if (this.getBuffer(group, field))
          this.flushBuffer(group, field);
        return;
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        if (this.isReadonlyOrDisabled())
          return;
        const buffer = this.getBuffer(group, field);
        if (buffer) {
          this.setBuffer(group, field, "");
          this.config.onCommit?.(group, field, null);
        } else {
          const hadValue = this.config.rules.clear(group, field);
          if (hadValue) {
            this.config.onCommit?.(group, field, null);
          } else if (event.key === "Backspace") {
            this.moveFocus(el, -1);
          }
        }
        return;
      }
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        if (this.isReadonlyOrDisabled())
          return;
        const buffer = this.getBuffer(group, field);
        const result = this.config.rules.typeDigit(group, field, buffer, event.key);
        this.setBuffer(group, field, result.buffer);
        this.config.onCommit?.(group, field, result.value);
        if (result.advance)
          this.moveFocus(el, 1);
        return;
      }
      const seps = this.config.separatorKeys ?? DEFAULT_SEPARATORS;
      if (seps.includes(event.key)) {
        event.preventDefault();
        if (this.getBuffer(group, field))
          this.flushBuffer(group, field);
        this.moveFocus(el, 1);
        return;
      }
    };
    this.host = host;
    this.config = config;
    host.addController(this);
  }
  hostConnected() {}
  hostDisconnected() {
    this.buffers.clear();
    this.active = null;
  }
  getBuffer(group, field) {
    return this.buffers.get(this.key(group, field)) ?? "";
  }
  setBuffer(group, field, buffer) {
    const k = this.key(group, field);
    if (buffer)
      this.buffers.set(k, buffer);
    else
      this.buffers.delete(k);
  }
  clearBuffers() {
    this.buffers.clear();
  }
  getActiveSegment() {
    return this.active;
  }
  setActiveSegment(group, field) {
    this.active = { group, field };
  }
  segmentElements() {
    const root = this.host.shadowRoot;
    if (!root)
      return [];
    return Array.from(root.querySelectorAll("[data-segment][data-group]"));
  }
  segmentElementFor(group, field) {
    const root = this.host.shadowRoot;
    if (!root)
      return null;
    return root.querySelector(`[data-group="${group}"][data-segment="${field}"]`);
  }
  findFocusableSegment(isEmpty) {
    const segments = this.segmentElements();
    if (segments.length === 0)
      return null;
    const firstEmpty = segments.find((el) => {
      const group = el.dataset.group;
      const field = el.dataset.segment;
      return isEmpty(group, field) && !this.getBuffer(group, field);
    });
    return firstEmpty ?? segments[0];
  }
  focusActiveSegment(options) {
    if (this.active) {
      const el = this.segmentElementFor(this.active.group, this.active.field);
      if (el) {
        el.focus({ preventScroll: true, ...options });
        return;
      }
    }
    this.segmentElements()[0]?.focus({ preventScroll: true, ...options });
  }
  moveFocus(from, direction, options) {
    const segments = this.segmentElements();
    const idx = segments.indexOf(from);
    if (idx < 0)
      return;
    const next = segments[idx + direction];
    if (next)
      next.focus({ preventScroll: true, ...options });
  }
  flushBuffer(group, field) {
    const buffer = this.getBuffer(group, field);
    if (!buffer)
      return false;
    const value = this.config.rules.commitBuffer(group, field, buffer);
    this.setBuffer(group, field, "");
    this.config.onCommit?.(group, field, value);
    return true;
  }
  flushAllBuffers() {
    for (const [k, buffer] of this.buffers) {
      if (!buffer)
        continue;
      const [group, field] = k.split(":");
      const value = this.config.rules.commitBuffer(group, field, buffer);
      this.config.onCommit?.(group, field, value);
    }
    this.buffers.clear();
  }
  eventHandlers() {
    return {
      keydown: this.handleKeyDown,
      focus: this.handleFocus,
      blur: this.handleBlur
    };
  }
  handleKeyDownEvent(event) {
    const defaultPreventedBefore = event.defaultPrevented;
    this.handleKeyDown(event);
    return event.defaultPrevented && !defaultPreventedBefore;
  }
  key(group, field) {
    return `${group}:${field}`;
  }
  isReadonlyOrDisabled() {
    return !!(this.config.isReadonly?.() || this.config.isDisabled?.());
  }
}
