import { createRoot } from "react-dom/client";
import { App } from "./App";

const rootElt = document.getElementById("root");

if (rootElt) {
	createRoot(rootElt).render(<App />);
}
