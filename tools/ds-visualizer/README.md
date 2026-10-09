# Radix UI Starter

A themeable chat demo that shows how to apply the Design Systems Applied token
contract on top of Radix UI. Radix UI is a good choice for this purpose because its
components come with no styles. We wrap them and style them with design tokens only.

## Component library

UI components live in `src/components/` where they are organized following the Atomic Design principles. 


- [`@components/layout/README.md`](src/components/layout/README.md) — layout
  primitives and the page shell.
- [`@assets/icons/README.md`](src/assets/icons/README.md) — SVG icons and how to add
  one.

The package is a standalone project with its own `tsconfig.json`. It declares the
import aliases `@components`, `@assets`, `@lib`, and `@styles`.
