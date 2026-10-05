import type * as React from "react";
import { clsx } from "../../lib/clsx";
import "./PageFooter.css";

interface PageFooterProps {
	children: React.ReactNode;
	className?: string;
}

/** The page's fixed bottom region. Scoped to the shell, so it is not contentinfo. */
export const PageFooter: React.FC<PageFooterProps> = ({ children, className }) => (
	<footer className={clsx("layout-page-footer", className)}>{children}</footer>
);
