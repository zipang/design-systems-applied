import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Rgb } from "./color-contrast";
import { contrastRatio, parseHex } from "./color-contrast";

/** Absolute path to the demo's theme directory. */
export const THEMES_DIR = join(import.meta.dir, "../demos/radix-ui-starter/themes");

const TEXT_BASE = "colors.text.base";
const TEXT_ON_DARK = "colors.text.ondark";
const TEXT_BASE_VAR = "--color-text";
const TEXT_ON_DARK_VAR = "--color-text-ondark";

/** WCAG AA contrast for normal text. */
const AA_NORMAL = 4.5;

const BLACK: Rgb = { r: 0, g: 0, b: 0 };
const WHITE: Rgb = { r: 255, g: 255, b: 255 };

/** A colored role that receives a generated `--color-on-*` variable. */
interface Role {
	/** Suffix of the variable, for example `primary` gives `--color-on-primary`. */
	name: string;
	/** Front-matter path of the background color. */
	path: string;
	/** Front-matter path used when the optional role is omitted. */
	fallback?: string;
}

const ROLES: Role[] = [
	{ name: "primary", path: "colors.brand.primary" },
	{ name: "accent", path: "colors.brand.accent" },
	{ name: "secondary", path: "colors.brand.secondary" },
	{ name: "tertiary", path: "colors.brand.tertiary", fallback: "colors.brand.primary" },
	{ name: "success", path: "colors.action.success" },
	{ name: "info", path: "colors.action.info" },
	{ name: "warning", path: "colors.action.warning" },
	{ name: "danger", path: "colors.action.danger" },
	{ name: "dark", path: "colors.surface.dark" }
];

/** The colors the generator needs: the two text colors and each role background. */
export interface ThemeOverridesInput {
	textBase: string;
	textOnDark: string;
	roles: { name: string; color: string }[];
}

const frontMatter = (markdown: string): Record<string, unknown> => {
	const match = markdown.match(/^---\n([\s\S]*?)\n---/);

	if (!match?.[1]) {
		throw new Error("front matter not found");
	}

	return parse(match[1]) as Record<string, unknown>;
};

const readPath = (source: unknown, path: string): unknown =>
	path.split(".").reduce<unknown>((current, key) => {
		if (current && typeof current === "object" && key in current) {
			return (current as Record<string, unknown>)[key];
		}

		return undefined;
	}, source);

const requireString = (source: unknown, path: string): string => {
	const value = readPath(source, path);

	if (typeof value !== "string") {
		throw new Error(`missing or non-string front matter value: ${path}`);
	}

	return value;
};

const requireHex = (value: string, label: string): Rgb => {
	const color = parseHex(value);

	if (!color) {
		throw new Error(`${label} must be a hex color, got: ${value}`);
	}

	return color;
};

/** Ids of every theme that has a `DESIGN.md`, sorted for determinism. */
export const themeIds = (): string[] =>
	readdirSync(THEMES_DIR)
		.filter((name) => existsSync(join(THEMES_DIR, name, "DESIGN.md")))
		.sort();

/** Read the text colors and role backgrounds from a theme's `DESIGN.md`. */
export const readThemeInput = (themeDir: string): ThemeOverridesInput => {
	const data = frontMatter(readFileSync(join(themeDir, "DESIGN.md"), "utf8"));

	return {
		textBase: requireString(data, TEXT_BASE),
		textOnDark: requireString(data, TEXT_ON_DARK),
		roles: ROLES.map((role) => ({
			name: role.name,
			color:
				role.fallback && readPath(data, role.path) === undefined
					? requireString(data, role.fallback)
					: requireString(data, role.path)
		}))
	};
};

/**
 * Pick the foreground for one background. Prefer the theme's own text token with the
 * higher contrast. When neither token reaches AA (common on dark themes whose two text
 * tokens are both light), fall back to pure black or white so the label stays legible.
 */
const resolveOnColor = (
	background: Rgb,
	textBase: Rgb,
	textOnDark: Rgb
): { value: string; ratio: number } => {
	const baseRatio = contrastRatio(textBase, background);
	const onDarkRatio = contrastRatio(textOnDark, background);
	const preferOnDark = onDarkRatio >= baseRatio;
	const themeRatio = preferOnDark ? onDarkRatio : baseRatio;

	if (themeRatio >= AA_NORMAL) {
		const variable = preferOnDark ? TEXT_ON_DARK_VAR : TEXT_BASE_VAR;

		return { value: `var(${variable})`, ratio: themeRatio };
	}

	const whiteRatio = contrastRatio(WHITE, background);
	const blackRatio = contrastRatio(BLACK, background);
	const useWhite = whiteRatio >= blackRatio;

	return {
		value: useWhite ? "#ffffff" : "#000000",
		ratio: useWhite ? whiteRatio : blackRatio
	};
};

/**
 * Render the `ui-theme-overrides.css` text for one theme. For each role, pick the text
 * color with the higher WCAG contrast against the role background, or a black/white ink
 * when neither theme text color reaches AA. A tie goes to the on-dark color. The output
 * is deterministic.
 */
export const renderThemeOverrides = (input: ThemeOverridesInput): string => {
	const textBase = requireHex(input.textBase, TEXT_BASE);
	const textOnDark = requireHex(input.textOnDark, TEXT_ON_DARK);

	const declarations = input.roles.map(({ name, color }) => {
		const background = requireHex(color, `--color-on-${name}`);
		const { value, ratio } = resolveOnColor(background, textBase, textOnDark);

		return [
			`\t/* ${name} ${color.toLowerCase()} -> ${value} (${ratio.toFixed(1)}:1) */`,
			`\t--color-on-${name}: ${value};`
		].join("\n");
	});

	return [
		"/* GENERATED by tools/generate-theme-overrides.ts. Do not edit by hand. */",
		":root {",
		declarations.join("\n"),
		"}",
		""
	].join("\n");
};

const main = async (): Promise<void> => {
	for (const id of themeIds()) {
		const themeDir = join(THEMES_DIR, id);
		const output = renderThemeOverrides(readThemeInput(themeDir));

		await Bun.write(join(themeDir, "ui-theme-overrides.css"), output);
		console.log(`generated themes/${id}/ui-theme-overrides.css`);
	}
};

if (import.meta.main) {
	await main();
}
