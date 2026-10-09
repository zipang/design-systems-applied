import { type BoxProperties, boxClassNames } from "@components/base/Box";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./HStack.css";
import type { Space } from "./space";

interface HStackProps extends BoxProperties {
	gap?: Space;
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between";
	wrap?: boolean;
	children: React.ReactNode;
	className?: string;
}

/**
 * Stacks children horizontally with an optional token gap, alignment, distribution,
 * and the full box surface.
 */
export const HStack: React.FC<HStackProps> = ({
	gap = "md",
	align = "center",
	justify = "start",
	wrap = false,
	children,
	className,
	...box
}) => (
	<div
		className={clsx(
			"layout-hstack",
			`layout-hstack--gap-${gap}`,
			`layout-hstack--align-${align}`,
			`layout-hstack--justify-${justify}`,
			{ "layout-hstack--wrap": wrap },
			boxClassNames(box),
			className
		)}
	>
		{children}
	</div>
);
