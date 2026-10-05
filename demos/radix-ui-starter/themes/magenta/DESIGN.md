---
version: alpha
name: Magenta

colors:
  brand:
    primary:   "#4b0034"
    accent:    "#FF00FF"
    secondary: "#70405c"
    tertiary:  "#a87892"
  action:
    success: "#08783e"
    info:    "#FF00FF"
    warning: "#8a5700"
    danger:  "#b42318"
  text:
    base:    "#2d071e"
    accent:  "#a00076"
    muted:   "#70405c"
    ondark:  "#2d071e"
  surface:
    base: "color-mix( in srgb, var(--color-brand-accent) 3%, white )"
    alt:  "rgba(255, 0, 255, 0.1)"
    dark: "#FF00FF"
    card: "#ffffff"

typography:
  base: {
    fontFamily: '"Azeret Mono", monospace',
    fontWeight: "400",
    lineHeight: "1.5"
  }
  display: {
    fontFamily: '"Azeret Mono", monospace',
    fontWeight: "700",
    lineHeight: "1.2"
  }
  mono: {
    fontFamily: '"Azeret Mono", monospace'
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

The **magenta** theme, ported from the applied-design-systems-eliza-chatbot-demo
reference. It uses the same token contract; only colors and fonts differ from the
paper theme.

## Colors

Brand, action, text, and surface roles follow the reference palette. The surface
tint is derived with `color-mix` over the accent.

## Typography

Fonts are set per theme (DM Sans, IBM Plex Mono, Space Mono, or Azeret Mono).
