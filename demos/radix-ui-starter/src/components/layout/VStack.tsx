import { type BoxProperties, boxClassNames } from "@components/base/Box";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./VStack.css";
import type { Space } from "./space";

interface VStackProps extends BoxProperties {
	gap?: Space;
	align?: "start" | "center" | "end" | "stretch";
	children: React.ReactNode;
	className?: string;
}

/**
 * Stacks children vertically with an optional token gap, cross-axis alignment, and the
 * full box surface.
 */
export const VStack: React.FC<VStackProps> = ({
	gap = "md",
	align = "stretch",
	children,
	className,
	...box
}) => (
	<div
		className={clsx(
			"layout-vstack",
			`layout-vstack--gap-${gap}`,
			`layout-vstack--align-${align}`,
			boxClassNames(box),
			className
		)}
	>
		{children}
	</div>
);
