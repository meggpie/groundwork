import { directive } from "../directive.js";
import { UnsafeHTMLDirective } from "./unsafe-html.js";
const MATHML_RESULT = 3;

class UnsafeMathMLDirective extends UnsafeHTMLDirective {
  static directiveName = "unsafeMath";
  static resultType = MATHML_RESULT;
}
export const unsafeMathML = directive(UnsafeMathMLDirective);
