# AGENTS.md — demo components

Rules for the component library under `demos/radix-ui-starter/src/components/`. The
root, demo, and `src/AGENTS.md` rules still apply.

## Tiers

Components live in four tiers. Place each component in the lowest tier that fits.

- **`base/`** — typography and low-level primitives (`Heading`, `Text`). These replace
  raw text tags.
- **`ui/`** — Radix UI wrappers and generic UI primitives (`Button`, `TextField`,
  `DropdownMenu`, `Dialog`, `Avatar`).
- **`layout/`** — layout primitives only (`Container`, `VStack`, `HStack`, `Grid`).
- **`chat/`** — product-named components for this demo (`ChatPanel`, `ChatHeader`,
  `ThemeSwitcher`, `MessageList`, `Message`, `Composer`).

Rules:

- Product-named components never live in `layout/` or `ui/`.
- Dependencies flow downward only: `chat` may use `ui`, `layout`, and `base`; never the
  reverse.
- **No raw `h1`–`h6` or `p` in pages or components.** Typography goes through
  `base/Heading` and `base/Text` exclusively.

## Styling

- **Token-only CSS.** Use `var(--token)` for every color, size, radius, and shadow.
  Never write a raw value.
- **One unique class per component, prefixed by tier.** The root element carries one
  class: `base-<name>`, `ui-<name>`, `layout-<name>`, or `chat-<name>` (for example
  `ui-button`, never `.button`).
- **Scoped stylesheets.** Every rule in a component stylesheet is nested under the
  component's root class. Use native CSS nesting for states and descendants, so the
  file folds as one block.
- **Named states are classes.** Every named state has an `is-<state>` class nested under
  the root (`.ui-button.is-loading`). When Radix exposes a state only as a `data-*`
  attribute, mirror it to the matching `is-*` class. Common states: `is-disabled`,
  `is-loading`, `is-active`, `is-open`, `is-selected`, `is-invalid`, `is-readonly`,
  `is-placeholder`.
- **Compose classes with `clsx()`** from `src/lib/clsx.ts`.

## Example

```tsx
import { clsx } from "../../lib/clsx";
import "./Button.css";

interface ButtonProps {
	label: string;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
}

/**
 * Token-styled button. Named states are exposed as `is-*` classes.
 */
export const Button: React.FC<ButtonProps> = ({ label, onClick, loading, disabled }) => (
	<button
		type="button"
		className={clsx("ui-button", { "is-loading": loading, "is-disabled": disabled })}
		disabled={disabled || loading}
		aria-busy={loading}
		onClick={onClick}
	>
		{label}
	</button>
);
```

```css
/* Button.css — every rule is scoped under .ui-button */
.ui-button {
	background: var(--color-brand-primary);
	color: var(--color-text-ondark);

	&.is-disabled {
		opacity: 0.5;
	}
}
```

## Tests

Component rendering tests are **intentionally omitted**. Radix UI primitives are
already tested upstream and this library only adds styling, so a DOM test of a wrapper
asserts little. Test pure logic (`src/lib/**`) and the per-theme token contract
instead. This is the documented exception to the root rule "one test per source".
