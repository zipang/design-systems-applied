# T0007 reference inventory — ds-visualizer

Source: `.tmp/ds-visualizer/src/app/App.tsx` (~2,063 lines, single component) plus
`src/styles/theme.css`, `package.json`, and the Figma import screenshot. Behaviour below is
derived from the source; runtime capture was skipped to keep the port on schedule.

## Stack (old)

Vite + React 18 + Tailwind v4 + shadcn/Radix (styled) + MUI + ~90 libraries. A free-form
`DS` model (`--ds-*` variables), persisted to `localStorage` (`ds-visualizer-v1`), imported
from a CSS file and exported as `design-system.css`.

## Behaviour inventory

### Toolbar
- Wordmark `DS·VISUALIZER`; green dot + filename badge once a CSS file is loaded.
- **Token guide** → modal listing the exported `--ds-*` reference.
- **Load CSS** → file input, `parseCSSVars`, maps `--ds-*` back into the model.
- **Export CSS** → builds a `:root` block and downloads `design-system.css`.
- **Reset** → clears `localStorage` and restores `INIT`.

### Section nav
- Five dots (Type, Color, Spacing, Shape, Components), active one scaled up, smooth scroll,
  `IntersectionObserver` tracks the visible section.

### Typography (01)
- Tabs: Headings / Body / Mono.
- Per track: font family (picker), base px, scale ratio, steps, line height, weight.
- Font picker modal: providers (Google / System / Adobe-disabled), categories
  (All/Serif/Sans/Display/Mono/Script), search, preview text, lazy Google Font load via
  `IntersectionObserver`, two-column font cards.
- Sample rows with `H1…`, `xl/lg/base/sm/xs`, `lg/base/sm/xs` labels, computed `rem`,
  inline `contentEditable` sample text.

### Colors (02)
- Tabs: Palette / Usage.
- Palette groups: Brand (accent, primary, secondary, tertiary) and Action (success,
  warning, info, danger), swatches open the native color picker, show token + hex.
- Usage: one panel per surface (`base`, `alt`, `dark`, `card`); heading + text rows with
  WCAG contrast badges; on `card`, brand and action button samples.

### Spacing (03)
- Config: base px, type (geometric / arithmetic), ratio or increment, steps.
- Scale bars with `--space-*` names and `rem` values; visual preview squares.

### Shape (04)
- Border radius: editable per step, preview tiles.
- Elevation: editable blur/spread/y/opacity per level, preview cards.

### Components (05)
- Tabs: Buttons (variants, sizes, states), Containers (text, text+image, full-bleed),
  Cards (article, image, stat, feature, notification).

### Chrome
- Fixed toolbar; left dot nav; footer hint + back-to-top. `prefers-reduced-motion` is not
  honoured. Editable text via `contentEditable`.

## Mapping to T0007

See the spec's parity table. Key deltas: fixed token list (no arbitrary elevation levels or
radius names), derived `muted`/`active` color variants, Bun server read/save instead of
`localStorage` + manual import/export, and our component library + token-only CSS in place
of Tailwind/shadcn.
