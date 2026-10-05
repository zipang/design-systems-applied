import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type * as React from "react";
import { clsx } from "../../lib/clsx";
import "./Avatar.css";

interface AvatarProps {
	fallback: string;
	src?: string;
	alt?: string;
	size?: "sm" | "md";
	className?: string;
}

/**
 * Token-styled avatar with a text fallback. Sizes come from the spacing scale.
 */
export const Avatar: React.FC<AvatarProps> = ({
	fallback,
	src,
	alt = "",
	size = "md",
	className
}) => (
	<AvatarPrimitive.Root className={clsx("ui-avatar", `ui-avatar--${size}`, className)}>
		{src ? <AvatarPrimitive.Image className="ui-avatar__image" src={src} alt={alt} /> : null}
		<AvatarPrimitive.Fallback className="ui-avatar__fallback" delayMs={src ? 200 : 0}>
			{fallback}
		</AvatarPrimitive.Fallback>
	</AvatarPrimitive.Root>
);
