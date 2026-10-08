# @coloradodigitalservice/colorado-design-system

## 0.1.5

### Patch Changes

- 4d94782: Add GitHub Pages deployment workflow to automatically build and deploy the reference site (`apps/web`) to GitHub Pages on pushes to `main` and manual workflow dispatch.
- Updated dependencies [4d94782]
  - @coloradodigitalservice/colorado-design-tokens@0.1.5

## 0.1.4

### Patch Changes

- 31ab558: Add the `/styles.css` stylesheet export and retain `/styles` as a compatibility
  alias to the same built CSS file. Update repository imports and documentation
  to prefer `/styles.css`, removing the dedicated ambient declarations in the
  web and Storybook apps.
- @coloradodigitalservice/colorado-design-tokens@0.1.4

## 0.1.3

### Patch Changes

- 3f21b23: Validate copied fonts and images while preserving their
  filenames, bytes, and relative CSS URLs. Eliminate expected unresolved-asset
  warnings and fail builds when a stylesheet references a missing packaged file,
  including during watch rebuilds.
- @coloradodigitalservice/colorado-design-tokens@0.1.3

## 0.1.2

### Patch Changes

- 33507e6: Document the Site Alert and Accordion vertical-slice components on the Astro docs site, with component summaries, anatomy, accessibility guidance, known limitations, Figma links, and development-release install instructions.
- 5a52cd3: Release 0.1.2
- Updated dependencies [33507e6]
- Updated dependencies [5a52cd3]
  - @coloradodigitalservice/colorado-design-tokens@0.1.2

## 0.1.1

### Patch Changes

- f1a0604: Generate shared state examples from canonical fixtures and metadata; validate component metadata and detect drift across packaged assets, Storybook, documentation, and the static consumer.
- @coloradodigitalservice/colorado-design-tokens@0.1.1

## 0.1.0

### Minor Changes

- Complete Phase 1: workspace and package foundations, design tokens, USWDS theming and cascade layers, documentation and Storybook foundations, automated validation, and tag-driven release artifacts. Phase 2 Site Alert and Accordion implementations are not included.

### Patch Changes

- Updated dependencies
  - @coloradodigitalservice/colorado-design-tokens@0.1.0
