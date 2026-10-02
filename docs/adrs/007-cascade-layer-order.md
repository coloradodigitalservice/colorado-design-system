# ADR-007: Cascade layer order and USWDS layering

- **Status:** Proposed pending technical lead and State technology owner approval
- **Date:** 2026-10-02
- **Related work:** CODS-P1-018 (Jira CDS-105), CODS-P1-015, CODS-P1-004, ADR-002, ADR-003

## Context

The component contract requires public CSS in the `cods.components` layer. USWDS and the CoDS override partials were compiled unlayered. Unlayered rules beat layered rules regardless of specificity, so a `cods.components` rule always lost to a `.usa-*` rule. That blocks type A components, which must be able to override USWDS (ADR-002), without `!important` or specificity inflation. Sass also emits forwarded CSS in order, so a layer-order statement placed after the forwards would no longer set the order once a layered partial was forwarded.

## Options

| Option                                   | Result                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A. USWDS in a lowest `uswds` layer       | CoDS layers override USWDS by layer order; consumers' unlayered CSS still overrides CoDS. **Chosen.** |
| B. Remove cascade layers                 | Overrides depend on source order and specificity; consumers cannot reliably override CoDS. Rejected.  |
| C. Keep the status quo (USWDS unlayered) | `cods.components` can never override USWDS. Rejected.                                                 |

## Decision

1. **Layer order:** `@layer uswds, cods.reset, cods.base, cods.components, cods.utilities;`. Later layers win. Unlayered consumer CSS wins over all of them.
2. **Order statement:** declared alone in `src/styles/_cods-layers.scss`, which `index.scss` forwards first.
3. **USWDS:** `src/styles/_uswds-layer.scss` loads `uswds-theme` (which still configures `uswds-core` first) and then loads the `uswds` library inside `@layer uswds`.
4. **Overrides:** `_cods-color-overrides.scss` and `_cods-typography-overrides.scss` live in the existing `cods.base` layer; no new layer is added. They override USWDS because `cods.base` follows `uswds`, not because of source order.
5. **Components:** every component rule stays in `cods.components`. Type A overrides of USWDS go there, using the lowest specificity that selects the element.
6. **Minification:** the design-system build uses esbuild's CSS minifier (`build.cssMinify: 'esbuild'`) because Lightning CSS split the order statement and moved parts of it after rules. A browser test asserts the built stylesheet begins with the statement.

## Consequences

- **`!important` limitation:** USWDS utility classes (for example `.margin-*`, `.display-*`) use `!important`. For important declarations the layer order reverses, so a normal CoDS declaration cannot override them. Do not add `!important` to work around this; change the markup or use a different utility.
- `0.0.x` change note: cascade behavior of the compiled stylesheet changed. Consumers that relied on their own unlayered CSS losing to USWDS, or on CoDS and USWDS sharing one unlayered cascade, should re-check overrides. No consumer outside this repository is known to depend on the old output.
- **Browser support:** `@layer` is supported in Chrome and Edge 99, Firefox 97, and Safari 15.4 (all 2022). The repository does not yet record a supported-browser policy; the technical lead must confirm that it covers these minimums before approval. Browsers without `@layer` support drop layered rules entirely.
- `@font-face` inside `@layer uswds` is verified by a browser test in Chromium, Firefox, and WebKit.
- Any new layer amends contract section 3 and this record.
- No visual-regression baselines exist yet; before and after rendering of existing pages and stories is compared manually and recorded in the pull request.
