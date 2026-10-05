import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./Container.css";

/**
 * Max-width presets for {@link Container}. `fluid` has no limit, `lg` is a wide
 * layout column, and `prose` is tuned to a comfortable reading measure (70ch).
 */
export type ContainerWidth = "fluid" | "lg" | "prose";

interface ContainerProps {
	as?: "div" | "main" | "section" | "nav";
	width?: ContainerWidth;
	children: React.ReactNode;
	className?: string;
}

/**
 * Centers content and applies horizontal padding. `width` picks the max width.
 */
export const Container: React.FC<ContainerProps> = ({
	as = "div",
	width = "lg",
	children,
	className
}) => {
	const ContainerElt = as;

	return (
		<ContainerElt className={clsx("layout-container", `layout-container--${width}`, className)}>
			{children}
		</ContainerElt>
	);
};
