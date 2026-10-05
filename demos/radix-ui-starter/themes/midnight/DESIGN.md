---
version: alpha
name: Midnight

colors:
  brand:
    primary:   "#101631"
    accent:    "#3045dc"
    secondary: "#414968"
    tertiary:  "#8990aa"
  action:
    success: "#08783e"
    info:    "#3045dc"
    warning: "#8a5700"
    danger:  "#b42318"
  text:
    base:    "#101631"
    accent:  "#3045dc"
    muted:   "#414968"
    ondark:  "#ffffff"
  surface:
    base: "color-mix( in srgb, var(--color-brand-accent) 3%, white )"
    alt:  "rgba(48, 69, 220, 0.09)"
    dark: "#18236f"
    card: "#ffffff"

typography:
  base: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: "400",
    lineHeight: "1.5"
  }
  display: {
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: "700",
    lineHeight: "1.2"
  }
  mono: {
    fontFamily: '"IBM Plex Mono", monospace'
  }

rounded:
  none: "0"
  sm:   "0.25rem"
  md:   "0.75rem"
  lg:   "1.25rem"
  full: "9999px"

spacing:
  xs:   "0.25rem"
  sm:   "0.5rem"
  md:   "0.75rem"
  base: "1rem"
  lg:   "1.5rem"
  xl:   "2rem"
  xxl:  "3rem"

elevation:
  sm: "none"
  md: "none"
  lg: "none"

border:
  sm: "0.0625rem"
  md: "0.125rem"
  lg: "0.25rem"
---

## Overview

The **midnight** theme, ported from the applied-design-systems-eliza-chatbot-demo
reference. It uses the same token contract; only colors and fonts differ from the
paper theme.

## Colors

Brand, action, text, and surface roles follow the reference palette. The surface
tint is derived with `color-mix` over the accent.

## Typography

Fonts are set per theme (DM Sans, IBM Plex Mono, Space Mono, or Azeret Mono).
