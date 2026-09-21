# Design tokens

Reviewed DTCG files in Git are the release authority. The supplied State workbook and Figma screenshots are the initial design references. This package remains private; publication and release packaging are separate work.

## Edit and generate

Edit `src/*.tokens.json`, then run `pnpm tokens:validate`, `pnpm tokens:build`, and `pnpm check` from the repository root. Commit sources and all four generated files together. Never edit generated files directly. Style Dictionary is pinned to 5.5.5.

`pnpm tokens:check` validates and regenerates into a temporary directory, comparing the entire file set and bytes with `generated/`. Missing, modified, and unexpected files fail. It is uncached in Turbo and runs before build in `pnpm check` and CI, so regeneration cannot conceal drift. Explicit `tokens:build` intentionally updates committed outputs. Turbo builds tokens before dependent packages and caches `generated/**`.

## Project profile

The catalog uses a constrained [DTCG 2025.10 format](https://www.designtokens.org/tr/2025.10/format/) profile, validated by `profile.schema.json`. This is not a validator for every DTCG feature. Each category contains flat, lowercase kebab-case keys; every token has `$type`, `$value`, and `$extensions.org.colorado.source` with the original name and source location. Optional `$description` is supported.

Supported literals are sRGB colors (three normalized components and explicit alpha), dimensions with numeric value and `px` or `rem` unit, font families (string or nonempty string array), numeric font weights from 1 through 1000, and numbers. Units are preserved; no pixel-to-rem conversion occurs. Composite tokens, inherited types, alternate color spaces, modes, and component catalogs are outside this initial profile.

Any supported type can instead use an exact whole-value reference such as `{color.co-blue-80-brand}`. References must target the same type. Multi-step aliases are supported; missing targets, cycles, duplicate JSON keys/token paths, and flattened-name collisions fail with source paths. Do not place literal values on semantic colors when a palette alias exists.

A path such as `color.bg-action-primary-hover` becomes `$color-bg-action-primary-hover` in Sass, `--cods-color-bg-action-primary-hover` in CSS, and `color-bg-action-primary-hover` in JSON. CSS preserves references as `var()`; Sass and JSON resolve them. JSON is a flat value dictionary, with dimensions and colors serialized as CSS strings and numeric tokens retained as numbers. Type declarations describe this dictionary and its valid names. Outputs are sorted with static headers and no timestamps.

## Consumers

```scss
@use '@coloradodigitalservice/colorado-design-tokens' as tokens;

.example {
  color: tokens.$color-text-primary;
  padding: tokens.$space-sm;
  border-radius: tokens.$radius-sm;
  font-size: tokens.$font-size-sm;
}
```

Configure Sass's load path to the consumer's `node_modules` (the core build does this with `--load-path=node_modules`). The package-root `_index.scss` forwards generated variables. A workspace dependency must be installed before this import resolves.

CSS consumers import `@coloradodigitalservice/colorado-design-tokens/tokens.css`. TypeScript consumers use:

```ts
import tokens from '@coloradodigitalservice/colorado-design-tokens/tokens.json' with { type: 'json' };
import type { TokenName } from '@coloradodigitalservice/colorado-design-tokens/types';

const name: TokenName = 'color-text-primary';
const value = tokens[name];
```

Use semantic colors in components. Palette tokens exist to supply aliases. Desktop and mobile typography are separate tokens; later component styles choose responsive behavior.

## Sources and pending decisions

See [design-to-code mapping](references/mapping.md) and `references/design-values.json` for the 54 palette colors and all 46 workbook roles, including roles with identical values. The reference JSON records the workbook hash and row positions; it is an independent test reference, not generator input. Changing it requires explicit design review of the replacement source, not merely updating a failing test.

Spacing is 4, 8, 12, 16, 24, 32, 48, and 64px, mapped to Phil's `2xs` through `3xl` scale. Radius is none=0, sm=2, md=4, lg=8px. Typography uses the screenshot's desktop/mobile tables, retaining their explicit line heights and paragraph spacing even where they differ from font size. Families are Museo Slab, Open Sans, and Source Code Pro; font binaries and licenses are not distributed here. `font-size-sm` aliases desktop body small (14px).

Deferred: `radius-full` (999 versus 9999), shadow color/opacity, and the complete focus effect. The documented `color-border-focus` mapping is retained, but focus width and offset are unspecified. No motion values, dark mode, or assumed sample tokens are invented.

## P1-004 reconciliation

Phil's sample names `color-text-primary`, `space-2xs`, `space-xs`, `radius-sm`, and `font-size-sm` are available. For examples, use the documented role that actually matches the context: `color-bg-surface-secondary` for a secondary surface and `color-border-focus` for the focus color. Names `color-surface-info`, `color-text-info`, and `color-border-secondary` have no unambiguous supplied equivalent and remain pending; do not globally substitute unrelated roles. `color-focus-ring` can use `color-border-focus` for color only. `focus-ring-width` and `focus-ring-offset` remain pending.

This branch is stacked on PR #2's scaffold. Documented secondary-surface and focus-color equivalents are reconciled in its samples; unsupported names remain pending. The representative Sass consumer is tested, but the complete interactive scaffold is not claimed to compile until its focus dependencies are resolved. Correct the separate controller lifecycle inconsistency in P1-004.

## Accessibility and troubleshooting

`references/contrast-pairs.json` records the 16 selected text, link, button, form-border, status-icon, and focus-color pairs and their thresholds. Validation fails rather than changing supplied values. Disabled states are excluded. These checks do not approve component accessibility or arbitrary token combinations.

Review full focus visibility and obscuration, reduced-motion behavior, typography at zoom/reflow and with fallback fonts, and forced-color rendering at component level. Preserve native semantics and test keyboard and assistive-technology behavior. The focus-color check against white does not establish a complete focus treatment.

For profile errors, follow the reported source path and supported types above. For alias errors, check the exact category/key and type. For drift, regenerate intentionally and review the diff; remove unexpected generated files only after checking their purpose. For Sass resolution, confirm the workspace dependency, install, load path, and generated files. Human design and technical reviews remain recorded as pending in [G1 evidence](../../../governance/evidence/g1/tokens.md).
