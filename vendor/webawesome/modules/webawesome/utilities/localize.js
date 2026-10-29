import { LocalizeController as DefaultLocalizationController, registerTranslation } from "../../localize/index.js";
import en from "../translations/en.js";

export class LocalizeController extends DefaultLocalizationController {
  static {
    registerTranslation(en);
  }
  lang() {
    if (this.host.didSSR && !this.host.hasUpdated) {
      return this.host.lang || "en";
    }
    return super.lang();
  }
}
export { registerTranslation } from "../../localize/index.js";
