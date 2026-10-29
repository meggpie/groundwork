let basePath = "";
let iconPath = "";
let kitCode = "";
export function setBasePath(path) {
  basePath = path;
}
export function getBasePath(subpath = "") {
  if (!basePath) {
    const el = document.querySelector("[data-webawesome]");
    if (el?.hasAttribute("data-webawesome")) {
      const rootRelativeUrl = new URL(el.getAttribute("data-webawesome") ?? "", window.location.href).pathname;
      setBasePath(rootRelativeUrl);
    } else {
      const scripts = [...document.getElementsByTagName("script")];
      const waScript = scripts.find((script) => script.src.endsWith("webawesome.js") || script.src.endsWith("webawesome.loader.js") || script.src.endsWith("webawesome.ssr-loader.js"));
      if (waScript) {
        const path = String(waScript.getAttribute("src"));
        setBasePath(path.split("/").slice(0, -1).join("/"));
      }
    }
  }
  return basePath.replace(/\/$/, "") + (subpath ? `/${subpath.replace(/^\//, "")}` : ``);
}
export function setIconPath(path) {
  iconPath = path;
}
export function getIconPath() {
  return iconPath.replace(/\/$/, "");
}
export function setKitCode(code) {
  kitCode = code;
}
export function getKitCode() {
  if (!kitCode) {
    const el = document.querySelector("[data-fa-kit-code]");
    if (el) {
      setKitCode(el.getAttribute("data-fa-kit-code") || "");
    }
  }
  return kitCode;
}
