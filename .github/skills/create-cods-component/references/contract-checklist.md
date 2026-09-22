# Condensed Component Contract Checklist

Quick-reference summary of [docs/governance/component-contract.md](../../../../docs/governance/component-contract.md). When in doubt, the full contract is authoritative.

## Directory

- `packages/colorado-design-system/src/components/<name>/`, one component per directory, no cross-component imports.

## Naming (`cods-` prefix, everywhere)

- Block: `.cods-<name>` · Element: `.cods-<name>__<element>` · Modifier: `.cods-<name>--<modifier>`
- Custom property: `--cods-<name>-<purpose>`
- Controller-only hook: `data-cods-<name>-*` (never styled directly)
- Event: `cods-<name>:<event-name>`, dispatched with `bubbles: true`, payload in `event.detail`

## CSS

- Lives in the `cods.components` layer only.
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
- `progressiveEnhancement`, `localization`: see contract section 5 for allowed values.

## Accessibility evidence (`accessibility/<name>.evidence.md`)

Required at `experimental` and above: keyboard, focus, naming/roles, screen reader pairing, zoom/reflow at 400%, `prefers-reduced-motion`, forced-colors, localization notes. No blank items.

## Before calling a component done

- [ ] All contract sections 2-6 satisfied.
- [ ] Metadata consistent with fixture/controller.
- [ ] `pnpm check` passes from the repo root.
