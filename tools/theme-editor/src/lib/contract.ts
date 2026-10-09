import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
	isIgnoredPath,
	TOKENS,
	type TokenValues,
	tokenByPath,
	tokenByVariable
} from "./design-system";

/** Result of parsing a `DESIGN.md` front matter block. */
export interface ParsedDesignMd {
	/** Variable → value, for every known token declared in the front matter. */
	values: TokenValues;
	/** Token paths actually declared in the front matter. */
	declaredPaths: Set<string>;
	/** Front-matter paths that match no token and are not ignored. */
	unknownPaths: string[];
	/** The original parsed front-matter object, for lossless re-serialization. */
	frontMatter: Record<string, unknown>;
	/** The markdown body after the front matter. */
	body: string;
}

/** Normalize a CSS or YAML scalar: collapse whitespace and trim. */
export const normalizeValue = (value: string): string => value.replace(/\s+/g, " ").trim();

const flatten = (value: unknown, prefix: string, out: Record<string, string>): void => {
	if (value === null || value === undefined) return;
	if (typeof value === "object" && !Array.isArray(value)) {
		for (const [key, child] of Object.entries(value)) {
			flatten(child, prefix ? `${prefix}.${key}` : key, out);
		}
		return;
	}
	out[prefix] = String(value);
};

const setPath = (root: Record<string, unknown>, path: string, value: string): void => {
	const segments = path.split(".");
	let cursor = root;
	for (const segment of segments.slice(0, -1)) {
		const next: unknown = cursor[segment];
		if (typeof next !== "object" || next === null) cursor[segment] = {};
		cursor = cursor[segment] as Record<string, unknown>;
	}
	cursor[segments.at(-1) ?? path] = value;
};

const deletePath = (root: Record<string, unknown>, path: string): void => {
	const segments = path.split(".");
	let cursor: Record<string, unknown> | undefined = root;
	for (const segment of segments.slice(0, -1)) {
		const next: unknown = cursor?.[segment];
		cursor =
			typeof next === "object" && next !== null ? (next as Record<string, unknown>) : undefined;
	}
	const leaf = segments.at(-1);
	if (cursor && leaf) delete cursor[leaf];
};

const VARIABLE_REFERENCE = /var\(\s*(--[\w-]+)(?:\s*,\s*([^)]+))?\s*\)/g;

/**
 * Resolve `var(--x)` references against a value map so a front-matter literal and a
 * stylesheet alias compare equal. Depth is bounded to avoid reference cycles.
 */
export const resolveVariables = (value: string, values: TokenValues, depth = 0): string => {
	if (depth > 8 || !value.includes("var(")) return value;
	const next = value.replace(VARIABLE_REFERENCE, (_match, name: string, fallback?: string) => {
		const referenced = values[name];
		if (referenced !== undefined) return referenced;
		return fallback?.trim() ?? "";
	});
	return next === value ? next : resolveVariables(next, values, depth + 1);
};

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Parse a `DESIGN.md` file into token values and preserved metadata. */
export const parseDesignMd = (text: string): ParsedDesignMd => {
	const match = FRONT_MATTER.exec(text);
	if (!match) throw new Error("DESIGN.md: missing YAML front matter");
	const frontMatter = (parseYaml(match[1] ?? "") ?? {}) as Record<string, unknown>;

	const flat: Record<string, string> = {};
	flatten(frontMatter, "", flat);

	const values: TokenValues = {};
	const declaredPaths = new Set<string>();
	const unknownPaths: string[] = [];

	for (const [path, value] of Object.entries(flat)) {
		if (isIgnoredPath(path)) continue;
		const token = tokenByPath(path);
		if (!token) {
			unknownPaths.push(path);
			continue;
		}
		values[token.variable] = normalizeValue(value);
		declaredPaths.add(path);
	}

	return { values, declaredPaths, unknownPaths, frontMatter, body: match[2] ?? "" };
};

/**
 * Rebuild the `DESIGN.md` front matter from token values, preserving metadata and prose.
 * Optional tokens that still equal their documented fallback are omitted, per the contract.
 */
export const serializeDesignMd = (values: TokenValues, original: string): string => {
	const parsed = parseDesignMd(original);
	const frontMatter = structuredClone(parsed.frontMatter);

	for (const token of TOKENS) {
		if (!token.path) continue;
		const value = values[token.variable];
		if (value === undefined || value === "") continue;
		if (
			!token.required &&
			token.fallback !== undefined &&
			normalizeValue(value) === normalizeValue(token.fallback)
		) {
			deletePath(frontMatter, token.path);
			continue;
		}
		setPath(frontMatter, token.path, value);
	}

	const yamlText = stringifyYaml(frontMatter, { lineWidth: 0 });
	return `---\n${yamlText}---\n${parsed.body}`;
};

const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;
const CSS_VARIABLE = /--([\w-]+)\s*:\s*([^;]+);/g;

/** Parse every custom property from a stylesheet into a variable → value map. */
export const parseTokensCss = (text: string): TokenValues => {
	const clean = text.replace(CSS_COMMENT, "");
	const values: TokenValues = {};
	for (;;) {
		const match = CSS_VARIABLE.exec(clean);
		if (match === null) break;
		const name = match[1];
		const raw = match[2];
		if (name !== undefined && raw !== undefined) values[`--${name}`] = normalizeValue(raw);
	}
	return values;
};

/** Serialize the full token set into one scoped block. Optional tokens keep their fallbacks. */
export const serializeTokensCss = (values: TokenValues, selector = ":root"): string => {
	const lines = [`${selector} {`];
	let currentGroup = "";
	for (const token of TOKENS) {
		if (token.group !== currentGroup) {
			if (currentGroup !== "") lines.push("");
			lines.push(`\t/* ${token.group} */`);
			currentGroup = token.group;
		}
		const value = values[token.variable] || token.fallback || "";
		lines.push(`\t${token.variable}: ${value};`);
	}
	lines.push("}");
	return lines.join("\n");
};

/** Rewrite a stylesheet's root selector so the tokens apply only inside a preview scope. */
export const scopeTokensCss = (css: string, scope: string): string => css.replace(/:root\b/, scope);

/** A contract is the two parsed files plus their merged view. */
export interface Contract {
	designValues: TokenValues;
	cssValues: TokenValues;
	declaredPaths: Set<string>;
	unknownPaths: string[];
	body: string;
}

/** Parse both halves of the contract. CSS values win for keys absent from the front matter. */
export const parseContract = (designMd: string, tokensCss: string): Contract => {
	const design = parseDesignMd(designMd);
	const cssValues = parseTokensCss(tokensCss);
	return {
		designValues: design.values,
		cssValues,
		declaredPaths: design.declaredPaths,
		unknownPaths: design.unknownPaths,
		body: design.body
	};
};

/** Merge both halves into one value map, preferring the front matter. */
export const mergeValues = (contract: Contract): TokenValues => ({
	...contract.cssValues,
	...contract.designValues
});

/** True when a variable is a registered token. */
export const isKnownVariable = (variable: string): boolean => Boolean(tokenByVariable(variable));
