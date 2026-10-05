import type * as React from "react";
import { clsx } from "../../lib/clsx";
import "./Container.css";

interface ContainerProps {
	as?: "div" | "main" | "section";
	children: React.ReactNode;
	className?: string;
}

/**
 * Centers page content and applies horizontal padding from the token scale. It has no
 * max width: the fixed token list has no layout-width token.
 */
export const Container: React.FC<ContainerProps> = ({ as = "div", children, className }) => {
	const ContainerElt = as;

	return <ContainerElt className={clsx("layout-container", className)}>{children}</ContainerElt>;
};
