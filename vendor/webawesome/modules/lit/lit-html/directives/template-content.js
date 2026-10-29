import { noChange } from "../lit-html.js";
import { directive, Directive, PartType } from "../directive.js";

class TemplateContentDirective extends Directive {
  constructor(partInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.CHILD) {
      throw new Error("templateContent can only be used in child bindings");
    }
  }
  render(template) {
    if (this._previousTemplate === template) {
      return noChange;
    }
    this._previousTemplate = template;
    return document.importNode(template.content, true);
  }
}
export const templateContent = directive(TemplateContentDirective);
