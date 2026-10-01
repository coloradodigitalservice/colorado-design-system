# Condensed Component Contract Checklist

Quick-reference summary of [docs/governance/component-contract.md](../../../../docs/governance/component-contract.md). When in doubt, the full contract is authoritative.

## Directory

- `packages/colorado-design-system/src/components/<name>/`, one component per directory, no cross-component imports.

## Naming (`cods-` prefix, everywhere)

- Block: `.cods-<name>` · Element: `.cods-<name>__<element>` · Modifier: `.cods-<name>--<modifier>`
- Themed USWDS components (type A/C): keep the `usa-*` classes and add the `cods-*` classes alongside them; never replace or rename USWDS classes ([details](./uswds-wrapper.md#decisions-and-follow-ups)).
- Custom property: `--cods-<name>-<purpose>`
- Controller-only hook: `data-cods-<name>-*` (never styled directly)
- Event: `cods-<name>:<event-name>`, dispatched with `bubbles: true`, payload in `event.detail`

## CSS

- Lives in the `cods.components` layer only. Exception until CODS-P1-018 lands: a type A override of a `.usa-*` rule must be unlayered, because USWDS is unlayered (see [uswds-wrapper.md](./uswds-wrapper.md)).
- Uses tokens from `@coloradodigitalservice/colorado-design-tokens`; no hard-coded values that already have a token.

## Controller lifecycle (interactive only)

- `init(root)`: find elements by `data-cods-*`, attach listeners, read initial state from markup. Idempotent. Warns (never throws) if required elements are missing.
- `destroy(root)`: removes everything `init` added; safe to call without a prior `init`.
- No global state, no dependency on a bundler beyond a plain ES module.

## Progressive enhancement

- Markup + CSS alone deliver the core purpose. JS only enhances.
- `progressiveEnhancement: "none"` in metadata requires a documented exception.

## Metadata (`<name>.metadata.json`)

- `maturity`: `experimental` | `stable` | `deprecated` — `stable` requires completed accessibility evidence and every acceptance-criteria item satisfied.
- `type`: `static` | `interactive`
- `uswdsEquivalent`: USWDS id or `null`
- `uswdsVersion`, `componentType` (`A` themed USWDS, `B` CoDS-authored, `C` divergent), `divergenceApproved`, `divergenceNotes`, and `owners.consulted`/`owners.informed` come from the [ownership matrix](../../../../docs/governance/component-ownership-matrix.md#component-metadata-schema). Contract section 5 does not list them yet; the scaffold follows the matrix.
- `progressiveEnhancement`, `localization`: see contract section 5 for allowed values.

## Accessibility evidence (`accessibility/<name>.evidence.md`)

Required at `experimental` and above: keyboard, focus, naming/roles, screen reader pairing, zoom/reflow at 400%, `prefers-reduced-motion`, forced-colors, localization notes. No blank items.

## Before calling a component done

- [ ] All contract sections 2-6 satisfied.
- [ ] Metadata consistent with fixture/controller.
- [ ] `pnpm check` passes from the repo root.
