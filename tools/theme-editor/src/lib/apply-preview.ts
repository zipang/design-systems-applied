import { serializeTokensCss } from "./contract";
import type { TokenValues } from "./design-system";

/** Brand and action bases that carry derived `muted` / `active` variants. */
const VARIANT_BASES: { base: string; names: string[] }[] = [
	{ base: "brand", names: ["accent", "primary", "secondary", "tertiary"] },
	{ base: "action", names: ["success", "info", "warning", "danger"] }
];

/**
 * Derived color variants for a preview scope. These variables are not tokens; they
 * mirror `color-variants.css` so the scoped preview recomputes them from the edited
 * base colors rather than from `:root`.
 */
export const scopedColorVariants = (scope: string): string => {
	const lines = [`${scope} {`];
	for (const { base, names } of VARIANT_BASES) {
		for (const name of names) {
			const variable = `--color-${base}-${name}`;
			lines.push(`\t${variable}-muted: hsl(from var(${variable}) h calc(s * 0.8) calc(l * 1.2));`);
			lines.push(`\t${variable}-active: hsl(from var(${variable}) h calc(s * 1.2) calc(l * 1.1));`);
		}
	}
	lines.push("}");
	return lines.join("\n");
};

/**
 * The stylesheet that scopes the edited tokens (and their derived variants) to the
 * preview subtree, leaving the tool's own chrome on `:root`.
 */
export const previewStylesheet = (values: TokenValues, scope = "[data-ds-preview]"): string =>
	`${serializeTokensCss(values, scope)}\n${scopedColorVariants(scope)}`;
