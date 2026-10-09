import { describe, expect, test } from "bun:test";
import {
	BOX_BORDER_WIDTHS,
	BOX_COLORS,
	BOX_ELEVATIONS,
	BOX_ROUNDED,
	BOX_SPACES,
	boxClassNames
} from "./box-classes";

describe("boxClassNames", () => {
	test("returns no class for an empty props object", () => {
		expect(boxClassNames({})).toEqual([]);
	});

	test("never returns the root class — Box adds base-box itself", () => {
		expect(boxClassNames({ p: "md" })).not.toContain("base-box");
	});

	test("maps every spacing step for each spacing prop", () => {
		for (const step of BOX_SPACES) {
			expect(boxClassNames({ p: step })).toEqual([`base-box--p-${step}`]);
			expect(boxClassNames({ px: step })).toEqual([`base-box--px-${step}`]);
			expect(boxClassNames({ py: step })).toEqual([`base-box--py-${step}`]);
			expect(boxClassNames({ m: step })).toEqual([`base-box--m-${step}`]);
			expect(boxClassNames({ mx: step })).toEqual([`base-box--mx-${step}`]);
			expect(boxClassNames({ my: step })).toEqual([`base-box--my-${step}`]);
		}
	});

	test("maps every rounded value", () => {
		for (const value of BOX_ROUNDED) {
			expect(boxClassNames({ rounded: value })).toEqual([`base-box--rounded-${value}`]);
		}
	});

	test("maps every elevation value", () => {
		for (const value of BOX_ELEVATIONS) {
			expect(boxClassNames({ elevation: value })).toEqual([`base-box--elevation-${value}`]);
		}
	});

	test("maps every border width value", () => {
		for (const value of BOX_BORDER_WIDTHS) {
			expect(boxClassNames({ border: value })).toEqual([`base-box--border-${value}`]);
		}
	});

	test("maps every color role for background and borderColor", () => {
		for (const role of BOX_COLORS) {
			expect(boxClassNames({ background: role })).toEqual([`base-box--bg-${role}`]);
			expect(boxClassNames({ borderColor: role })).toEqual([`base-box--border-color-${role}`]);
		}
	});

	test("orders uniform spacing before its axis so the axis class wins", () => {
		expect(boxClassNames({ p: "sm", px: "lg", m: "xs", mx: "xl" })).toEqual([
			"base-box--p-sm",
			"base-box--px-lg",
			"base-box--m-xs",
			"base-box--mx-xl"
		]);
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
		).toEqual([
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
		]);
	});
});
