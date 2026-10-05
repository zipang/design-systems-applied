import { clsx } from "@lib/clsx";
import { useHideOnScroll } from "@lib/scroll/useScrollDirection";
import type * as React from "react";
import { usePageScroll } from "./page-scroll";
import "./SiteNavigationHeader.css";

interface SiteNavigationHeaderProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * The primary site navigation. Collapses to zero height while the page body is scrolled
 * down and returns on scroll-up, so the body gains the space. While collapsed its
 * controls are inert and hidden from assistive technology.
 */
export const SiteNavigationHeader: React.FC<SiteNavigationHeaderProps> = ({
	children,
	className
}) => {
	const pageScroll = usePageScroll();
	const hidden = useHideOnScroll(pageScroll?.element ?? null);

	return (
		<div className={clsx("layout-site-navigation", { "is-hidden": hidden }, className)}>
			<div
				className="layout-site-navigation__inner"
				inert={hidden || undefined}
				aria-hidden={hidden || undefined}
			>
				{children}
			</div>
		</div>
	);
};
