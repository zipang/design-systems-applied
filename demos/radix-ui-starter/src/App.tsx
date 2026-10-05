import type * as React from "react";
import { ComponentsDemo } from "./components/demo/ComponentsDemo";

/**
 * Application root. Renders the components demo; the chat UI is added in a later
 * phase of T0002.
 */
export const App: React.FC = () => <ComponentsDemo />;
