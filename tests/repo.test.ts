import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";

const CANONICAL_SKILL = "skills/design-system-tokens/SKILL.md";
const PROXY_SKILL = ".agents/skills/design-system-tokens/SKILL.md";

test("the canonical design-system-tokens skill exists", () => {
	expect(existsSync(CANONICAL_SKILL)).toBe(true);
});

test("the proxy skill points at the canonical skill", () => {
	const body = readFileSync(PROXY_SKILL, "utf8");

	expect(body).toContain(`name: design-system-tokens`);
	expect(body).toContain(CANONICAL_SKILL);
});

test("shipped docs do not reference the old styles.css name", () => {
	const files = [
		CANONICAL_SKILL,
		"skills/design-system-tokens/references/DESIGN.md",
		"README.md",
		"AGENTS.md"
	];

	for (const file of files) {
		expect(readFileSync(file, "utf8")).not.toContain("references/styles.css");
	}
});
