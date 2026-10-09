/** Type-scale step names from the fixed token contract. */
export type TypeStepName = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "display";

/** Step offsets from the `1rem` base (step 0, usually `md`). */
export const TYPE_STEP_OFFSETS: Record<TypeStepName, number> = {
	xs: -2,
	sm: -1,
	md: 0,
	lg: 1,
	xl: 2,
	"2xl": 3,
	display: 4
};

/** Format a pixel value as a `rem` string, trimming trailing zeros. */
export const formatRem = (px: number): string => `${Number((px / 16).toFixed(4))}rem`;

/**
 * Compute the type scale from a geometric ratio. The base step is always `1rem`, so
 * `md` is `1rem` and each other step is `ratio ** offset`.
 */
export const typeScaleRem = (ratio: number): Record<TypeStepName, string> => {
	const scale = {} as Record<TypeStepName, string>;
	for (const [name, offset] of Object.entries(TYPE_STEP_OFFSETS) as [TypeStepName, number][]) {
		scale[name] = `${Number(ratio ** offset)}rem`;
	}
	return scale;
};

/** Spacing step names from the fixed token contract. */
export type SpaceStepName = "xs" | "sm" | "md" | "base" | "lg" | "xl" | "xxl";

/** Linear multipliers from the skill: xs=1, sm=2, md=3, base=4, lg=5, xl=8, xxl=12. */
export const SPACE_STEP_UNITS: Record<SpaceStepName, number> = {
	xs: 1,
	sm: 2,
	md: 3,
	base: 4,
	lg: 5,
	xl: 8,
	xxl: 12
};

/** Compute the spacing scale from a linear unit in pixels; `base` stays `1rem`. */
export const spacingScaleRem = (unitPx = 4): Record<SpaceStepName, string> => {
	const scale = {} as Record<SpaceStepName, string>;
	for (const [name, unit] of Object.entries(SPACE_STEP_UNITS) as [SpaceStepName, number][]) {
		scale[name] = formatRem(unitPx * unit);
	}
	return scale;
};
