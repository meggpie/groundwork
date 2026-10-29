import { directive } from "../directive.js";
import { UnsafeHTMLDirective } from "./unsafe-html.js";
const SVG_RESULT = 2;

class UnsafeSVGDirective extends UnsafeHTMLDirective {
  static directiveName = "unsafeSVG";
  static resultType = SVG_RESULT;
}
export const unsafeSVG = directive(UnsafeSVGDirective);
