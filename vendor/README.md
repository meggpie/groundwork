# Vendored libraries

Committed so blocks can be packed without npm or a network connection. Don't edit these files by hand.

| Folder | What | Version | Licence |
|---|---|---|---|
| `webawesome/` | Web Awesome free components as unbundled ES modules (`<name>.js` per component), plus Lit, Floating UI and Shoelace Localize | Web Awesome 3.14.0, `shoelace-style/webawesome@dffa8d7` | MIT (`webawesome/LICENSE-*`) |
| `webawesome/webawesome-base.css` | Web Awesome cascade layers, default theme structure and layout utilities (no palette; colours come from `theme/groundwork.css`) | same | MIT |
| `lucide/icons.json` | Lucide icon set (1,998 icons), name → SVG body | `lucide-icons/lucide@81875c8` | ISC |

Not included: `code-highlighter`, `markdown`, `color-picker`, `qr-code` and `animation` (they need extra dependencies), and Web Awesome Pro.

One local change: `modules/webawesome/components/icon/icon.js` reads inline SVG data URIs directly instead of with `fetch`, so icons work in frames that block fetch.

The modules were compiled from source because the build environment had no npm access. To update, rebuild from a newer Web Awesome release and replace these folders in one commit.
