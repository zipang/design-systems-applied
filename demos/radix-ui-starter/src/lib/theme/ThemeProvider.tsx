import type * as React from "react";
import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Theme, ThemeId } from "./themes";
import { DEFAULT_THEME, getTheme, themes } from "./themes";

interface ThemeContextValue {
	theme: ThemeId;
	available: Theme[];
	setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
	children: React.ReactNode;
}

/**
 * Injects the active theme's stylesheet text into a single `<style>` element and
 * exposes the theme list. Each theme is a complete `:root` stylesheet, so switching
 * replaces the style text and leaves the cascade unchanged.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
	const styleElt = useRef<HTMLStyleElement>(null);
	const css = getTheme(theme).css;

	useLayoutEffect(() => {
		if (styleElt.current) {
			styleElt.current.textContent = css;
		}
	}, [css]);

	const value = useMemo<ThemeContextValue>(() => ({ theme, available: themes, setTheme }), [theme]);

	return (
		<ThemeContext.Provider value={value}>
			<style ref={styleElt} />
			{children}
		</ThemeContext.Provider>
	);
};

/**
 * Read the active theme and the theme list. Throws outside a ThemeProvider.
 */
export const useTheme = (): ThemeContextValue => {
	const value = useContext(ThemeContext);

	if (!value) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return value;
};
