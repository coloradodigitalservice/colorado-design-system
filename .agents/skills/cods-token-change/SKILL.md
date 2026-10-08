---
name: cods-token-change
description: Propose and implement a design-token change in the CoDS DTCG sources. Use when adding, renaming, removing, or re-aliasing a token under packages/colorado-design-tokens/src, when a component needs a color, spacing, radius, typography, or focus value that has no token, or when a Figma variable changed and the repository must be updated. Covers classification, alias impact, contrast, reviewers, and regeneration.
argument-hint: '<token-name> <add|rename|remove|re-alias>'
---

# CoDS token change

Reviewed DTCG files in Git are the release authority; Figma is a display surface. A Figma variable change is not a token change until it is in `src/*.tokens.json` and passes `pnpm tokens:check` ([AGENTS.md](../../../AGENTS.md)). Format rules, naming, and consumers are in the [tokens README](../../../packages/colorado-design-tokens/README.md); this skill covers the decisions the validators cannot make and does not repeat those rules.

Never edit `packages/colorado-design-tokens/generated/**` by hand. Regenerate it.

## Procedure

1. **State the need.** What component or foundation needs the value, and why no existing token fits. Search first: `grep -rn "<value or role>" packages/colorado-design-tokens/src packages/colorado-design-tokens/references/mapping.md`. Prefer reusing a token.
2. **Classify** using the table below. The file decides who must review.
3. **Check alias impact** before changing or removing anything: [alias impact](#alias-impact).
4. **Edit the source.** Follow the profile in the README: flat lowercase kebab-case key, `$type`, `$value`, and `$extensions.org.colorado.source` with the original name and location. Semantic and supplemental colors alias a palette token (`{color.co-blue-80-brand}`), not a literal, and an alias must target the same `$type`.
5. **Contrast.** If the token is a foreground or background that will be used for text, links, controls, borders, or focus, decide whether it needs a pair in `references/contrast-pairs.json`. Run the ratio against the surfaces it will really sit on. Never change `references/design-values.json` or a failing test to make a change pass; that file needs explicit design review.
6. **Regenerate and verify** from the repo root, then commit sources and all four generated files together:

   ```sh
   pnpm tokens:validate
   pnpm tokens:build
   pnpm tokens:check
   pnpm check
   ```

7. **Update the reference docs** that name the token: `references/mapping.md` for source roles and foundations, and the README's "Sources and pending decisions" if a pending decision changes.
8. **Write the change proposal** in the PR using the [template](./assets/change-proposal.md) and name the reviewers below. `CODEOWNERS` currently routes everything to the technical maintainers, so request design and accessibility reviewers explicitly.

## Classify

| What you need                                                                                                                | Where it goes                                         | Notes                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A new palette color from the design source                                                                                   | `primitives.tokens.json`                              | Rare. Needs the design source and design owner approval. Palette tokens exist to supply aliases; components do not use them directly.                                                                    |
| A new semantic role from a reviewed design source                                                                            | `semantic.tokens.json`                                | Treat as a design-reviewed change. The pipeline test asserts exactly 46 semantic colors and the reference file lists them, so this also updates `design-values.json` and the test, with design sign-off. |
| A component-level choice among existing palette values (implementation mapping)                                              | `supplemental.tokens.json`                            | The usual path for component work. Alias an existing palette token and describe the source in `$extensions`, as the existing entries do.                                                                 |
| Spacing, radius, typography, or focus value                                                                                  | `foundations.tokens.json`                             | Keep explicit design-reference values; do not convert units.                                                                                                                                             |
| Limited component aliases to semantic roles                                                                                  | `supplemental.tokens.json`, flat `component` category | See the [Phase 3 catalog proposal](../../../packages/colorado-design-tokens/references/catalog-review.md). Preserve semantic customization; do not duplicate palette literals.                           |
| Responsive typography modes                                                                                                  | `foundations.tokens.json`                             | Use explicit desktop/mobile names; consumer styles choose responsive behavior.                                                                                                                           |
| Composite tokens, embedded mode objects, complete per-component catalogs, alternate color spaces, transparent contrast pairs | Not supported by the current profile                  | Raise further expansion as a profile change, not a token change.                                                                                                                                         |

Use semantic colors in components. If a component only needs a different look for one state, check whether a supplemental alias is enough before adding a new palette value.

## Alias impact

Find every consumer before renaming, removing, or re-aliasing. A path like `color.bg-action-primary-hover` appears as `tokens.$color-bg-action-primary-hover` in Sass, `--cods-color-bg-action-primary-hover` in CSS, and `color-bg-action-primary-hover` in JSON.

```sh
grep -rnE "color-bg-action-primary-hover" packages apps docs tests --include='*.scss' --include='*.ts' --include='*.md' --include='*.json' --include='*.html' -l --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=generated --exclude-dir=storybook-static
```

Replace the sample name with the token. Specifically check:

- Component Sass partials and fixtures under `packages/colorado-design-system/src/components/`.
- `_cods-color-overrides.scss`, which uses `--cods-*` custom properties for USWDS selectors, and `_uswds-theme.scss`.
- The contract samples under `docs/governance/component-contract-samples/`, which tests compile.
- `references/contrast-pairs.json`, `references/mapping.md`, and `references/design-values.json`.
- Other tokens that alias this one: the validator reports missing targets and cycles, but a re-alias silently changes every dependent token's value.

A rename or removal changes the public CSS, Sass, and JSON names. State this in the proposal; the package is `0.0.x`, so breaking changes are allowed but must be visible.

## Reviewers

Per the [RACI](../../../docs/governance/ownership-and-raci.md): the Aten design lead is responsible and the State design owner accountable for tokens and visual language. Consult the accessibility lead for color, contrast, and focus changes, and technical leads for naming and generated output. For a Figma-originated change, record which Figma variable and library version it came from in the PR and in `references/mapping.md`; when no immutable library version is available, record a dated source observation and its review status. Use available authorized Figma/browser tools or a supplied reference; observations do not replace design approval.

## Reference

- [Change proposal template](./assets/change-proposal.md)
- [Tokens README](../../../packages/colorado-design-tokens/README.md)
- [Design-to-code mapping](../../../packages/colorado-design-tokens/references/mapping.md)
