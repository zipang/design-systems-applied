# Spec: T0005 Box primitive and the `BoxProperties` token-prop contract

## Restate of intent

- **Outcome:** A `base/Box` primitive and an exported `BoxProperties` interface that
  expose the token-backed aspects of a box as **enum props**: spacing (`p`, `px`, `py`,
  `m`, `mx`, `my`), `border` (width) and `borderColor`, `elevation`, `rounded`, and
  `background`. Every enum value names a design token, never a raw value. `Box` also
  takes an `as` prop that selects a restricted set of semantic HTML tags (`div` by
  default). The layout primitives (`HStack`, `VStack`, `Grid`, `Container`) inherit
  `BoxProperties` and apply the same class map, so every box aspect works on them too.
- **User:** AI agents first. `Box` is the building block for composing surfaces and
  their parts (`CardHeader`, `CardFooter`, a dialog surface, a message bubble). Humans
  second.
- **Why now:** Surfaces repeat the same hand-written declarations (`background`,
  `border`, `border-radius`, `box-shadow`, `padding`) in every component stylesheet.
  Each copy can drift from the token set. A single enum-driven primitive makes the box
  aspects a typed contract instead of a convention.
- **Success:** `Box` renders only classes that resolve to fixed tokens; every prop is
  typed to a token-derived union; the layout primitives and the two sample surfaces
  adopt `Box` in the three documented modes; a drift test guarantees every class `Box`
  can emit exists in `Box.css`.
- **Constraint:** The fixed token list does not change. `Box` consumes the tokens with
  `var()` only. Styling stays class-based, consistent with the rest of the library.
- **Out of scope:** Per-side spacing (`pt`, `pb`, ...), per-corner radii, directional
  borders (`borderBlockEnd`), typography/flex/grid props, and any new token.

## Objective

Add a foundational primitive to `src/components/base/`:

- **`base/Box.tsx`** — the `Box` component. It re-exports the `BoxProperties` interface
  and the enum unions defined in `box-classes.ts`. `Box` is a thin polymorphic element
  that turns its typed props into scoped classes through the shared mapping function.
- **`base/box-classes.ts`** — `boxClassNames(props)`, the pure prop → class mapping.
  It is the single place that knows the class vocabulary, and it is unit-tested even
  though component rendering is not (see `src/components/AGENTS.md`).
- **`base/Box.css`** — one rule per enum class, each referencing exactly one token.

### The adoption modes

`Box` is meant to be used in three ways. A component picks the mode that matches its
Design System role:

1. **Inherit** — a component extends `BoxProperties` when it should expose the full box
   surface to its own callers, then spreads those props onto an internal `Box`.
2. **Layout inherit** — a layout primitive extends `BoxProperties` and merges
   `boxClassNames(props)` into its own root class. It keeps its own element and its own
   layout props (`gap`, `columns`, `width`); it does not render `Box`.
3. **Compose** — a component whose look is fixed by `DESIGN.md` renders a `Box`
   internally for its surface and keeps its own layout/behavior in CSS.

**Rule for every inheriting component:** a component that exposes `BoxProperties` must
not hardcode the same box aspect in its own stylesheet. `Box.css` and the component's
stylesheet have equal specificity, so leaving both in place would make the winner depend
on import order. Express a default as the prop default instead (for example `Container`
uses `px = "lg"` rather than `padding-inline` in `Container.css`).

This ticket proves all three:

- **`DialogContent` (inherit + compose):** `DialogContentProps extends BoxProperties`.
  The dialog surface becomes a `Box` with token defaults, rendered through Radix
  `Content asChild`, so callers can override any box aspect.
- **`HStack`, `VStack`, `Grid`, `Container` (layout inherit):** each extends
  `BoxProperties` and adds `boxClassNames(props)` to its root class, so padding, margin,
  border, elevation, rounded, and background all work on the layout primitives.
