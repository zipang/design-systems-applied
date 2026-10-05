# base/

Typography and low-level primitives. These components replace raw HTML text tags in
pages and in other components. The rules for the tier are in
[`../AGENTS.md`](../AGENTS.md).

Examples use the package aliases declared in [`tsconfig.json`](../../tsconfig.json).

## Heading

Renders an `h1`–`h6` element on the display font.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `level` | `1`–`6` | `2` | Sets the element and the default size. |
| `size` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `display` | by level | Overrides the type size. |
| `className` | `string` | — | Extra classes. |
| `ref` | `Ref<HTMLHeadingElement>` | — | Element ref. |

The default size per level is `1` → `xl`, `2` → `lg`, `3` → `md`, `4` → `sm`,
`5` → `sm`, `6` → `xs`.

```tsx
import { Heading } from "@components/base/Heading";

<Heading level={1}>Eliza</Heading>
<Heading level={2} size="display">Level 2 · display size</Heading>
```

## Text

Renders body copy on the base font.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `size` | `xs`, `sm`, `md`, `lg`, `xl` | `md` | Token type size. |
| `tone` | `base`, `muted`, `accent`, `ondark` | `base` | Semantic text color. |
| `as` | `p`, `span` | `p` | Element. Use `span` for inline text. |
| `className` | `string` | — | Extra classes. |
| `ref` | `Ref<HTMLParagraphElement>` | — | Element ref. |

```tsx
import { Text } from "@components/base/Text";

<Text>Good afternoon. What would you like to discuss?</Text>
<Text as="span" size="sm" tone="muted">What is on your mind?</Text>
```

## Icon

Renders a bundled SVG inline. The strokes follow `currentColor`, so the icon uses the
text color of its parent.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `name` | icon name | — | See [assets/icons](../../assets/icons/README.md). |
| `size` | `sm`, `md`, `lg` | `md` | Token size. |
| `label` | `string` | — | Accessible name. Without it the icon is decorative. |
| `className` | `string` | — | Extra classes. |

```tsx
import { Icon } from "@components/base/Icon";

<Icon name="add" label="Attach a file" />
<Icon name="send" size="sm" />
```

Icons are added as `.svg` files and registered in [`icons.ts`](./icons.ts). See the
[icons README](../../assets/icons/README.md).
