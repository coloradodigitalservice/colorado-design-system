# CODS-P1-003 token pipeline evidence

Implementation checks passed locally on September 21, 2026. **Design review, technical review, and G1 approval remain pending.** The estimate review with Phil was previously completed; this record does not substitute for implementation acceptance.

## Catalog and provenance

The catalog contains 240 tokens: 54 palette colors, all 46 semantic workbook mappings, 133 foundation tokens, and 7 supplemental color tokens. Each source token records the original design name and source location. The supplied `CDS Semantic Color Mapping.xlsx` hash and row mapping are preserved in [design-values.json](../../../packages/colorado-design-tokens/references/design-values.json); see the [readable mapping](../../../packages/colorado-design-tokens/references/mapping.md). The supplied screenshots establish palette, spacing, typography, and radius values. Reviewed DTCG sources in Git become release authority; attachments are initial references.

Phil's code-facing naming is preserved, including `text/default` → `color-text-primary`. All remaining semantic role segments are retained. Duplicate colors remain separate semantic roles. No pixel-to-rem conversion is applied. The package remains private.

## Local validation

Environment: Node 24.21.0, pnpm 12.4.2, Turbo 2.10.13, Style Dictionary 5.5.5.

| Check                   | Result                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`            | Passed workspace validation, uncached token drift check before generation, formatting, lint, typecheck, tests, and dependency-ordered build |
| Fresh working-tree copy | Frozen install and full checks passed without existing node_modules, Turbo cache, or build outputs                                          |
| Test suite              | 27 tests passed across 2 files                                                                                                              |
| Source profile          | Invalid values/types/units, missing or incompatible aliases, cycles, duplicate paths/JSON keys, and generated-name collisions rejected      |
| Source parity           | All 46 semantic mappings and 54 palette values matched the independent source transcription                                                 |
| Consumer formats        | CSS aliases preserved; Sass and JSON resolved; dimensions, color, family, weight, and numeric values tested, including multi-step aliases   |
| Consumer imports        | Phil's bare Sass import compiled with real variables; JSON dictionary and valid token names typechecked                                     |
| Determinism and drift   | Repeated generation identical; modified, missing, and unexpected generated files rejected                                                   |
| Contrast                | 16 documented pairs passed their thresholds; altered failing color rejected without rewriting design values                                 |

The existing CI workflow runs the same `pnpm check`. PR #2 is merged; PR #3 now targets `main` directly. The scaffold review fixes are verified against the merged main branch.

## Deferred values and component review

- Resolved `radius-full` to 9999px using the explicit table; black shadow base color is the user's approved assumption. Shadow opacity and geometry remain unspecified.
- Added the Language Selector's documented 4px blue trigger ring / 2px white gap and separate 2px navy row outline. Focus color uses the existing workbook `color-bg-action-focus`; the previous `color-border-focus` reference was incorrect and is removed.
- Both P1-004 sample Sass files and the interactive scaffold template compile in automated tests. Supplemental sample color mappings are implementation decisions from the supplied palette, separately labeled in source and the consumer guide. The controller contract is aligned with Phil's module functions and `destroy(root)`.
- Motion/reduced motion, typography fallback/zoom/reflow, forced colors, complete focus visibility, keyboard and assistive-technology behavior require component review. Token contrast checks do not constitute component accessibility approval.

## Required review record

| Review                                                                                 | Status                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| State design values, transcription, semantic role mapping, and contrast pair selection | Pending responsible design reviewer                    |
| Pipeline/profile, generated APIs, and P1-004 integration                               | Pending technical reviewer                             |
| Accessibility component evidence                                                       | Later component work; not approved by this token check |
| G1 gate approval                                                                       | Pending responsible approval roles                     |
