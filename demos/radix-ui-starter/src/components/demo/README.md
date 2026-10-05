# demo/

The demo pages and their sections. These components compose the whole page from
`base/`, `ui/`, `layout/`, and `chat/`. The rules for the tier are in
[`../AGENTS.md`](../AGENTS.md).

## AppNav

The site navigation that every page shares: a switch between the demo pages and the
theme picker. It renders a `nav` inside a `SiteNavigationHeader`, so it collapses with
the scroll.

| Prop | Type | Notes |
|------|------|-------|
| `view` | `"chat"` or `"components"` | The active page. |
| `onNavigate` | `(view: View) => void` | Selects a page. |
| `className` | `string` | Extra classes. |

```tsx
import { AppNav } from "@components/demo/AppNav";

<AppNav view={view} onNavigate={setView} />
```

## ComponentsPage

The components page. It puts `ComponentsDemo` in the page body. It takes no props.

```tsx
import { ComponentsPage } from "@components/demo/ComponentsPage";

<ComponentsPage />
```

## ComponentsDemo

The library gallery. It presents every component in numbered sections, with the
variants and the sizes of each. It takes no props.

## DemoSection

A numbered, titled section of the gallery.

| Prop | Type | Notes |
|------|------|-------|
| `index` | `number` | The section number. |
| `title` | `string` | The section title. |
| `children` | `ReactNode` | The section content. |

```tsx
import { DemoSection } from "@components/demo/DemoSection";

<DemoSection index={4} title="Buttons">
  <Button label="Send" />
</DemoSection>
```

## DemoColorPalette

The color tokens as labeled swatches. Each swatch uses its token background utility
class, so it re-themes with the active theme. It takes no props.
