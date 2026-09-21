---
name: create-cods-component
description: 'Scaffold a new Colorado Design System (CoDS) component that conforms to the canonical component contract. Use when creating, adding, or scaffolding a new cods- component, a static or interactive component directory under packages/colorado-design-system/src/components, or when asked to "add a component", "create a new component", or "scaffold a component" for CoDS.'
argument-hint: '<kebab-case-component-name> <static|interactive>'
---

# Create a CoDS Component

Scaffolds a new component directory under `packages/colorado-design-system/src/components/<name>/` that already satisfies the structural parts of the [canonical component contract](../../../docs/governance/component-contract.md) (CDS-27 / CODS-P1-004): directory layout, `cods-` naming, metadata shape, and — for interactive components — the controller lifecycle contract.

Scaffolding a component does **not** by itself finish it. Every TODO in the generated files must be resolved and every item in the contract's acceptance-criteria checklist (section 7) must be satisfied before the component can be considered contract-conformant.

## When to use

- The user asks to create, add, or scaffold a new CoDS component (static or interactive).
- The user names a component from the approved 1.0 inventory (Accordion, Card, Combo Box, Modal, Tag, Tooltip, etc.) and asks to start implementing it.
- The user asks "how do I add a component to this design system?"

## Procedure

1. Confirm the component name (kebab-case, e.g. `site-alert`) and whether it is `static` (no scripted behavior) or `interactive` (ships a TypeScript controller). If unsure, check whether the component has a USWDS equivalent listed in the [1.0 proposal](../../../docs/proposals/Colorado_Design_System_1.0_Proposal_2026-09-15.md) and pass its id via `--uswds`.
2. Run the scaffold script from the repository root:

   ```sh
   node .github/skills/create-cods-component/scripts/create-component.mjs \
     --name <kebab-case-name> \
     --type <static|interactive> \
     --display-name "<Human Readable Name>" \
     --uswds <uswds-component-id>   # omit entirely if there is no USWDS equivalent
   ```

   This creates `packages/colorado-design-system/src/components/<name>/` with:
   - `<name>.metadata.json` — pre-filled maturity/type/owners shape (contract section 5).
   - `<name>.fixture.html` — a starter semantic fixture with a `default` state block (contract section 2).
   - `<name>.scss` — a `cods.components`-layered partial using the token package (contract section 3).
   - `<name>.ts` and `<name>.test.ts` — interactive only: an `init`/`initAll`/`destroy` controller skeleton and matching Vitest smoke tests (contract section 4).
   - `accessibility/<name>.evidence.md` — the accessibility evidence checklist (contract section 6).

3. Replace every `TODO` in the generated files with the component's real markup, styles, behavior, and description.
4. Add one fixture block per documented state (default, focus, disabled, error, loading, empty, long-content, as applicable) — see contract section 2.
5. If the component is themed from a USWDS equivalent, follow the USWDS layering model described in the [1.0 proposal](../../../docs/proposals/Colorado_Design_System_1.0_Proposal_2026-09-15.md) rather than reimplementing the interaction pattern from scratch.
6. Complete the accessibility evidence file — do not leave checklist items blank.
7. Walk the [acceptance-criteria checklist](../../../docs/governance/component-contract.md#7-acceptance-criteria-checklist) before calling the component done, and run `pnpm check` from the repo root.

## Reference

- [Condensed contract checklist](./references/contract-checklist.md) — quick lookup without opening the full contract.
- [Full canonical component contract](../../../docs/governance/component-contract.md) — normative source; consult this for anything the checklist doesn't resolve.
- [Scaffold script](./scripts/create-component.mjs) — run with `--help` for argument details.
