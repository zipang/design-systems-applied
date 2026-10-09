import { normalizeValue, resolveVariables } from "./contract";
import { TOKENS, tokenByVariable } from "./design-system";

/** One validation finding. */
export interface Issue {
	level: "error" | "warning";
	code: string;
	message: string;
	target?: string;
}

/** The two parsed halves of the contract plus front-matter bookkeeping. */
export interface ValidationInput {
	designValues: Record<string, string>;
	cssValues: Record<string, string>;
	declaredPaths: Set<string>;
	unknownPaths: string[];
}

/**
 * Check a parsed contract against the section 10 rules of the design-system-tokens
 * skill. Returns one issue per violation; an empty array means the contract is valid.
 */
export const validateContract = ({
	designValues,
	cssValues,
	declaredPaths,
	unknownPaths
}: ValidationInput): Issue[] => {
	const issues: Issue[] = [];

	// Undocumented tokens are forbidden in the stylesheet.
	for (const variable of Object.keys(cssValues)) {
		if (!tokenByVariable(variable)) {
			issues.push({
				level: "error",
				code: "undocumented-token",
				target: variable,
				message: `${variable} is not a documented design token.`
			});
		}
	}

	// Every token — required and optional — must be present.
	for (const token of TOKENS) {
		if (!(token.variable in cssValues)) {
			issues.push({
				level: "error",
				code: "missing-token",
				target: token.variable,
				message: `${token.variable} is missing from design-tokens.css.`
			});
		}
	}

	// Front-matter paths must map to a token.
	for (const path of unknownPaths) {
		issues.push({
			level: "error",
			code: "undocumented-path",
			target: path,
			message: `${path} maps to no design token.`
		});
	}

	// Required front-matter tokens must be declared.
	for (const token of TOKENS) {
		if (token.path && token.required && !declaredPaths.has(token.path)) {
			issues.push({
				level: "error",
				code: "missing-required-path",
				target: token.path,
				message: `Required token ${token.path} is missing from DESIGN.md.`
			});
		}
	}

	// Declared values must match the stylesheet (after resolving `var()` aliases).
	for (const [variable, designValue] of Object.entries(designValues)) {
		const cssValue = cssValues[variable];
		if (cssValue === undefined) continue;
		const resolvedCss = normalizeValue(resolveVariables(cssValue, cssValues));
		const resolvedDesign = normalizeValue(resolveVariables(designValue, cssValues));
		if (resolvedCss !== resolvedDesign) {
			issues.push({
				level: "error",
				code: "value-mismatch",
				target: variable,
				message: `${variable} differs: DESIGN.md "${designValue}" vs stylesheet "${cssValue}".`
			});
		}
	}

	// Undeclared optional tokens must keep their documented fallback.
	for (const token of TOKENS) {
		if (token.required || !token.path || token.fallback === undefined) continue;
		if (declaredPaths.has(token.path)) continue;
		const cssValue = cssValues[token.variable];
		if (cssValue !== undefined && normalizeValue(cssValue) !== normalizeValue(token.fallback)) {
			issues.push({
				level: "error",
				code: "optional-fallback",
				target: token.variable,
				message: `Optional ${token.variable} is neither declared in DESIGN.md nor set to its fallback ${token.fallback}.`
			});
		}
	}

	return issues;
};
