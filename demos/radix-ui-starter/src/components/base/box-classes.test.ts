import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
	BOX_BORDER_WIDTHS,
	BOX_COLORS,
	BOX_ELEVATIONS,
	BOX_ROUNDED,
	BOX_SPACES,
	type BoxProperties,
	boxClassNames
} from "./box-classes";

/** Split the space-joined class string into individual class names. */
const classesOf = (props: BoxProperties): string[] =>
	boxClassNames(props).split(" ").filter(Boolean);

describe("boxClassNames", () => {
	test("returns an empty string for an empty props object", () => {
		expect(boxClassNames({})).toBe("");
	});

	test("never returns the root class — Box adds base-box itself", () => {
		expect(classesOf({ p: "md" })).not.toContain("base-box");
	});

	test("maps every spacing step for each spacing prop", () => {
		for (const step of BOX_SPACES) {
			expect(boxClassNames({ p: step })).toBe(`base-box--p-${step}`);
			expect(boxClassNames({ px: step })).toBe(`base-box--px-${step}`);
			expect(boxClassNames({ py: step })).toBe(`base-box--py-${step}`);
			expect(boxClassNames({ m: step })).toBe(`base-box--m-${step}`);
			expect(boxClassNames({ mx: step })).toBe(`base-box--mx-${step}`);
			expect(boxClassNames({ my: step })).toBe(`base-box--my-${step}`);
		}
	});

	test("maps every rounded value", () => {
		for (const value of BOX_ROUNDED) {
			expect(boxClassNames({ rounded: value })).toBe(`base-box--rounded-${value}`);
		}
	});

	test("maps every elevation value", () => {
		for (const value of BOX_ELEVATIONS) {
			expect(boxClassNames({ elevation: value })).toBe(`base-box--elevation-${value}`);
		}
	});

	test("maps every border width value", () => {
		for (const value of BOX_BORDER_WIDTHS) {
			expect(boxClassNames({ border: value })).toBe(`base-box--border-${value}`);
		}
	});

	test("maps every color role for background and borderColor", () => {
		for (const role of BOX_COLORS) {
			expect(boxClassNames({ background: role })).toBe(`base-box--bg-${role}`);
			expect(boxClassNames({ borderColor: role })).toBe(`base-box--border-color-${role}`);
		}
	});

	test("orders uniform spacing before its axis so the axis class wins", () => {
		expect(boxClassNames({ p: "sm", px: "lg", m: "xs", mx: "xl" })).toBe(
			"base-box--p-sm base-box--px-lg base-box--m-xs base-box--mx-xl"
		);
	});

	test("returns every aspect class in a stable order for a full object", () => {
		expect(
			boxClassNames({
				p: "md",
				px: "lg",
				py: "base",
				m: "xs",
				mx: "sm",
				my: "xl",
				border: "sm",
				borderColor: "brand-primary",
				elevation: "lg",
				rounded: "md",
				background: "surface-alt"
			})
		).toBe(
			[
				"base-box--p-md",
				"base-box--px-lg",
				"base-box--py-base",
				"base-box--m-xs",
				"base-box--mx-sm",
				"base-box--my-xl",
				"base-box--border-sm",
				"base-box--border-color-brand-primary",
				"base-box--elevation-lg",
				"base-box--rounded-md",
				"base-box--bg-surface-alt"
			].join(" ")
		);
	});
});

/** Every aspect class `boxClassNames` can emit, gathered from the enum arrays. */
const emittableClasses = (): string[] => {
	const classes = new Set<string>();
	const add = (props: BoxProperties): void => {
		for (const cls of classesOf(props)) {
			classes.add(cls);
		}
	};

	for (const step of BOX_SPACES) {
		add({ p: step, px: step, py: step, m: step, mx: step, my: step });
	}

	for (const value of BOX_BORDER_WIDTHS) {
		add({ border: value });
	}

	for (const value of BOX_ROUNDED) {
		add({ rounded: value });
	}

	for (const value of BOX_ELEVATIONS) {
		add({ elevation: value });
	}

	for (const role of BOX_COLORS) {
		add({ background: role });
		add({ borderColor: role });
	}

	return [...classes];
};

const escapeClassName = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("Box.css", () => {
	const css = readFileSync(new URL("./Box.css", import.meta.url), "utf8");

	test("defines the base-box root", () => {
		expect(css).toMatch(/\.base-box\s*\{/);
	});

	test("defines a rule for every class boxClassNames can emit", () => {
		for (const cls of emittableClasses()) {
			expect(css).toMatch(new RegExp(`\\.${escapeClassName(cls)}(?![\\w-])`));
		}
	});

	test("orders the padding axis rule after the uniform rule", () => {
		expect(css.indexOf(".base-box--p-sm")).toBeLessThan(css.indexOf(".base-box--px-sm"));
	});

	test("orders the margin axis rule after the uniform rule", () => {
		expect(css.indexOf(".base-box--m-sm")).toBeLessThan(css.indexOf(".base-box--mx-sm"));
	});
});
