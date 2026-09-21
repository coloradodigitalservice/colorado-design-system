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

Decisions recorded September 21: `radius-full` is 9999px, following the written Radius table rather than the variable-panel value 999. `color-shadow` is black (#000000), an explicit user assumption, not a measured screenshot value. It represents the base color only; shadow opacity and geometry remain unspecified.

The Language Selector notes explicitly describe a 4px blue trigger ring with a 2px white gap and a 2px navy row outline. `focus-ring-width`, `focus-ring-offset`, `color-focus-gap`, `focus-row-width`, and `color-focus-row` encode these treatments. The trigger uses the workbook's `color-bg-action-focus`. A transparent outline offset alone does not paint a white gap; the sample includes a white spread shadow. These are two focus treatments, not competing system-wide values. Component styles select the appropriate treatment and still require keyboard/forced-color verification.

## P1-004 reconciliation

Both complete sample Sass files now compile in tests. The disclosure uses `color-border-subtle`, the existing `color-bg-action-focus`, and the documented trigger focus dimensions. The tag uses `color-bg-surface-secondary`, `color-bg-tag-info`, and `color-text-tag-info`.

`src/supplemental.tokens.json` separates these implementation mappings from the unchanged 46 workbook roles. Secondary surface maps to gray/10; subtle border to gray/20; blue tag background to blue/20 and its dark text to blue/90. These choices follow screenshot appearance and the supplied palette; they are explicitly implementation decisions rather than exact workbook mappings. Reviewers can assess concrete values instead of unresolved placeholder names. The controller contract now describes Phil's existing module-function API, `init(root)` / `destroy(root)`.

## Accessibility and troubleshooting

`references/contrast-pairs.json` records the 16 selected text, link, button, form-border, status-icon, and focus-color pairs and their thresholds. Validation fails rather than changing supplied values. Disabled states are excluded. These checks do not approve component accessibility or arbitrary token combinations.

Review full focus visibility and obscuration, reduced-motion behavior, typography at zoom/reflow and with fallback fonts, and forced-color rendering at component level. Preserve native semantics and test keyboard and assistive-technology behavior. The focus-color check against white does not establish a complete focus treatment.

For profile errors, follow the reported source path and supported types above. For alias errors, check the exact category/key and type. For drift, regenerate intentionally and review the diff; remove unexpected generated files only after checking their purpose. For Sass resolution, confirm the workspace dependency, install, load path, and generated files. Human design and technical reviews remain recorded as pending in [G1 evidence](../../../governance/evidence/g1/tokens.md).
