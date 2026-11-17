# Build Architecture

This document describes the package build configuration and distribution strategy for the Colorado Design System monorepo.

## Overview

The monorepo uses multiple build systems tailored to each package's needs:

- **colorado-design-tokens**: Custom build via [Style Dictionary 5.5.5](https://styledictionary.com/) (generates JSON, CSS, and TypeScript)
- **colorado-design-system**: [Vite 8.3+](https://vitejs.dev/) in library mode (generates ESM, CSS, and TypeScript declarations)

## Design System Package (`colorado-design-system`)

### Build System

The design system package uses **Vite in library mode** to compile components and styles into distributable artifacts.

**Configuration**: `packages/colorado-design-system/vite.config.ts`

```bash
# One-time production build
pnpm run -C packages/colorado-design-system build

# Watch mode for development
pnpm run -C packages/colorado-design-system build:watch

# Build from workspace root
pnpm build  # Via Turbo
```

### Output Files

After build, the `dist/` directory contains:

| File                         | Purpose                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `colorado-design-system.mjs` | ESM bundle with all components and exports                                       |
| `colorado-design-system.css` | Compiled CSS from `src/styles/index.scss`                                        |
| `fonts/`, `img/`             | Fonts and non-icon images referenced by the CSS                                  |
| `icons/`                     | Full Regular sprite, ID index, CSS-required SVGs, selector tools, and MIT notice |
| `logos/`                     | Unmodified State logo SVG and trademark notice                                   |
| `index.d.ts`                 | TypeScript type declarations for main entry                                      |
| `components/*.d.ts`          | Component-specific type declarations                                             |

### Package Exports

The package provides controlled subpath exports:

```typescript
// Main bundle (components + styles)
import { initComponentName } from '@coloradodigitalservice/colorado-design-system';

// Styles only
import '@coloradodigitalservice/colorado-design-system/styles.css';
```

The `/styles` subpath remains a compatibility alias for `/styles.css`; both
resolve to `dist/colorado-design-system.css`. Prefer `/styles.css` for new imports.

Consumers must not rely on undeclared export paths. The `./fixtures/*.html` and
`./metadata/*.json` patterns export every component's fixture and metadata,
including experimental components. These paths do not imply stable maturity;
check the component metadata. Per-component controller subpaths are not exported.

The Logos foundation ships the supplied, unmodified Colorado Design System SVG
and its trademark notice at `./logos/cods-logo.svg` and `./logos/NOTICE.md`.
The Vite build copies both from `src/assets/logos/` into `dist/logos/`; consumers
can import the SVG as an asset or deploy that directory with a release archive.
Preserve the notice when redistributing the SVG. No logo colors or dimensions
are exposed as tokens.

The Icon foundation uses every Regular ID from the pinned
`@phosphor-icons/core` development dependency. `pnpm icons:build` writes the
deterministic `generated/icons/sprite.svg` and `catalog.json`, which are
committed like token output. The compact index contains source/version/license,
weight, the full sprite's SHA-256, and the IDs only. The sprite embeds the MIT
notice. Never edit generated output by hand; `pnpm icons:check` regenerates it
in memory and fails on drift.

The package build verifies the committed sprite/index pair and writes it,
Phosphor's `LICENSE`, and the build-time selector tools under `dist/icons/`.
It parses the actual compiled CSS after USWDS URL remapping and generates only
the referenced standalone SVGs, rather than a file for every ID. Explicit-color
`<id>--<hex>.svg` variants are generated only where the compiled CSS needs
them. USWDS replacements in `build/uswds-icon-variants.json` preserve upstream
foregrounds; `build/component-icon-variants.json` verifies component
foregrounds against Git tokens. Neither file is an icon-availability list.

The exported `./icons/vite` plugin discovers recognized references in the Vite
module graph and emits a content-hashed sprite subset. It supports the existing
fixture and example imports in Astro and Storybook; Vite development serves the
full sprite. The `cods-icons` command scans explicit source paths for other
builds, validates IDs, and can write a subset and only the standalone CSS SVGs
referenced by those sources. The static example uses a subset while retaining
the full package assets. Dynamic IDs require explicit full-sprite mode and
application-level validation. See the
[package Icon documentation](../packages/colorado-design-system/README.md#icon-experimental)
for supported syntax, deployment, and licensing, and
[ADR-008](adrs/008-phosphor-regular-icon-distribution.md) for the decision and
approval status.

### Entry Points

- **TypeScript source**: `src/index.ts` → `dist/colorado-design-system.mjs`
- **Styles**: `src/styles/index.scss` → `dist/colorado-design-system.css`
- **Components barrel**: `src/components/index.ts` (re-exports all component controllers)

### Component assets and cascade

The build discovers component directories under `src/components/` and copies
`<name>.fixture.html` and `<name>.metadata.json` unchanged into
`dist/fixtures/<name>.html` and `dist/metadata/<name>.json`. The reserved
`shared/` support directory is skipped. Missing either required component asset
fails the build, regardless of maturity. Wildcard package exports make copying
and fixture/metadata registration automatic; no per-component list is needed.
For example, Site Alert resolves at `./fixtures/site-alert.html` and
`./metadata/site-alert.json`. Storybook and the reference site import the same
shipped fixture using Vite's `?raw` loader. Static components do not need
controller exports.

`src/styles/index.scss` forwards `_cods-layers.scss` first to declare
`uswds`, `cods.reset`, `cods.base`, `cods.components`, and `cods.utilities`
in that order. `_uswds-layer.scss` loads USWDS into `uswds`; the existing
Colorado color/typography overrides follow in that same layer. Component
partials emit their own `cods.components` rules, so normal component rules
override upstream CSS without raising specificity. Unlayered consumer styles
take precedence over normal layered rules; USWDS utilities using `!important`
cannot be overridden by normal declarations. Token values are unchanged.

### External Dependencies

The `@coloradodigitalservice/colorado-design-tokens` package is marked external and not bundled; consumers must install it separately.

### Cascade Layers

`src/styles/index.scss` forwards `_cods-layers.scss` first, which declares `@layer uswds, cods.reset, cods.base, cods.components, cods.utilities;`. USWDS is loaded into the `uswds` layer by `_uswds-layer.scss` after `uswds-theme` configures it, and the color/typography overrides follow it in the same layer, so they still lose to USWDS's higher-specificity variant, state, and `:visited` rules. Component rules go in `cods.components`, so they override USWDS without `!important`; consumer unlayered CSS overrides CoDS. USWDS utility classes use `!important` and cannot be overridden by normal declarations. The build sets `cssMinify: 'esbuild'` so the order statement stays first in `dist/colorado-design-system.css`. See [ADR-007](adrs/007-cascade-layer-order.md).

### USWDS JavaScript

Interactive Type A components import the single USWDS behavior they wrap (for example `@uswds/uswds/js/usa-accordion`), as decided in [ADR-006](adrs/006-uswds-javascript-ingestion.md). USWDS ships these as CommonJS; Vite bundles them into `colorado-design-system.mjs`, so consumers load one `<script type="module">` and need no CommonJS handling. `@uswds/uswds` is deliberately not external. To confirm a build, check that `dist/colorado-design-system.mjs` contains no `require(` and no `uswdsPresent`. The wrapper pattern is in [contract section 4.5](governance/component-contract.md#45-wrapping-uswds-javascript).

USWDS's CSS references fonts and icons by relative `url()`. `_uswds-theme.scss`
sets `$theme-font-path` and `$theme-image-path` to `./fonts` and `./img`.
The Vite asset plugin keeps the existing layout for required non-icon assets in
`dist/fonts` and `dist/img`. It excludes USWDS icon collections (USA, USWDS,
Material, and deprecated Material icons) and replaces CSS references to used
USWDS icons with equivalent Phosphor Regular SVGs under `dist/icons`. The
remaining non-icon image assets are copied unchanged. A CSS URL is externalized
only when its source exists. Component CSS masks can reference
`./icons/<id>.svg` directly: IDs in the full index and the explicit USWDS and
token-verified component variants are externalized for the shared icon
pipeline to write when referenced, and the final CSS check verifies those files
exist. An unrecognized URL into an excluded icon
collection fails the build instead of repackaging that icon. Expected warnings
disappear, and unknown non-icon references retain Vite's normal warnings.

In `writeBundle`, the plugin refreshes the copied directories, remaps icon URLs,
and parses the written CSS with CSS-tree to check every local URL. Missing files
fail the build with the stylesheet and asset path; root-relative and escaping paths also fail.
Remote/data URLs and fragment references are skipped. Source directories and
files are watched, and refreshing output prevents deleted sources from surviving
as stale assets. Tests cover validation, unexpected warnings, watch changes and
deletions, and font/icon loading in all three consumers.

## Design Tokens Package (`colorado-design-tokens`)

### Build System

The tokens package uses **Style Dictionary** to compile DTCG-formatted token definitions into consumable formats.

**Configuration**: `packages/colorado-design-tokens/scripts/build.mjs`

```bash
# Validate tokens
pnpm run -C packages/colorado-design-tokens tokens:validate

# Build tokens (updates generated/)
pnpm run -C packages/colorado-design-tokens build

# Validate and regenerate (compares with committed outputs)
pnpm tokens:check

# Build from workspace root
pnpm build  # Via Turbo
```

### Output Files

| File                     | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `generated/tokens.json`  | Flat value dictionary with all resolved tokens              |
| `generated/tokens.css`   | CSS custom properties (preserves var() references)          |
| `generated/tokens.d.ts`  | TypeScript type definitions for JSON values and token names |
| `generated/_tokens.scss` | Sass variables (resolves references to literals)            |

### Consumers

```typescript
// TypeScript/JSON
import tokens from '@coloradodigitalservice/colorado-design-tokens/tokens.json'
import type { TokenName } from '@coloradodigitalservice/colorado-design-tokens/types'

// Sass
@use '@coloradodigitalservice/colorado-design-tokens' as tokens
```

## Monorepo Build

### Workspace Root

```bash
# Full check (validation, lint, format, typecheck, test, build)
pnpm check

# Build all packages via Turbo
pnpm build

# Build dependencies in order
pnpm tokens:build   # Builds tokens first
pnpm build          # Builds everything; Turbo ensures tokens are cached/available
```

### Turbo Configuration

`turbo.json` defines:

- Build order: tokens build before design-system (tokens are an external dependency)
- Caching: `tokens:check` is uncached (validates drift); `build` output is cached in `.turbo/`
- Watch: `build:watch` is available for local development

## Component Development Workflow

1. Create component directory: `src/components/<component-name>/`
2. Write TypeScript controller (if interactive): `<component-name>.ts`
3. Export controller in `src/components/index.ts`
4. Run `pnpm run -C packages/colorado-design-system build:watch` during development
5. Forward the component Sass partial in `src/styles/index.scss`; fixture and
   metadata copying and subpath exports are automatic for all maturities.

## Vite Configuration Notes

- **Library mode**: Builds a single ESM bundle; no code-splitting
- **External dependencies**: Marked via `rollupOptions.external` to avoid bundling
- **Type declarations**: Generated by `vite-plugin-dts`; includes source maps for debugging
- **CSS handling**: Vite processes SCSS natively (Sass is installed as workspace dependency)
- **No source maps**: Set to `false` for smaller distribution files

## Dependency Alignment

Both build systems depend on consistent Node.js and tool versions:

| Dependency       | Version | Used By                       |
| ---------------- | ------- | ----------------------------- |
| Node.js          | 24.21.0 | All                           |
| Vite             | 8.3.0+  | colorado-design-system        |
| Style Dictionary | 5.5.5   | colorado-design-tokens        |
| Sass             | 1.104.1 | Both (Vite and build scripts) |
| TypeScript       | 6.0.2   | All                           |

Storybook and Astro configurations manage their own Vite instances; see their respective documentation for version alignment.

See [Foundation CI](CI.md) for path selection, browser checks, preview artifacts, and deployment prerequisites.

App validation tasks depend on shared package builds so Astro and Storybook
check the current exported controller declarations from a clean checkout.
The design-system build also copies the Accordion fixture and metadata into
`dist/fixtures/accordion.html` and `dist/metadata/accordion.json`; both are
available through declared package exports. Accordion controller exports share
the main ES module and do not require a separate USWDS runtime script.

## Local development orchestration

From the root, `pnpm dev` runs `turbo watch dev`, while `pnpm dev:web` and
`pnpm dev:storybook` filter to one app. The `dev` task is persistent and uncached;
`^build` completes dependency builds before starting the app. Astro and Storybook
keep their own dev servers running and detect changes in the built package
files. Turbo reruns finite dependency builds when their source inputs change,
covering copied assets as well as the Vite module graph.

The pinned Turbo version enables `futureFlags.watchUsingTaskInputs`. Token
build/validation inputs exclude `generated/**` so rebuilding tracked token
outputs does not trigger another build. Token outputs stay committed and are
still checked by `pnpm tokens:check` and the release pipeline.

Use ports 4321 (docs) and 6006 (Storybook); occupied ports fail explicitly.
Stop the current development command before starting another or running the
browser test suite, which owns these same ports. App source updates use the
framework's normal hot reload; shared package updates take a short rebuild.
No production server or new runtime dependency is introduced.

## Shared component fixtures (CODS-P2-003)

Site Alert and Accordion expose canonical fixtures, metadata, and generated
state/code samples through `./fixtures/<name>.html`, `./metadata/<name>.json`,
and `./examples/<name>.json`. The package build validates and discovers these
assets from component directories. See [shared fixtures](governance/shared-fixtures.md)
for source paths, runtime-state review flags, consumers, and drift checks.
