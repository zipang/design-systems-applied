import type * as React from "react";
import { clsx } from "../../lib/clsx";
import { useTheme } from "../../lib/theme/ThemeProvider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "./DropdownMenu";

interface ThemeSwitcherProps {
	className?: string;
}

/**
 * Dropdown that selects the active theme from the registry.
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
	const { theme, available, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className={clsx("ui-theme-switcher", className)}>
				Theme: {theme}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{available.map((item) => (
					<DropdownMenuItem key={item.id} onSelect={() => setTheme(item.id)}>
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
