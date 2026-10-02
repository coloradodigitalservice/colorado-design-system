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

| File                         | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `colorado-design-system.mjs` | ESM bundle with all components and exports  |
| `colorado-design-system.css` | Compiled CSS from `src/styles/index.scss`   |
| `fonts/`, `img/`             | Fonts and USWDS icons the CSS references    |
| `index.d.ts`                 | TypeScript type declarations for main entry |
| `components/*.d.ts`          | Component-specific type declarations        |

### Package Exports

The package provides controlled subpath exports:

```typescript
// Main bundle (components + styles)
import { initComponentName } from '@coloradodigitalservice/colorado-design-system';

// Styles only
import '@coloradodigitalservice/colorado-design-system/styles';
```

Consumers must not rely on undeclared export paths. Per-component imports will be available when components are implemented.

### Entry Points

- **TypeScript source**: `src/index.ts` → `dist/colorado-design-system.mjs`
- **Styles**: `src/styles/index.scss` → `dist/colorado-design-system.css`
- **Components barrel**: `src/components/index.ts` (re-exports all component controllers)

### External Dependencies

The `@coloradodigitalservice/colorado-design-tokens` package is marked external and not bundled; consumers must install it separately.

### Cascade Layers

`src/styles/index.scss` forwards `_cods-layers.scss` first, which declares `@layer uswds, cods.reset, cods.base, cods.components, cods.utilities;`. USWDS is loaded into the `uswds` layer by `_uswds-layer.scss` after `uswds-theme` configures it, and the color/typography overrides follow it in the same layer, so they still lose to USWDS's higher-specificity variant, state, and `:visited` rules. Component rules go in `cods.components`, so they override USWDS without `!important`; consumer unlayered CSS overrides CoDS. USWDS utility classes use `!important` and cannot be overridden by normal declarations. The build sets `cssMinify: 'esbuild'` so the order statement stays first in `dist/colorado-design-system.css`. See [ADR-007](adrs/007-cascade-layer-order.md).

### USWDS JavaScript

Interactive Type A components import the single USWDS behavior they wrap (for example `@uswds/uswds/js/usa-accordion`), as decided in [ADR-006](adrs/006-uswds-javascript-ingestion.md). USWDS ships these as CommonJS; Vite bundles them into `colorado-design-system.mjs`, so consumers load one `<script type="module">` and need no CommonJS handling. `@uswds/uswds` is deliberately not external. To confirm a build, check that `dist/colorado-design-system.mjs` contains no `require(` and no `uswdsPresent`. The wrapper pattern is in [contract section 4.5](governance/component-contract.md#45-wrapping-uswds-javascript).

USWDS's CSS references icons by relative `url()`. `_uswds-theme.scss` sets `$theme-font-path` and `$theme-image-path` to `./fonts` and `./img`, and the Vite config copies those assets into `dist/` after the build. Vite warns that these paths "didn't resolve at build time"; this is expected, and they resolve at runtime from `dist/`.

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
5. Add subpath export to `package.json` once component is stable

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
