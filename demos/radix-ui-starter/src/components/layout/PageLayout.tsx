import { clsx } from "@lib/clsx";
import type * as React from "react";
import { useMemo, useState } from "react";
import { PageScrollContext } from "./page-scroll";
import "./PageLayout.css";

interface PageLayoutProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * Viewport-tall application shell. Its header and footer stay pinned while its body
 * scrolls. Children self-position by grid row, so the regions are optional and their
 * order does not matter. The scrolling body element is shared through the page scroll
 * context; holding the element (not a ref) lets consumers re-subscribe when a page swap
 * replaces the body.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
	const [element, setElement] = useState<HTMLElement | null>(null);
	const value = useMemo(() => ({ element, setElement }), [element]);

	return (
		<PageScrollContext.Provider value={value}>
			<main className={clsx("layout-page", className)}>{children}</main>
		</PageScrollContext.Provider>
	);
};
