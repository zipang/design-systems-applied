import { ThemeProvider } from "@lib/theme/ThemeProvider";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@styles/reset.css";
import "@styles/color-variants.css";
import "@styles/utilities.css";

const rootElt = document.getElementById("root");

if (rootElt) {
	createRoot(rootElt).render(
		<ThemeProvider>
			<App />
		</ThemeProvider>
	);
}
