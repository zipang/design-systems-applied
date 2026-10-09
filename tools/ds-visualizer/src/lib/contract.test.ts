import { describe, expect, test } from "bun:test";
import {
	mergeValues,
	normalizeValue,
	parseContract,
	parseDesignMd,
	parseTokensCss,
	scopeTokensCss,
	serializeDesignMd,
	serializeTokensCss
} from "./contract";
import { TOKENS, tokenByVariable } from "./design-system";

const readTheme = async (name: string): Promise<string> =>
	Bun.file(new URL(`../../${name}`, import.meta.url)).text();

describe("contract parsing", () => {
	test("round-trips the tool's own theme", async () => {
		const designMd = await readTheme("DESIGN.md");
		const tokensCss = await readTheme("design-tokens.css");
		const contract = parseContract(designMd, tokensCss);

		for (const token of TOKENS) {
			if (token.required) expect(contract.cssValues[token.variable]).toBeDefined();
		}
		expect(contract.unknownPaths).toEqual([]);
		expect(contract.designValues["--color-brand-accent"]).toBe("#2d2dff");
	});

	test("serializeTokensCss then parseTokensCss is value-stable", async () => {
		const tokensCss = await readTheme("design-tokens.css");
		const values = parseTokensCss(tokensCss);
		const reparsed = parseTokensCss(serializeTokensCss(values));
		expect(reparsed).toEqual(values);
	});

	test("serializeDesignMd then parseDesignMd keeps declared values", async () => {
		const designMd = await readTheme("DESIGN.md");
		const contract = parseContract(designMd, await readTheme("design-tokens.css"));
		const next = parseDesignMd(serializeDesignMd(mergeValues(contract), designMd));

		for (const [variable, value] of Object.entries(contract.designValues)) {
			const token = tokenByVariable(variable);
			const omittedOptional =
				token &&
				!token.required &&
				token.fallback !== undefined &&
				normalizeValue(value) === normalizeValue(token.fallback);
			if (omittedOptional) continue;
			expect(next.values[variable]).toBe(value);
		}
	});

	test("optional tokens equal to their fallback are omitted from the front matter", async () => {
		const designMd = await readTheme("DESIGN.md");
		const contract = parseContract(designMd, await readTheme("design-tokens.css"));
		const merged = mergeValues({ ...contract, designValues: {} });
		merged["--color-surface-card"] = "var(--color-surface)";
		const next = parseDesignMd(serializeDesignMd(merged, designMd));
		expect(next.declaredPaths.has("colors.surface.card")).toBe(false);
	});

	test("scopeTokensCss rewrites the root selector", () => {
		expect(scopeTokensCss(":root {\n\t--x: 1;\n}", "[data-ds-preview]")).toBe(
			"[data-ds-preview] {\n\t--x: 1;\n}"
		);
	});
});
