import { describe, expect, test } from "bun:test";
import { parseContract } from "./contract";
import { validateContract } from "./validate";

const readTheme = async (name: string): Promise<string> =>
	Bun.file(new URL(`../../${name}`, import.meta.url)).text();

const contract = await parseContract(
	await readTheme("DESIGN.md"),
	await readTheme("design-tokens.css")
);

describe("validateContract", () => {
	test("accepts the tool's own contract", () => {
		expect(validateContract(contract)).toEqual([]);
	});

	test("flags a missing token", () => {
		const cssValues = { ...contract.cssValues };
		delete cssValues["--space-md"];
		const issues = validateContract({ ...contract, cssValues });
		expect(
			issues.some((issue) => issue.code === "missing-token" && issue.target === "--space-md")
		).toBe(true);
	});

	test("flags an undocumented token", () => {
		const issues = validateContract({
			...contract,
			cssValues: { ...contract.cssValues, "--color-brand-extra": "#123456" }
		});
		expect(issues.some((issue) => issue.code === "undocumented-token")).toBe(true);
	});

	test("flags a front-matter / stylesheet mismatch", () => {
		const issues = validateContract({
			...contract,
			designValues: { ...contract.designValues, "--color-brand-accent": "#00ff00" }
		});
		expect(issues.some((issue) => issue.code === "value-mismatch")).toBe(true);
	});

	test("flags a wrong optional fallback", () => {
		const issues = validateContract({
			...contract,
			cssValues: { ...contract.cssValues, "--color-surface-card": "#ffffff" }
		});
		expect(issues.some((issue) => issue.code === "optional-fallback")).toBe(true);
	});

	test("flags an undocumented front-matter path", () => {
		const issues = validateContract({ ...contract, unknownPaths: ["colors.brand.hologram"] });
		expect(issues.some((issue) => issue.code === "undocumented-path")).toBe(true);
	});
});
