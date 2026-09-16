# Design Systems Applied

## The Problem

Vibe coding has irrupted as a practice to produce very quickly screens and apps with whatever features the user may want to throw at them, and has been a successful demonstration of the unrivaled speed of LLMs to produce structured content (code).
Quickly enough though, this practice has introduced a number of very recurrent problems that have become the nightmares of those that imagined they could deliver products rivaling with established companies: maintainability and performance problems, inconsistent design and patterns across the product, illegible goals.
One of these minor but very disqualifying problems is the drift: pages that look inconsistent across the whole product. Incoherences in the choice of sizes, borders or colors, or components that behave differently.
These problems all arise from the start because of the lack of a _Design System_, or the lack of a _Vision_. Like building a house without a plan.

## The first proposal

So Google Labs tried to solve this exact problem: they introduce a spec for a markdown file that would describe your Design System for coding agents. This file was called `DESIGN.md` and the specification was released in open-source at https://github.com/google-labs-code/design.md. The file format combines machine-readable design tokens in YAML front matter with human-readable design rationale in markdown prose.

We followed this approach. It was clearly a step in the right direction, but the lack of strict rules hampered the intent.
My main takeaway with the first Google spec is that it wasn't a ready to go recipe in anyway. None of the structures introduced in the spec were mandatory. So we could really each timle come with a different set of tokens with the same prompts and it wasn't for me the way to go : i don't want to restart from scratch every project now that i have clear path to destination. Some conventions needs to be enforced and not re-imaginated each time. So we needed an opiniated way to do the full process of documenting our Design System with some off-the-shelf recipes ready to implement in your library of choice.

## Going one step further

The final solution presented in this repository is a set of additional rules, guides, tools, and skills. They complete the specification and enforce its implementation in predictable ways.

Our work started as a recipe inside our >> [AI lab project](https://github.com/zipang/the-ai-lab/tree/master/recipes/the-designer) << but after some real usage to build new project, i thought that this recipe really desserved its own place as it is really a foundation, a recipe you must use before every others..

The key idea is to define a _fixed standard list_ of design tokens to cover every frugal needs in our Design System (this setup is definitively minimalist by design) and use them inside the `DESIGN.md` front matter AND separately in a ready-to-use _theme stylesheet_ implementing these tokens with **CSS variables**.

Because the YAML front-matter is a structured object and CSS variables are flat, we need a translation table that gives us the path to a design token inside `DESIGN.md` (like`{colors.brand.primary}`) and its declaration as a CSS variable in our theme stylesheet : `--colors-brand-primary`.


## Introducing our standard list of design tokens

So here is the list of design tokens that should cover 80% of every website design needs (we won't cover the other 20% because they require real designers to do so..)

The list is splitted into the same categories you'll 

### Colors

Colors are splitted into four sub-categories : brand, actions, text, surfaces.


### Typography

### Space

### Shapes

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
