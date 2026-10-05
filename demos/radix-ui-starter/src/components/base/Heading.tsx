import type * as React from "react";
import { clsx } from "../../lib/clsx";
import "./Heading.css";

/** Heading levels, mapped to the `h1`–`h6` elements. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
	level?: HeadingLevel;
	children: React.ReactNode;
	className?: string;
	ref?: React.Ref<HTMLHeadingElement>;
}

/**
 * Renders a heading element on the token type scale. Use this component instead of a
 * raw `h1`–`h6` tag so page typography stays consistent.
 */
export const Heading: React.FC<HeadingProps> = ({ level = 2, children, className, ref }) => {
	const HeadingElt = `h${level}` as const;

	return (
		<HeadingElt ref={ref} className={clsx("base-heading", `base-heading--${level}`, className)}>
			{children}
		</HeadingElt>
	);
};
