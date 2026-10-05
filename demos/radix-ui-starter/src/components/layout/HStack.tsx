import type * as React from "react";
import { clsx } from "../../lib/clsx";
import "./HStack.css";
import type { Space } from "./space";

interface HStackProps {
	gap?: Space;
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between";
	wrap?: boolean;
	children: React.ReactNode;
	className?: string;
}

/**
 * Stacks children horizontally with an optional token gap, alignment, and
 * distribution.
 */
export const HStack: React.FC<HStackProps> = ({
	gap = "md",
	align = "center",
	justify = "start",
	wrap = false,
	children,
	className
}) => (
	<div
		className={clsx(
			"layout-hstack",
			`layout-hstack--gap-${gap}`,
			`layout-hstack--align-${align}`,
			`layout-hstack--justify-${justify}`,
			{ "layout-hstack--wrap": wrap },
			className
		)}
	>
		{children}
	</div>
);
