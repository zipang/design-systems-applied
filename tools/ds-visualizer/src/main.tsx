import { createRoot } from "react-dom/client";
import tokensCss from "../design-tokens.css" with { type: "text" };
import themeOverrides from "../ui-theme-overrides.css" with { type: "text" };
import { App } from "./App";
import "@styles/color-variants.css";
import "@styles/reset.css";
import "@styles/utilities.css";

// The tool's own Design System is injected at runtime so the same stylesheet can be
// imported as text by the theme store without a duplicate-import conflict.
const themeElt = document.createElement("style");
themeElt.textContent = `${tokensCss}\n${themeOverrides}`;
document.head.prepend(themeElt);

const rootElt = document.getElementById("root");

if (rootElt) {
	createRoot(rootElt).render(<App />);
}
