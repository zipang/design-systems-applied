import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./VStack.css";
import type { Space } from "./space";

interface VStackProps {
	gap?: Space;
	align?: "start" | "center" | "end" | "stretch";
	children: React.ReactNode;
	className?: string;
}

/**
 * Stacks children vertically with an optional token gap and cross-axis alignment.
 */
export const VStack: React.FC<VStackProps> = ({
	gap = "md",
	align = "stretch",
	children,
	className
}) => (
	<div
		className={clsx(
			"layout-vstack",
			`layout-vstack--gap-${gap}`,
			`layout-vstack--align-${align}`,
			className
		)}
	>
		{children}
	</div>
);
