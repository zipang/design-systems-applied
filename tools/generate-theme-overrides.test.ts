import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	readThemeInput,
	renderThemeOverrides,
	THEMES_DIR,
	themeIds
} from "./generate-theme-overrides";

for (const id of themeIds()) {
	test(`${id}: ui-theme-overrides.css is up to date`, () => {
		const expected = renderThemeOverrides(readThemeInput(join(THEMES_DIR, id)));
		const actual = readFileSync(join(THEMES_DIR, id, "ui-theme-overrides.css"), "utf8");

		expect(actual).toBe(expected);
	});
}

test("uses the theme text token when it meets AA", () => {
	const output = renderThemeOverrides({
		textBase: "#111111",
		textOnDark: "#ffffff",
		roles: [{ name: "primary", color: "#111111" }]
	});

	expect(output).toContain("--color-on-primary: var(--color-text-ondark);");
});

test("falls back to black ink when neither text token meets AA", () => {
	const output = renderThemeOverrides({
		textBase: "#f8f8f2",
		textOnDark: "#ffffff",
		roles: [{ name: "primary", color: "#bd93f9" }]
	});

	expect(output).toContain("--color-on-primary: #000000;");
});

test("falls back to white ink on a dark background", () => {
	const output = renderThemeOverrides({
		textBase: "#111111",
		textOnDark: "#222222",
		roles: [{ name: "primary", color: "#000000" }]
	});

	expect(output).toContain("--color-on-primary: #ffffff;");
});
