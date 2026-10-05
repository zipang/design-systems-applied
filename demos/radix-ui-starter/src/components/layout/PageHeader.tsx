import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./PageHeader.css";

interface PageHeaderProps {
	children: React.ReactNode;
	className?: string;
}

/** The page's fixed top region. Scoped to the shell, so it is not a banner landmark. */
export const PageHeader: React.FC<PageHeaderProps> = ({ children, className }) => (
	<header className={clsx("layout-page-header", className)}>{children}</header>
);
