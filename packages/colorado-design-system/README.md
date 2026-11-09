# Core design system

This package owns semantic HTML fixtures, layered CSS, optional TypeScript controllers, metadata, icons, assets, and accessibility evidence for components. It depends on the token package and on a pinned USWDS release ([ADR-002](../../docs/adrs/002-uswds-foundational-dependency.md)). Every component in this package must follow the [canonical component contract](../../docs/governance/component-contract.md).

## Build & Development

### Building the package

The design system uses [Vite](https://vitejs.dev/) in library mode to compile TypeScript components and Sass/CSS into distributable ESM and CSS bundles.

```bash
# One-time production build
pnpm run build

# Watch mode for development
pnpm run build:watch
```

### Build outputs

After running `pnpm run build`, the `dist/` directory contains:

- **`colorado-design-system.mjs`** – ESM bundle with all component controllers and exports
- **`colorado-design-system.css`** – Compiled CSS from `src/styles/index.scss`
- **`index.d.ts`** – TypeScript type declarations for the main entry point
- **`components/*.d.ts`** – Type declarations for individual components (as they are added)

### Adding a new component

1. Create a component directory under `src/components/<component-name>/`:

   ```
   src/components/<component-name>/
   ├── <component-name>.metadata.json
   ├── <component-name>.fixture.html
   ├── <component-name>.scss
   ├── <component-name>.ts              (if interactive)
   └── accessibility/
       └── <component-name>.evidence.md
   ```

2. For interactive components, export the controller in `src/components/<component-name>/<component-name>.ts`:

   ```typescript
   export function init(root: HTMLElement) {
     // Initialize component
   }

   export function destroy(root: HTMLElement) {
     // Clean up
   }
   ```

3. Add an export in `src/components/index.ts`:

   ```typescript
   export {
     init as initComponentName,
     destroy as destroyComponentName,
   } from './component-name/component-name.js';
   ```

4. Forward the component Sass partial in `src/styles/index.scss`. The build
   automatically copies every component's fixture and metadata, and wildcard
   exports expose `./fixtures/<name>.html` and `./metadata/<name>.json` for all
   maturities. The reserved `shared/` directory is skipped; missing either asset
   in a component directory fails the build. No export entry is needed for each
   component. Controller functions are exported from the main bundle.

### Package exports

The package provides several export patterns for consumers:

```typescript
// Main bundle with all components
import { initComponentName } from '@coloradodigitalservice/colorado-design-system';

// Styles
import '@coloradodigitalservice/colorado-design-system/styles.css';
```

Fixtures and metadata are exported through `./fixtures/*.html` and
`./metadata/*.json`, including experimental components. Consult the metadata
for maturity; an exported path does not imply stability. Per-component
controller subpaths are not exported.

### Site Alert (experimental)

The first static vertical slice is `cods-site-alert`, a themed USWDS Site Alert.
Load the package stylesheet and use the canonical fixture structure. It requires
no JavaScript controller. Package exports include `./fixtures/site-alert.html`
and `./metadata/site-alert.json`; both are copied from component source at build
time. Public usage and customization are documented in
[`apps/web/src/content/docs/site-alert.md`](../../apps/web/src/content/docs/site-alert.md).
Accessibility review status is recorded beside the component in
`src/components/site-alert/accessibility/site-alert.evidence.md`.

USWDS CSS and its Colorado brand overrides are emitted together in `uswds`.
The layer order is `uswds`, `cods.reset`, `cods.base`, `cods.components`,
then `cods.utilities`. CoDS component rules live in `cods.components`, so normal
rules override upstream styles without raising selector specificity. Consumers
may use `cods.utilities` for their own overrides. Unlayered consumer CSS takes
precedence over normal layered rules. USWDS utilities using `!important` cannot
be overridden by normal declarations.

## Accordion (experimental)

CODS-P2-002 selects Accordion as the interactive vertical slice. Import
`initAccordion`, `initAllAccordions`, `destroyAccordion`, and
`setAccordionExpanded` from the package root. Its USWDS toggle behavior is
bundled; consumers do not need a second runtime script. Import the compiled
stylesheet from `@coloradodigitalservice/colorado-design-system/styles.css`.
The extensionless `/styles` path remains a compatibility alias for the same
built stylesheet; prefer `/styles.css` for new imports.

Canonical HTML and metadata are exported as `./fixtures/accordion.html` and
`./metadata/accordion.json`. The reference page at `/accordion/` documents
markup, initial state, keyboard behavior, configuration, and
`cods-accordion:change` events. Storybook's `Components/Accordion` stories use
the same fixture. See
[accessibility evidence](src/components/accordion/accessibility/accordion.evidence.md)
for automated coverage and outstanding manual/G2 review.

## Icon (experimental)

The package and static release ship the complete Regular sprite and an ID-only
index from the pinned `@phosphor-icons/core` development dependency. Browse
[Phosphor Icons](https://phosphoricons.com/); an available ID is not a blanket
design or accessibility approval. The index records source, version, license,
weight, and the SHA-256 of the **full** sprite, without categories or per-icon
metadata. `icons/sprite.svg`, `icons/catalog.json`, and `icons/LICENSE` are
exported. The sprite also embeds the MIT notice so generated subsets retain it.

Maintainers update the exact Phosphor pin and lockfile, run `pnpm icons:build`
from the repository root, and commit `generated/icons/sprite.svg` and
`catalog.json`. Never edit those outputs by hand. `pnpm icons:check` compares
both with the pinned source and runs before the package build. There is no
per-icon approval list to update.

### Select a sprite in Vite

```js
import { codsIcons } from '@coloradodigitalservice/colorado-design-system/icons/vite';

export default { plugins: [codsIcons()] };
```

In the module rendering an icon, import the sprite URL and use a literal ID:

```js
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';

const iconHref = `${spriteUrl}#house`;
```

Use the resulting URL in `<use href>`. The plugin scans Vite-loaded modules
and HTML entrypoints, including imported CoDS fixtures and examples, validates
recognized IDs, and emits a content-hashed subset in production. It rewrites
canonical URLs in HTML entrypoints; an imported fixture's
`/icons/sprite.svg` URL must instead be replaced with `spriteUrl` by its
consumer. Canonical URLs embedded directly in JavaScript, TypeScript, Astro,
Vue, or Svelte modules fail with a source location rather than producing a
broken URL; use the imported sprite URL there. Stylesheets must use standalone
CSS icons rather than canonical sprite URLs. Development serves the full
sprite. Supported source references are
literal `/icons/sprite.svg#<id>` URLs, literal fragments after the directly
imported URL, and a simple conditional with two literal IDs. A recognized
unresolved expression fails in subset mode. The plugin does not interpret
arbitrary program execution, follow external data, or validate unrecognized
reference syntax.

If IDs are only known at runtime, deliberately use
`codsIcons({ mode: 'full' })` and validate them against
`@coloradodigitalservice/colorado-design-system/icons/catalog.json` in your
application. Native `<use>` renders an unknown fragment blank; the full sprite
alone does not throw. Serve the sprite on the same origin when possible:
cross-origin external SVG `<use>` is not guaranteed even with CORS headers.

### Static and other build pipelines

The package's `cods-icons` command works without Vite or Phosphor installed:

```sh
pnpm exec cods-icons --input ./src --output ./public/icons/sprite.svg
```

Repeat `--input` for additional files or directories. The command scans
supported text source files, not the import graph; include any rendered package
fixtures or scan generated HTML. Use `--validate` instead of `--output` to
check recognized references without writing. Use `--full` with `--output`
only when runtime IDs require the complete sprite; validate those IDs in the
application. A zero-build consumer can copy the full `icons/` directory, but
native `<use>` cannot report an invalid fragment.

The package ships standalone SVGs only for its compiled CSS. To generate
additional files for literal CSS `url(./icons/<id>.svg)` references, add
`--css-output ./public/icons`. The command also writes
`PHOSPHOR-LICENSE` there. It does not remove previously generated files; use a
dedicated build-output directory and clean it as part of the consuming build.
The normal sprite and CSS-mask SVGs use `currentColor`; an image or CSS
background cannot inherit it, whereas a CSS mask can use the element's color.
The package's fixed-color variants preserve USWDS or token-verified component
foregrounds and are not a general theming mechanism.

Use SVG `<use>` references with `focusable="false"`. Decorative icons use
`aria-hidden="true"`; meaningful standalone SVGs need an accessible name.
The 16px and 24px size modifiers preserve the square aspect ratio.
`cods-icon--mirror-in-rtl` is opt-in for logical interface flow only. See the
[Icon page](../../apps/web/src/content/docs/icon.md) for sizing, contrast,
localization, and accessible usage.

Keep the Phosphor MIT notice when redistributing icons. Phosphor and Phosphor
Icons identify the upstream project and do not imply affiliation or
endorsement; their name and branding are not CoDS marks.

## Shared examples

Fixtures, metadata, and generated per-state examples are available through
`./fixtures/*.html`, `./metadata/*.json`, and `./examples/*.json`. The package
build validates canonical source and generates samples for Astro, Storybook,
and the static HTML consumer. See [the shared fixture workflow](../../docs/governance/shared-fixtures.md)
for state mappings, runtime review instructions, and drift checks.
