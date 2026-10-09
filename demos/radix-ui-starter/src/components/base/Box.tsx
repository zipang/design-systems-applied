import { clsx } from "@lib/clsx";
import type * as React from "react";
import { type BoxProperties, boxClassNames } from "./box-classes";
import "./Box.css";

export type {
	BoxBorderWidth,
	BoxColor,
	BoxElevation,
	BoxProperties,
	BoxRounded,
	BoxSpace
} from "./box-classes";
export {
	BOX_BORDER_WIDTHS,
	BOX_COLORS,
	BOX_ELEVATIONS,
	BOX_ROUNDED,
	BOX_SPACES
} from "./box-classes";

/**
 * Semantic tags `Box` may emit. `div` is the default. The set is deliberately small:
 * `Box` is a structural primitive, not a general HTML factory.
 */
export type BoxTag =
	| "div"
	| "span"
	| "section"
	| "article"
	| "aside"
	| "header"
	| "footer"
	| "nav"
	| "main";

export interface BoxProps extends BoxProperties {
	as?: BoxTag;
	children?: React.ReactNode;
	className?: string;
	ref?: React.Ref<HTMLElement>;
}

/**
 * The props `Box` passes to the emitted element. The polymorphic `ref` is typed once
 * here so TypeScript does not have to resolve a different ref type per tag.
 */
type BoxElementProps = React.HTMLAttributes<HTMLElement> & {
	ref?: React.Ref<HTMLElement>;
};

/**
 * A token-driven box. Every aspect prop accepts only a token-derived enum; the `as`
 * prop picks the emitted semantic tag. Forwards `ref` so Radix `asChild` works.
 */
export const Box: React.FC<BoxProps> = ({ as = "div", className, children, ref, ...props }) => {
	const BoxElt = as as React.ElementType<BoxElementProps>;

	return (
		<BoxElt ref={ref} className={clsx("base-box", boxClassNames(props), className)}>
			{children}
		</BoxElt>
	);
};
