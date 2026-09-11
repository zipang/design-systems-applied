# Design Systems Applied

## The Problem

Vibe coding has irrupted as a practice to produce very quickly screens and apps with whatever features the user may want to throw at them, and has been a successful demonstration of the unrivaled speed of LLMs to produce structured content (code).
Quickly enough though, this practice has introduced a number of very recurrent problems that have become the nightmares of those that imagined they could deliver products rivaling with established companies: maintainability and performance problems, inconsistent design and patterns across the product, illegible goals.
One of these minor but very disqualifying problems is the drift: pages that look inconsistent across the whole product. Incoherences in the choice of sizes, borders or colors, or components that behave differently.
These problems all arise from the lack of a Design System, or the lack of vision, when starting the product implementation. Like building a house without a plan.

Google Labs tries to resolve this exact problem with a spec for a `DESIGN.md` markdown file. This file must guide AI coding agents through their work. `DESIGN.md` is an open-source specification. It combines machine-readable design tokens in YAML front matter with human-readable design rationale in markdown prose.

We followed this approach. It was a step in the right direction, but the lack of strict rules hampered the intent.

## The Solution

The solution presented in this repository is a set of additional rules, guides, tools, and skills. They complete the specification and enforce its implementation in predictable ways.

Our work started as a recipe inside our AI lab project: https://github.com/zipang/the-ai-lab/tree/master/recipes/the-designer

## Glossary

Entries are sorted alphabetically.

- **AI agent**: A program powered by an LLM (such as opencode) that reads this repository, follows its rules and skills, and writes code for us. Our rules and guides target AI agents first, humans second.
- **Design System**: The single source of truth for the visual language of a product. In this project, it is a dual-file contract: `DESIGN.md` (the rationale and rules) plus `theme.css` (the tokens as CSS variables).
- **Design token**: A named visual value (a color, a font size, a spacing step) exposed as a CSS variable. The token list is fixed. Components must consume tokens with `var()` and never write raw values.
- **DESIGN.md**: A markdown file at the root of a project, defined by the Google Labs spec. It holds the design tokens in YAML front matter and the component rules in prose.
- **Drift**: The slow loss of visual coherence across the pages of a product: inconsistent sizes, borders, colors, or component behavior. Also called "design derive". Drift is the main problem this project fights.
- **Recipe**: A self-contained procedure from our AI lab project (the-ai-lab) that combines prompts, rules, and tools to reach one goal. This project started as the "the-designer" recipe.
- **Skill**: A markdown file under `.agents/skills/` that gives an AI agent instructions for one task (for example: apply the Design System, write a spec, commit changes). The agent loads a skill when its task matches the skill description.
- **Theme stylesheet**: The `theme.css` file. It defines every design token as a CSS variable inside one `:root` block. It is the executable half of the Design System contract.
- **Vibe coding**: The practice of producing software by prompting an LLM without a plan or a specification. Fast, but it causes the problems listed above.
