# Component page outline

Source: [CoDS Website Content](https://docs.google.com/document/d/1ZO2oYzgv3adGzze0vfXuvqgQ50pqpFWiIaygVR5XADo/edit?tab=t.g9tyx0lh64iq), "Component Page Content" tab (Zach Alcorn, OIT). It defines the structure and gives Button as an example; it is not per-component copy.

## Order of sections

| Rendered heading                      | Source                                                      | Notes                                                                                                                                                               |
| ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `h1` title                            | frontmatter `title`                                         |                                                                                                                                                                     |
| Lead description                      | frontmatter `description`                                   | One sentence, normally the Figma page header.                                                                                                                       |
| `## Component preview`                | `ComponentPreview.astro`                                    | Common variants, typically those on the Figma page if not too many. Each is a canonical fixture state.                                                              |
| `## Component code`                   | `ComponentPreview.astro`                                    | Exactly the markup that renders the preview. Generated; never hand-written.                                                                                         |
| `## Component status`                 | `ComponentStatus.astro` + frontmatter `accessibilityStatus` | Maturity, accessibility review status, USWDS version basis, evidence/source/Figma links.                                                                            |
| `## Guidance` → `### When to use`     | markdown                                                    | Include variants and do's/don'ts from Figma. **Variant table** (Variant / Use when / Don't use when) when the component has variants; **bullets** when it does not. |
| `### Writing for <component>`         | markdown                                                    | Only when Figma supplies writing guidance.                                                                                                                          |
| `### Accessibility for <component>`   | markdown                                                    | Short bullets: keyboard, focus, naming, authoring responsibilities. Some from Figma; fill gaps from the implementation.                                             |
| `## Specifications` → variant classes | markdown                                                    | Class / Use table. Pair each `cods-*` class with its `usa-*` class.                                                                                                 |
| Variable settings                     | markdown                                                    | Only custom properties the component actually supports and that are useful.                                                                                         |
| Component-specific specs              | markdown                                                    | For example Button "Adding icons", Accordion "Initializing the controller", API, events, limitations.                                                               |

## Exclude

- Localization and RTL information. It is untested publicly; internal localization evidence remains required in the evidence file.
- The long list of examples at the end of current pages.

## Reviewer comments on the document

- Button's preview should include **Slim** and **Icon only** as well as the screenshot's variants.
- For components without variants, When to use is **bullet points, not a table**.

## Corrections required by CDS-85

The Button example is illustrative. Do not copy:

- "Button has passed WCAG 2.2." Write an evidence-backed status instead.
- `cods-button-secondary` in the code sample (the class is `cods-button--secondary`).
- The stray `</svg>` in the Adding icons sample.
- `/icons/sprite.svg` paths that do not match the built asset URL; use the package's sprite import.

## Wiring a page

```astro
<!-- apps/web/src/components/<Name>Examples.astro -->
<ComponentPreview
  displayName={metadata.displayName}
  examples={examples.examples}
  variants={[
    { state: 'default', label: 'Default' },
    { state: 'secondary', label: 'Secondary' },
  ]}
/>
<!-- plus an init <script> for interactive components -->
```

In `[...slug].astro`, render the lead paragraph, the examples component, and `ComponentStatus` for the component, then `<Content />`. Remove the component from the `ComponentSummary` id list. Add `accessibilityStatus` to the page frontmatter.

Fixture states are rendered without their `<section>` wrapper and `<h2>` label (`apps/web/src/lib/preview-markup.mjs`). If a fixture state does not follow that pattern, fix the preview helper rather than hand-writing code.
