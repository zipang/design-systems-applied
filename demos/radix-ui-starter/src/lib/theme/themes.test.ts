import { expect, test } from "bun:test";
import { DEFAULT_THEME, getTheme, themes } from "./themes";

test("the reference theme is first and is the default", () => {
	expect(themes[0]?.id).toBe(DEFAULT_THEME);
});

test("getTheme returns the matching theme", () => {
	expect(getTheme("monokai").label).toBe("Monokai");
});

test("getTheme falls back to the default for an unknown id", () => {
	expect(getTheme("unknown").id).toBe(DEFAULT_THEME);
});

test("every theme carries a non-empty stylesheet", () => {
	for (const theme of themes) {
		expect(theme.css.length).toBeGreaterThan(0);
	}
});
