import type * as React from "react";
import { clsx } from "../../lib/clsx";
import "./Button.css";

/** Visual variants for {@link Button}. */
export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
	label: string;
	onClick?: () => void;
	variant?: ButtonVariant;
	type?: "button" | "submit" | "reset";
	loading?: boolean;
	disabled?: boolean;
	className?: string;
	ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Token-styled button. Named states are exposed as `is-loading` and `is-disabled`.
 */
export const Button: React.FC<ButtonProps> = ({
	label,
	onClick,
	variant = "primary",
	type = "button",
	loading = false,
	disabled = false,
	className,
	ref
}) => (
	<button
		ref={ref}
		type={type}
		className={clsx(
			"ui-button",
			`ui-button--${variant}`,
			{ "is-loading": loading, "is-disabled": disabled },
			className
		)}
		disabled={disabled || loading}
		aria-busy={loading}
		onClick={onClick}
	>
		{label}
	</button>
);
