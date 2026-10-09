# Spec: T0006 Common HTML props for the base and layout components

## Restate of intent

- **Outcome:** A pure helper `acceptCommonProps()` and a `CommonProps` type that let every
  base and layout component accept and forward a curated set of common HTML attributes:
  `id`, `role`, `title`, `tabIndex`, `hidden`, `lang`, `dir`, every `aria-*` attribute,
  every event handler, and every `data-*` attribute. The helper drops every other key, so
  a component's own props cannot leak onto the DOM.
- **User:** AI agents first. A component that forwards a known attribute set composes
  with Radix `asChild`, testing hooks (`data-testid`), and assistive technology without
  a bespoke prop for each case.
- **Why now:** The components accept only their own props. `base/Heading` drops the
  `id` that Radix `Dialog.Title` passes, so the dialog's `aria-labelledby` points to a
  missing element. Adding attributes one component at a time would drift.
- **Success:** Every base and layout component accepts `CommonProps` and forwards them
  through `acceptCommonProps`. The dialog exposes `role`, `aria-labelledby`, and
  `aria-describedby`. A unit test proves the filter keeps the curated set and drops the
  rest.
- **Constraint:** No new runtime dependency. `className` and `style` stay component-owned,
  so the token-only styling rule holds. `style` is not in the curated set.
- **Out of scope:** The `ui/`, `chat/`, and `demo/` tiers, and any change to the token
  contract.

## Objective

Add one pure module and apply it across two tiers.

- **`src/lib/common-props.ts`** — exports `COMMON_ATTRIBUTES`, the `CommonProps` type,
  and `acceptCommonProps(props)`. The function copies the curated keys that have a
  defined value and returns them typed as `CommonProps`.
- **Base tier** — `Heading`, `Text`, `Icon`, and `Box`.
- **Layout tier** — `HStack`, `VStack`, `Grid`, `Container`, `PageLayout`, `PageHeader`,
  `PageBody`, `PageFooter`, and `SiteNavigationHeader`.

### The curated set

| Group | Keys |
|-------|------|
| Named | `id`, `role`, `title`, `tabIndex`, `hidden`, `lang`, `dir` |
| Aria | every `aria-*` |
| Data | every `data-*` |
| Events | every `on*` handler (React style, `on` + capital letter) |

`className`, `style`, `children`, and `dangerouslySetInnerHTML` are excluded. A component
owns its `className`, its `children`, and its token styling.

## The `CommonProps` contract

```ts
/** Common HTML attribute names every component forwards to its root element. */
export const COMMON_ATTRIBUTES = [
	"id",
	"role",
	"title",
	"tabIndex",
	"hidden",
	"lang",
	"dir"
] as const;

/**
 * Props shared by every component: a curated list of common HTML attributes, every
 * `aria-*` and `data-*` attribute, and event handlers. `className` and `style` stay
 * component-owned.
 */
export type CommonProps = Pick<
	React.HTMLAttributes<HTMLElement>,
	(typeof COMMON_ATTRIBUTES)[number]
> &
	Omit<React.DOMAttributes<HTMLElement>, "children" | "dangerouslySetInnerHTML"> &
	React.AriaAttributes & {
		[key: `data-${string}`]: string | number | boolean | undefined;
	};

/** Keep only the curated common attributes that have a value. */
export const acceptCommonProps = <T extends object>(props: T): CommonProps => { ... };
```

Component usage:

```tsx
interface HeadingProps extends CommonProps {
	level?: HeadingLevel;
	size?: HeadingSize;
	children: React.ReactNode;
	className?: string;
	ref?: React.Ref<HTMLHeadingElement>;
}

export const Heading: React.FC<HeadingProps> = ({
	level = 2,
	size,
	children,
	className,
	ref,
	...rest
}) => {
	const HeadingElt = `h${level}` as const;

	return (
		<HeadingElt ref={ref} className={...} {...acceptCommonProps(rest)}>
			{children}
		</HeadingElt>
	);
};
```

`Icon` builds its own a11y attributes from `label`. It spreads `acceptCommonProps(rest)`
before those attributes, so its role and `aria-label` win.

## Testing strategy

- **Unit test (`src/lib/common-props.test.ts`):** `acceptCommonProps` keeps each named
  attribute, every `aria-*` and `data-*` key, and event handlers. It drops `className`,
  `style`, `children`, unknown keys, and keys with an `undefined` value.
- **Type check:** each refactored component extends `CommonProps`, so `bun run typecheck`
  proves the prop types accept an `id` and a `data-*` attribute.
- **Component rendering tests** stay omitted. The dialog check is a manual browser step.
- **Gates:** `bun run check`, `bun run typecheck`, `bun test`, and the demo build.

## Boundaries

- **Always:** keep the curated list in one place; forward attributes through
  `acceptCommonProps`; run the gates before committing.
- **Ask first:** adding a key to the curated list; extending the helper to another tier.
- **Never:** add `style` or `className` to the curated set; spread a component's own props
  onto the DOM unfiltered; add a runtime dependency.

## Success criteria

- [ ] `src/lib/common-props.ts` exports `COMMON_ATTRIBUTES`, `CommonProps`, and
      `acceptCommonProps`; its unit test passes.
- [ ] `Heading`, `Text`, `Icon`, and `Box` extend `CommonProps` and forward
      `acceptCommonProps(rest)`.
- [ ] `HStack`, `VStack`, `Grid`, `Container`, `PageLayout`, `PageHeader`, `PageBody`,
      `PageFooter`, and `SiteNavigationHeader` do the same.
- [ ] The dialog exposes `role="dialog"` and a resolvable `aria-labelledby`.
- [ ] No base or layout component spreads an unfiltered prop object onto the DOM.
- [ ] `className` and `style` are not forwardable through `CommonProps`.
- [ ] `bun run check`, `bun run typecheck`, `bun test`, and the demo build pass.

## Open questions

1. Should `Box` use the curated filter or keep forwarding every attribute? It is the
   Radix `asChild` target, and Radix may pass a `style` for animation. Recommendation:
   use the curated filter, then confirm the dialog in the browser.
2. Should the page-shell components accept `CommonProps`? Recommendation: yes, for
   consistency. The `SiteNavigationHeader` keeps its own `inert` and `aria-hidden`.
