import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./Grid.css";
import type { Space } from "./space";

interface GridProps {
	columns?: 1 | 2 | 3 | 4;
	gap?: Space;
	children: React.ReactNode;
	className?: string;
}

/**
 * A grid with a fixed column count and an optional token gap.
 */
export const Grid: React.FC<GridProps> = ({ columns = 1, gap = "md", children, className }) => (
	<div
		className={clsx(
			"layout-grid",
			`layout-grid--columns-${columns}`,
			`layout-grid--gap-${gap}`,
			className
		)}
	>
		{children}
	</div>
);
