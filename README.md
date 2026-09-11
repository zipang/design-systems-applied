# Design Systems Applied

## The Problem

Vibe coding has irrupted as a practice to produce very quickly screens and apps with whatever features the user may want to throw at them and has been a successfull demonstration of the unrivaled speed of LLM to produce structured content (code).
Quickly enough through, this practice has introduce a numbers of very recurrent problems that have become the nightmares of those that imagined they could deliver products rivalizing with established companies : maintanability and performances problems, inconsistent design and patterns accross the product, illisible goals.  
One of these minors but very disqualifying problem is the derive : pages that look inconsistent accross the whole product. Incoherences in the choice of size, borders or colors or components that behave differently.
These problems all arise from the lack of a Design System or lack of 'vision' when starting the product implementation. Like building a house without a plan.

Google Labs tries to resolve this exact problem by introducind a spec for a DESIGN.md markdown file that should guide the AI coding agents through their work. DESIGN.md is an open-source specification that combines machine-readable design tokens in YAML front matter with human-readable design rationale in markdown prose.

We have followed this approach and even if it proved to be a step in the right direction, the lack of any strict rules really hampered the intention.

## The Solution

The solution presented in this web site is a set of additional rules, guides, tools and skills to complete the specification and enforce its implementation in predictable ways.

Our work as started as a recipe inside our ai lab project : https://github.com/zipang/the-ai-lab/tree/master/recipes/the-designer
