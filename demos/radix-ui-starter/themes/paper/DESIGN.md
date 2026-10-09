---
version: alpha
name: Paper

colors:
  brand:
    primary:   "#111111"
    accent:    "#005fcc"
    secondary: "#555555"
    tertiary:  "#b8b8b8"
  action:
    success: "#08783e"
    info:    "#005fcc"
    warning: "#8a5700"
    danger:  "#b42318"
  text:
    base:    "#111111"
    accent:  "#005fcc"
    muted:   "#555555"
    ondark:  "#ffffff"
  surface:
    base: "#ffffff"
    alt:  "#f0f0f0"
    dark: "#111111"
    card: "#ffffff"

typography:
  base: {
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: "var(--font-weight-regular)",
    lineHeight: "var(--line-height-regular)"
  }
  display: {
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--line-height-tight)"
  }
  mono: {
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: "var(--font-weight-thin)",
    lineHeight: "var(--line-height-regular)"
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

The **paper** theme, ported from the applied-design-systems-eliza-chatbot-demo
reference. It uses the same token contract; only colors and fonts differ from the
paper theme.

## Colors

Brand, action, text, and surface roles follow the reference palette. The surface
tint is derived with `color-mix` over the accent.

## Typography

Fonts are set per theme (DM Sans, IBM Plex Mono, Space Mono, or Azeret Mono).
