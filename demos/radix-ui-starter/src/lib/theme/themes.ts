import draculaCss from "../../../themes/dracula/design-tokens.css" with { type: "text" };
import gruvboxCss from "../../../themes/gruvbox/design-tokens.css" with { type: "text" };
import monokaiCss from "../../../themes/monokai/design-tokens.css" with { type: "text" };
import referenceCss from "../../../themes/reference/design-tokens.css" with { type: "text" };

/** Identifiers of the bundled themes. */
export type ThemeId = "reference" | "monokai" | "dracula" | "gruvbox";

/** A complete theme: its id, display label, and stylesheet text. */
export interface Theme {
	id: ThemeId;
	label: string;
	css: string;
}

/** The themes available to the theme switcher. The reference theme is first. */
export const themes: Theme[] = [
	{ id: "reference", label: "Reference", css: referenceCss },
	{ id: "monokai", label: "Monokai", css: monokaiCss },
	{ id: "dracula", label: "Dracula", css: draculaCss },
	{ id: "gruvbox", label: "Gruvbox", css: gruvboxCss }
];

/** The theme used on first load. */
export const DEFAULT_THEME: ThemeId = "reference";

const FALLBACK_THEME: Theme = { id: DEFAULT_THEME, label: "Reference", css: "" };

/**
 * Return the theme with the given id. Fall back to the default theme when the id is
 * unknown.
 */
export const getTheme = (id: string): Theme =>
	themes.find((theme) => theme.id === id) ?? FALLBACK_THEME;
