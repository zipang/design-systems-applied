import type * as React from "react";
import { clsx } from "../../lib/clsx";
import { icons } from "./icons";
import "./Icon.css";

/** Names of the bundled SVG icons. */
export type IconName = keyof typeof icons;

interface IconProps {
	name: IconName;
	size?: "sm" | "md" | "lg";
	label?: string;
	className?: string;
}

/**
 * Renders a bundled SVG icon inline so its strokes follow `currentColor`. Give a
 * `label` for a meaningful icon. Without one the icon is decorative and hidden from
 * assistive technology.
 */
export const Icon: React.FC<IconProps> = ({ name, size = "md", label, className }) => {
	const a11y = label
		? ({ role: "img", "aria-label": label } as const)
		: ({ "aria-hidden": true } as const);

	// biome-ignore lint/security/noDangerouslySetInnerHtml: the SVG markup is bundled at build time, not user input.
	const glyph = { dangerouslySetInnerHTML: { __html: icons[name] } };

	return (
		<span className={clsx("base-icon", `base-icon--${size}`, className)} {...a11y} {...glyph} />
	);
};