- **`chat/Message` bubble (compose):** the bubble renders a `Box` for its background and
  padding. Its asymmetric per-corner radius and text color stay in `chat` CSS, because
  `Box` applies `rounded` uniformly by design.

## The `BoxProperties` contract

```ts
/** Spacing step from the fixed token scale. */
export type BoxSpace = "xs" | "sm" | "md" | "base" | "lg" | "xl" | "xxl";

/** Corner radius token. */
export type BoxRounded = "none" | "sm" | "md" | "lg" | "full";

/** Shadow token. */
export type BoxElevation = "sm" | "md" | "lg";

/** Border width token. */
export type BoxBorderWidth = "sm" | "md" | "lg";

/** Any color role exposed as a token. Borders are not tokens, so `Box` is the
 * component that picks the color token for its border. */
export type BoxColor =
	| "surface"
	| "surface-alt"
	| "surface-dark"
	| "surface-card"
	| "brand-primary"
	| "brand-accent"
	| "brand-secondary"
	| "brand-tertiary"
	| "action-success"
	| "action-info"
	| "action-warning"
	| "action-danger";

/** Token-backed aspects of a box. Components inherit this to expose the full surface. */
export interface BoxProperties {
	p?: BoxSpace;
	px?: BoxSpace;
	py?: BoxSpace;
	m?: BoxSpace;
	mx?: BoxSpace;
	my?: BoxSpace;
	border?: BoxBorderWidth;
	borderColor?: BoxColor;
	elevation?: BoxElevation;
	rounded?: BoxRounded;
	background?: BoxColor;
}
```

Notes:

- `px`/`py` and `mx`/`my` map to the logical properties `padding-inline` / `padding-block`
  and `margin-inline` / `margin-block`. There is no per-side prop.
- When both `p` and `px` (or `m` and `mx`) are set, the axis class must win. The
  stylesheet orders axis rules after uniform rules so equal-specificity source order
  decides.
- `border` sets width only. Without `borderColor` the border uses `currentColor`, which
  is the documented default and needs no rule.
- Omitted props emit no aspect class. `boxClassNames` always returns the root `base-box`
  class first, so every consumer carries the class the aspect rules are scoped under.

## Project structure

```
demos/radix-ui-starter/src/components/
  base/
    Box.tsx                 Box, BoxProperties, enum unions
    Box.css                 one rule per enum class
    box-classes.ts          boxClassNames(props) pure mapping
    box-classes.test.ts     mapping + CSS drift test
    README.md               gains a Box section
  ui/Dialog.tsx             DialogContentProps extends BoxProperties; renders Box
  ui/Dialog.css             surface declarations move to Box props
  chat/Message.tsx          bubble renders a Box
  chat/Message.css          keeps only radius + color for the bubble
  layout/HStack.tsx         HStackProps extends BoxProperties
  layout/VStack.tsx         VStackProps extends BoxProperties
  layout/Grid.tsx           GridProps extends BoxProperties
  layout/Container.tsx      ContainerProps extends BoxProperties; default px
  layout/Container.css      inline padding moves to the px default
  layout/README.md          notes the primitives accept box aspects
  README.md                 base list gains Box
  AGENTS.md                 documents the adoption modes rule
  demo/ComponentsDemo.tsx   gains a Box section
```

## Class vocabulary

`boxClassNames` always returns the root class `base-box` first, then one class per
provided aspect:

| Prop | Class pattern | Token |
|------|---------------|-------|
| `p` / `px` / `py` | `base-box--p-<v>`, `base-box--px-<v>`, `base-box--py-<v>` | `--space-<v>` |
| `m` / `mx` / `my` | `base-box--m-<v>`, `base-box--mx-<v>`, `base-box--my-<v>` | `--space-<v>` |
| `border` | `base-box--border-<v>` | `--border-<v>` |
| `borderColor` | `base-box--border-color-<role>` | color token for `<role>` |
| `elevation` | `base-box--elevation-<v>` | `--elevation-<v>` |
| `rounded` | `base-box--rounded-<v>` | `--rounded-<v>` |
| `background` | `base-box--bg-<role>` | color token for `<role>` |

