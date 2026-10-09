import { DEFAULT_THEME_OVERRIDES, DEFAULT_TOKENS_CSS } from "@lib/default-theme";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@styles/color-variants.css";
import "@styles/reset.css";
import "@styles/utilities.css";

// The tool's own Design System is injected at runtime so the same source can be reused
// by the theme store without a duplicate text-import conflict.
const themeElt = document.createElement("style");
themeElt.textContent = `${DEFAULT_TOKENS_CSS}\n${DEFAULT_THEME_OVERRIDES}`;
document.head.prepend(themeElt);

const rootElt = document.getElementById("root");

if (rootElt) {
	createRoot(rootElt).render(<App />);
}
