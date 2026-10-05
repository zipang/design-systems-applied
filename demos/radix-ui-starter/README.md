# Radix UI Starter

A themeable chat demo that shows how to apply the Design Systems Applied token
contract on top of Radix UI. Radix UI is a good choice for this purpose because its
components come with no styles. We wrap them and style them with design tokens only.

Status: under construction (Ticket T0002). See `roadmap/T0002/spec.md` and
`roadmap/T0002/plan.md`.

## Component library

The components live in `src/components/`. Each tier has a README with its component
list and usage examples:

- [`src/components/README.md`](src/components/README.md) — tiers, rules, and how to add
  a component.
- [`src/components/layout/README.md`](src/components/layout/README.md) — layout
  primitives and the page shell.
- [`src/assets/icons/README.md`](src/assets/icons/README.md) — SVG icons and how to add
  one.

The package is a standalone project with its own `tsconfig.json`. It declares the
import aliases `@components`, `@assets`, `@lib`, and `@styles`.
