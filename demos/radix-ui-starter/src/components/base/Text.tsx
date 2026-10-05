import type * as React from "react";
import { clsx } from "../../lib/clsx";
import "./Text.css";

/** Token font sizes available to {@link Text}. */
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Semantic text color roles. */
export type TextTone = "base" | "muted" | "accent" | "ondark";

interface TextProps {
	size?: TextSize;
	tone?: TextTone;
	as?: "p" | "span";
	children: React.ReactNode;
	className?: string;
	ref?: React.Ref<HTMLParagraphElement>;
}

/**
 * Renders body copy on the token type scale. Use this component instead of a raw `p`
 * or `span` for text.
 */
export const Text: React.FC<TextProps> = ({
	size = "md",
	tone = "base",
	as = "p",
	children,
	className,
	ref
}) => {
	const TextElt = as;

	return (
		<TextElt
			ref={ref}
			className={clsx("base-text", `base-text--${size}`, `base-text--${tone}`, className)}
		>
			{children}
		</TextElt>
	);
};
