# CODS-P1-003 token pipeline evidence

Implementation checks passed locally on September 21, 2026. **Design review, technical review, and G1 approval remain pending.** The estimate review with Phil was previously completed; this record does not substitute for implementation acceptance.

## Catalog and provenance

The catalog contains 229 tokens: 54 palette colors, all 46 semantic workbook mappings, and 129 foundation tokens. Each source token records the original design name and source location. The supplied `CDS Semantic Color Mapping.xlsx` hash and row mapping are preserved in [design-values.json](../../../packages/colorado-design-tokens/references/design-values.json); see the [readable mapping](../../../packages/colorado-design-tokens/references/mapping.md). The supplied screenshots establish palette, spacing, typography, and radius values. Reviewed DTCG sources in Git become release authority; attachments are initial references.

Phil's code-facing naming is preserved, including `text/default` → `color-text-primary`. All remaining semantic role segments are retained. Duplicate colors remain separate semantic roles. No pixel-to-rem conversion is applied. The package remains private.

## Local validation

Environment: Node 24.21.0, pnpm 12.4.2, Turbo 2.10.13, Style Dictionary 5.5.5.

| Check                   | Result                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`            | Passed workspace validation, uncached token drift check before generation, formatting, lint, typecheck, tests, and dependency-ordered build |
| Fresh working-tree copy | Frozen install and full checks passed without existing node_modules, Turbo cache, or build outputs                                          |
| Test suite              | 25 tests passed across 2 files                                                                                                              |
| Source profile          | Invalid values/types/units, missing or incompatible aliases, cycles, duplicate paths/JSON keys, and generated-name collisions rejected      |
| Source parity           | All 46 semantic mappings and 54 palette values matched the independent source transcription                                                 |
| Consumer formats        | CSS aliases preserved; Sass and JSON resolved; dimensions, color, family, weight, and numeric values tested, including multi-step aliases   |
| Consumer imports        | Phil's bare Sass import compiled with real variables; JSON dictionary and valid token names typechecked                                     |
| Determinism and drift   | Repeated generation identical; modified, missing, and unexpected generated files rejected                                                   |
| Contrast                | 16 documented pairs passed their thresholds; altered failing color rejected without rewriting design values                                 |

The existing CI workflow runs the same `pnpm check`; a GitHub Actions result for this implementation has not yet been recorded.

## Deferred values and component review

- `radius-full`: source conflict (999 versus 9999).
- Shadow color and opacity: unspecified.
- Full focus effect: color supplied as `color-border-focus`; width and offset remain unresolved.
- P1-004: supported example names are documented in the [consumer guide](../../../packages/colorado-design-tokens/README.md). Unsupported sample names remain pending. This branch is stacked on PR #2; documented secondary-surface and focus-color equivalents are reconciled, but full scaffold compilation is not claimed. Its controller lifecycle inconsistency belongs to P1-004.
- Motion/reduced motion, typography fallback/zoom/reflow, forced colors, complete focus visibility, keyboard and assistive-technology behavior require component review. Token contrast checks do not constitute component accessibility approval.

## Required review record

| Review                                                                                 | Status                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| State design values, transcription, semantic role mapping, and contrast pair selection | Pending responsible design reviewer                    |
| Pipeline/profile, generated APIs, and P1-004 integration                               | Pending technical reviewer                             |
| Accessibility component evidence                                                       | Later component work; not approved by this token check |
| G1 gate approval                                                                       | Pending responsible approval roles                     |
