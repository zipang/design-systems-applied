import { describe, expect, test } from "bun:test";
import { formatRem, spacingScaleRem, typeScaleRem } from "./scale";

describe("scales", () => {
	test("type scale keeps the base at 1rem", () => {
		const scale = typeScaleRem(1.5);
		expect(scale.md).toBe("1rem");
		expect(scale.lg).toBe("1.5rem");
		expect(scale.xs).toBe(`${Number(1.5 ** -2)}rem`);
	});

	test("spacing scale matches the skill's linear steps", () => {
		const scale = spacingScaleRem(4);
		expect(scale.xs).toBe("0.25rem");
		expect(scale.base).toBe("1rem");
		expect(scale.xxl).toBe("3rem");
	});

	test("formatRem trims trailing zeros", () => {
		expect(formatRem(16)).toBe("1rem");
		expect(formatRem(24)).toBe("1.5rem");
	});
});