## Code style

`Box` follows the tier rules: arrow function, `React.FC<BoxProps>`, mandatory JSDoc,
`clsx()` for composition, stylesheet import last, no `any`.

```tsx
/** Semantic tags `Box` may emit. `div` is the default. */
export type BoxTag =
	| "div"
	| "span"
	| "section"
	| "article"
	| "aside"
	| "header"
	| "footer"
	| "nav"
	| "main";

export interface BoxProps extends BoxProperties {
	as?: BoxTag;
	children?: React.ReactNode;
	className?: string;
	ref?: React.Ref<HTMLElement>;
}

/**
 * A token-driven box. Every aspect prop accepts only a token-derived enum; the `as`
 * prop picks the emitted semantic tag. Forwards `ref` so Radix `asChild` works.
 */
export const Box: React.FC<BoxProps> = ({ as = "div", className, children, ref, ...props }) => {
	const BoxElt = as;

	return (
		<BoxElt ref={ref} className={clsx(boxClassNames(props), className)}>
			{children}
		</BoxElt>
	);
};
```

```css
/* Box.css — every rule is scoped under .base-box */
.base-box {
	box-sizing: border-box;

	&.base-box--p-md {
		padding: var(--space-md);
	}

	&.base-box--px-lg {
		padding-inline: var(--space-lg);
	}

	/* ... m / mx / my ... */

	&.base-box--border-sm {
		border-style: solid;
		border-width: var(--border-sm);
	}

	&.base-box--border-color-brand-primary {
		border-color: var(--color-brand-primary);
	}

	&.base-box--elevation-lg {
		box-shadow: var(--elevation-lg);
	}

	&.base-box--rounded-md {
		border-radius: var(--rounded-md);
	}

	&.base-box--bg-surface-alt {
		background: var(--color-surface-alt);
	}
}
```

`DialogContent` picks token defaults, then lets callers override:

```tsx
<DialogPrimitive.Content asChild>
	<Box
		background="surface"
		border="sm"
		borderColor="brand-secondary"
		rounded="none"
		elevation="lg"
		p="lg"
		className={clsx("ui-dialog", className)}
		{...box}
	>
		{/* title, description, children, close */}
	</Box>
</DialogPrimitive.Content>
```

`Message` bubble composes `Box` for background + padding and keeps radius/color:

```tsx
<Box
	background={isEliza ? "surface-alt" : "surface-dark"}
	py="base"
	px="lg"
	className="chat-message__bubble"
>
```

A layout primitive inherits `BoxProperties` and merges the class map:

```tsx
interface HStackProps extends BoxProperties {
	gap?: Space;
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between";
	wrap?: boolean;
	children: React.ReactNode;
	className?: string;
}

/**
 * Stacks children horizontally with a token gap and full box aspects.
 */
export const HStack: React.FC<HStackProps> = ({
	gap = "md",
	align = "start",
	justify = "start",
	wrap = false,
	children,
	className,
	...box
}) => (
	<div
		className={clsx(
			"layout-hstack",
			`layout-hstack--gap-${gap}`,
			`layout-hstack--align-${align}`,
			`layout-hstack--justify-${justify}`,
			{ "layout-hstack--wrap": wrap },
			boxClassNames(box),
			className
		)}
	>
		{children}
	</div>
);
```

## Testing strategy

Component rendering tests remain intentionally omitted. The testable surface is the
pure mapping and the token contract:

- **Mapping test (`base/box-classes.test.ts`):** `boxClassNames` returns the expected
  class for each prop and value; omitted props contribute nothing; a full-props object
  returns every expected class.
- **Drift test (`base/box-classes.test.ts`):** read `Box.css` and assert that every
  class `boxClassNames` can emit exists in the stylesheet. A missing rule fails
  `bun test`, so the vocabulary and the CSS cannot diverge.
