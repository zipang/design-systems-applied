import addIcon from "../../assets/icons/add.svg" with { type: "text" };
import sendIcon from "../../assets/icons/send.svg" with { type: "text" };

/**
 * Inline SVG markup, keyed by icon name. The SVGs are imported as text so the Icon
 * component can render them inline and let `currentColor` style their strokes.
 */
export const icons = {
	add: addIcon,
	send: sendIcon
} as const;
