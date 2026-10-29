import { __legacyDecorateClassTS as __legacyDecorateClassTS_3r173x8m } from "../../../shims/bun-wrap.js";
import { html } from "../../../lit/lit/index.js";
import { customElement, property, query, state } from "../../../lit/lit/decorators.js";
import { classMap } from "../../../lit/lit/directives/class-map.js";
import { WaCopyEvent } from "../../events/copy.js";
import { WaErrorEvent } from "../../events/error.js";
import { animateWithClass } from "../../internal/animate.js";
import { announce } from "../../internal/live-announcer.js";
import { uniqueId } from "../../internal/math.js";
import { watch } from "../../internal/watch.js";
import WebAwesomeElement from "../../internal/webawesome-element.js";
import hostStyles from "../../styles/component/host.styles.js";
import visuallyHidden from "../../styles/component/visually-hidden.styles.js";
import { LocalizeController } from "../../utilities/localize.js";
import"../icon/icon.js";
import"../tooltip/tooltip.js";
import styles from "./copy-button.styles.js";
const INTERNAL_TOOLTIP_SLOT = "wa-internal-tooltip";
const ASSIGNED_ID_PROP = "__waCopyButtonAssignedId";
export default class WaCopyButton extends WebAwesomeElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.isCopying = false;
    this.status = "rest";
    this.hasCustomTrigger = false;
    this.customTriggerEl = null;
    this.lightTooltip = null;
    this.feedbackTimeout = null;
    this.value = "";
    this.from = "";
    this.disabled = false;
    this.copyLabel = "";
    this.successLabel = "";
    this.errorLabel = "";
    this.feedbackDuration = 1000;
    this.tooltipPlacement = "top";
    this.tooltip = "full";
    this.handleDefaultSlotChange = () => {
      const assigned = this.defaultSlot?.assignedElements({ flatten: true }) ?? [];
      const trigger = assigned.find((el) => el instanceof HTMLElement) ?? null;
      if (trigger !== this.customTriggerEl) {
        this.releaseAssignedId(this.customTriggerEl);
        this.customTriggerEl = trigger;
      }
      this.hasCustomTrigger = trigger !== null;
      if (trigger && this.tooltip !== "none") {
        if (!trigger.id) {
          trigger.id = uniqueId("wa-copy-button-trigger-");
          trigger[ASSIGNED_ID_PROP] = true;
        }
        this.ensureLightTooltip();
      } else {
        this.removeLightTooltip();
      }
    };
  }
  static css = [hostStyles, visuallyHidden, styles];
  get activeTooltip() {
    return this.lightTooltip ?? this.shadowTooltip ?? null;
  }
  get currentLabel() {
    if (this.status === "success") {
      return this.successLabel || this.localize.term("copied");
    }
    if (this.status === "error") {
      return this.errorLabel || this.localize.term("error");
    }
    return this.copyLabel || this.localize.term("copy");
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.didSSR) {
      this.updateComplete.then(() => {
        this.handleDefaultSlotChange();
      });
    } else {
      this.handleDefaultSlotChange();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeLightTooltip();
  }
  handleStatusChange() {
    this.customStates.set("success", this.status === "success");
    this.customStates.set("error", this.status === "error");
    this.syncTooltipText();
    if (this.status === "success" || this.status === "error") {
      announce(this.currentLabel, "polite");
    }
  }
  handleLabelChange() {
    this.syncTooltipText();
  }
  handleTooltipOptionsChange() {
    if (this.lightTooltip) {
      this.lightTooltip.placement = this.tooltipPlacement;
      this.lightTooltip.disabled = this.disabled;
    }
  }
  handleTooltipModeChange(oldValue) {
    if (this.tooltip === "none") {
      this.removeLightTooltip();
    } else if (oldValue === "none") {
      this.handleDefaultSlotChange();
    } else if (this.lightTooltip) {
      this.lightTooltip.setAttribute("trigger", this.tooltip === "copy" ? "manual" : "hover focus");
    }
  }
  releaseAssignedId(el) {
    if (el && el[ASSIGNED_ID_PROP]) {
      el.removeAttribute("id");
      delete el[ASSIGNED_ID_PROP];
    }
  }
  ensureLightTooltip() {
    if (!this.customTriggerEl) {
      return;
    }
    const triggerValue = this.tooltip === "copy" ? "manual" : "hover focus";
    if (!this.lightTooltip) {
      const tooltip = document.createElement("wa-tooltip");
      tooltip.setAttribute("slot", INTERNAL_TOOLTIP_SLOT);
      tooltip.setAttribute("part", "feedback");
      tooltip.setAttribute("trigger", triggerValue);
      tooltip.dataset.copyButtonTooltip = "";
      tooltip.setAttribute("for", this.customTriggerEl.id);
      tooltip.placement = this.tooltipPlacement;
      tooltip.disabled = this.disabled;
      tooltip.textContent = this.currentLabel;
      this.appendChild(tooltip);
      this.lightTooltip = tooltip;
    } else {
      this.lightTooltip.setAttribute("for", this.customTriggerEl.id);
      this.lightTooltip.setAttribute("trigger", triggerValue);
      this.lightTooltip.placement = this.tooltipPlacement;
      this.lightTooltip.disabled = this.disabled;
      this.lightTooltip.textContent = this.currentLabel;
    }
  }
  removeLightTooltip() {
    if (this.lightTooltip) {
      this.releaseAssignedId(this.customTriggerEl);
      this.lightTooltip.remove();
      this.lightTooltip = null;
    }
  }
  syncTooltipText() {
    if (this.lightTooltip) {
      this.lightTooltip.textContent = this.currentLabel;
    }
  }
  async handleCopy() {
    if (this.disabled || this.isCopying) {
      return;
    }
    this.isCopying = true;
    let valueToCopy = this.value;
    if (this.from) {
      const root = this.getRootNode();
      const isProperty = this.from.includes(".");
      const isAttribute = this.from.includes("[") && this.from.includes("]");
      let id = this.from;
      let field = "";
      if (isProperty) {
        [id, field] = this.from.trim().split(".");
      } else if (isAttribute) {
        [id, field] = this.from.trim().replace(/\]$/, "").split("[");
      }
      const target = "getElementById" in root ? root.getElementById(id) : null;
      if (target) {
        if (isAttribute) {
          valueToCopy = target.getAttribute(field) || "";
        } else if (isProperty) {
          valueToCopy = target[field] || "";
        } else {
          valueToCopy = target.textContent || "";
        }
      } else {
        this.showStatus("error");
        this.dispatchEvent(new WaErrorEvent);
        return;
      }
    }
    if (!valueToCopy) {
      this.showStatus("error");
      this.dispatchEvent(new WaErrorEvent);
    } else {
      try {
        await navigator.clipboard.writeText(valueToCopy);
        this.showStatus("success");
        this.dispatchEvent(new WaCopyEvent({ value: valueToCopy }));
      } catch (error) {
        this.showStatus("error");
        this.dispatchEvent(new WaErrorEvent);
      }
    }
  }
  async showStatus(status) {
    this.status = status;
    if (this.copyIcon) {
      const iconToShow = status === "success" ? this.successIcon : this.errorIcon;
      await animateWithClass(this.copyIcon, "hide");
      this.copyIcon.hidden = true;
      iconToShow.hidden = false;
      await animateWithClass(iconToShow, "show");
    }
    await this.updateComplete;
    const tooltip = this.tooltip === "none" ? null : this.activeTooltip;
    let earlyClose = null;
    if (tooltip) {
      tooltip.show();
      earlyClose = new Promise((resolve) => {
        tooltip.addEventListener("wa-after-hide", () => {
          if (this.feedbackTimeout !== null) {
            clearTimeout(this.feedbackTimeout);
            this.feedbackTimeout = null;
          }
          resolve();
        }, { once: true });
      });
      this.feedbackTimeout = window.setTimeout(async () => {
        this.feedbackTimeout = null;
        await tooltip.hide();
      }, this.feedbackDuration);
    }
    setTimeout(async () => {
      if (earlyClose) {
        await earlyClose;
      }
      if (this.copyIcon) {
        const iconToShow = status === "success" ? this.successIcon : this.errorIcon;
        await animateWithClass(iconToShow, "hide");
        iconToShow.hidden = true;
        this.copyIcon.hidden = false;
        await animateWithClass(this.copyIcon, "show");
      }
      this.status = "rest";
      this.isCopying = false;
    }, this.feedbackDuration);
  }
  render() {
    const hasCustomTrigger = this.hasCustomTrigger;
    let showTooltip = !hasCustomTrigger && this.tooltip !== "none";
    const triggerValue = this.tooltip === "copy" ? "manual" : "hover focus";
    if (this.didSSR && !this.hasUpdated) {
      showTooltip = false;
    }
    return html`
      <div class="copy-button__trigger" @click=${this.handleCopy}>
        <slot @slotchange=${this.handleDefaultSlotChange}></slot>
        <button
          class="button"
          part="button"
          type="button"
          id="copy-button"
          aria-label=${this.currentLabel}
          ?disabled=${this.disabled}
          ?hidden=${this.hasCustomTrigger}
        >
          <slot part="copy-icon" name="copy-icon">
            <wa-icon library="system" name="copy" variant="regular"></wa-icon>
          </slot>
          <slot part="success-icon" name="success-icon" variant="solid" hidden>
            <wa-icon library="system" name="check"></wa-icon>
          </slot>
          <slot part="error-icon" name="error-icon" variant="solid" hidden>
            <wa-icon library="system" name="xmark"></wa-icon>
          </slot>
        </button>

        ${showTooltip ? html`
              <wa-tooltip
                part="feedback"
                for="copy-button"
                placement=${this.tooltipPlacement}
                trigger=${triggerValue}
                class=${classMap({
      "copy-button-tooltip": true,
      "copy-button-tooltip-success": this.status === "success",
      "copy-button-tooltip-error": this.status === "error"
    })}
                ?disabled=${this.disabled}
                >${this.currentLabel}</wa-tooltip
              >
            ` : ""}
        <slot name="${INTERNAL_TOOLTIP_SLOT}"></slot>
      </div>
    `;
  }
}
__legacyDecorateClassTS_3r173x8m([
  query('slot[name="copy-icon"]')
], WaCopyButton.prototype, "copyIcon", undefined);
__legacyDecorateClassTS_3r173x8m([
  query('slot[name="success-icon"]')
], WaCopyButton.prototype, "successIcon", undefined);
__legacyDecorateClassTS_3r173x8m([
  query('slot[name="error-icon"]')
], WaCopyButton.prototype, "errorIcon", undefined);
__legacyDecorateClassTS_3r173x8m([
  query("slot:not([name])")
], WaCopyButton.prototype, "defaultSlot", undefined);
__legacyDecorateClassTS_3r173x8m([
  query('wa-tooltip[part="feedback"]')
], WaCopyButton.prototype, "shadowTooltip", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaCopyButton.prototype, "isCopying", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaCopyButton.prototype, "status", undefined);
__legacyDecorateClassTS_3r173x8m([
  state()
], WaCopyButton.prototype, "hasCustomTrigger", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaCopyButton.prototype, "value", undefined);
__legacyDecorateClassTS_3r173x8m([
  property()
], WaCopyButton.prototype, "from", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ type: Boolean, reflect: true })
], WaCopyButton.prototype, "disabled", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "copy-label" })
], WaCopyButton.prototype, "copyLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "success-label" })
], WaCopyButton.prototype, "successLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "error-label" })
], WaCopyButton.prototype, "errorLabel", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "feedback-duration", type: Number })
], WaCopyButton.prototype, "feedbackDuration", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ attribute: "tooltip-placement", reflect: true })
], WaCopyButton.prototype, "tooltipPlacement", undefined);
__legacyDecorateClassTS_3r173x8m([
  property({ reflect: true })
], WaCopyButton.prototype, "tooltip", undefined);
__legacyDecorateClassTS_3r173x8m([
  watch("status")
], WaCopyButton.prototype, "handleStatusChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch(["copyLabel", "successLabel", "errorLabel"])
], WaCopyButton.prototype, "handleLabelChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch(["tooltipPlacement", "disabled"], { waitUntilFirstUpdate: true })
], WaCopyButton.prototype, "handleTooltipOptionsChange", null);
__legacyDecorateClassTS_3r173x8m([
  watch("tooltip", { waitUntilFirstUpdate: true })
], WaCopyButton.prototype, "handleTooltipModeChange", null);
WaCopyButton = __legacyDecorateClassTS_3r173x8m([
  customElement("wa-copy-button")
], WaCopyButton);