- **Token contract (`src/lib/theme/contract.test.ts`):** unchanged. `Box` adds no
  tokens.
- **Gates:** `bun run check`, `bun run typecheck`, `bun test`, and the demo build.

## Boundaries

- **Always:** consume tokens with `var()`; keep the enum unions equal to the token
  values; forward `ref`; run `bun run check`, `bun run typecheck`, and `bun test` before
  committing.
- **Ask first:** changing the fixed token list or `skills/design-system-tokens/SKILL.md`;
  adding a prop outside `BoxProperties`; moving a component between tiers.
- **Never:** write raw colors, sizes, radii, or shadows; add an undocumented token; add
  per-side spacing, per-corner radii, or directional borders; add a runtime style
  resolver; make an existing component inherit `BoxProperties` when its look is fixed by
  its `DESIGN.md` role; hardcode in a component's CSS a box aspect that the same
  component exposes as a prop.

## Success criteria

- [ ] `base/Box.tsx` exports `Box`, `BoxProperties`, `BoxProps`, and the enum unions.
      The props are exactly `p`, `px`, `py`, `m`, `mx`, `my`, `border`, `borderColor`,
      `elevation`, `rounded`, `background`, `as`, `children`, `className`, `ref`.
- [ ] `base/Box.css` has one class per enum value, each referencing exactly one token
      with `var()`; axis rules override uniform rules by source order.
- [ ] `Box` emits a restricted semantic tag through `as` (`div` default) and forwards
      `ref`.
- [ ] `boxClassNames` is pure and tested; a drift test proves every emittable class
      exists in `Box.css`.
- [ ] `DialogContent` extends `BoxProperties` and renders a `Box` through Radix
      `asChild`; its surface declarations leave `Dialog.css`.
- [ ] `HStack`, `VStack`, `Grid`, and `Container` extend `BoxProperties` and apply
      `boxClassNames(props)`; `Container` moves its inline padding to a `px` default and
      no inheriting component hardcodes a box aspect it also exposes.
- [ ] The `Message` bubble composes `Box` for background + padding; its asymmetric
      radius and text color stay in `chat` CSS.
- [ ] `base/README.md`, `components/README.md`, `components/AGENTS.md`, and
      `layout/README.md` document `Box` and the adoption modes; `ComponentsDemo` has a
      Box section.
- [ ] The fixed token list and `DESIGN.md` front matter schema are unchanged.
- [ ] `bun run check`, `bun run typecheck`, `bun test`, and the demo build pass.

## Open questions

1. **Prop names.** Use the short names above (Chakra-like), or the longer
   `padding`/`paddingX`/`marginX`? Recommendation: short names; they read as tokens and
   match the terse prop style already in the library (`gap`, `size`, `tone`).
2. **`as` tag set.** Proposed: `div`, `span`, `section`, `article`, `aside`, `header`,
   `footer`, `nav`, `main`. Add list tags (`ul`, `li`) or `figure`? Recommendation: keep
   structural containers only; add later when a caller needs one.
3. **Font family.** Leave `Box` inheriting its parent's font (composable), or force
   `--font-family-mono` like other UI components? Recommendation: inherit; `Box` may
   wrap text or nest under `Text`.
4. **Canonical skill.** Document the `Box`/`BoxProperties` pattern in
   `skills/design-system-tokens/SKILL.md`, or only in the demo docs? Recommendation:
   demo docs only; the canonical skill stays the token contract.
5. **`border` without `borderColor`.** Confirm `currentColor` is the intended default
   (no rule emitted) rather than a token fallback. Recommendation: `currentColor`.
6. **`Container` centering vs `mx`.** `Container` centers with `margin-inline: auto`,
   which is not a token aspect. Passing `mx` would replace the centering. Keep `auto` in
   CSS and document that `mx` opts out of centering, or move centering behind a prop?
   Recommendation: keep `auto` in `Container.css`; `mx` is an explicit opt-out.
