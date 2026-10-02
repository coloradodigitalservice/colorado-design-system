---
name: create-cods-component
description: 'Scaffold a new Colorado Design System (CoDS) component that conforms to the canonical component contract. Use when creating, adding, or scaffolding a new cods- component, a static or interactive component directory under packages/colorado-design-system/src/components, or when asked to "add a component", "create a new component", or "scaffold a component" for CoDS.'
argument-hint: '<kebab-case-component-name> <static|interactive> [A|B|C]'
---

# Create a CoDS Component

Scaffolds a new component directory under `packages/colorado-design-system/src/components/<name>/` that already satisfies the structural parts of the [canonical component contract](../../../docs/governance/component-contract.md) (CDS-27 / CODS-P1-004): directory layout, `cods-` naming, metadata shape, and — for interactive components — the controller lifecycle contract.

Scaffolding a component does **not** by itself finish it. Every TODO in the generated files must be resolved and every item in the contract's acceptance-criteria checklist (section 7) must be satisfied before the component can be considered contract-conformant.

## When to use

- The user asks to create, add, or scaffold a new CoDS component (static or interactive).
- The user names a component from the approved 1.0 inventory (Accordion, Card, Combo Box, Modal, Tag, Tooltip, etc.) and asks to start implementing it.
- The user asks "how do I add a component to this design system?"

## Procedure

1. Confirm the component name (kebab-case, e.g. `site-alert`) and whether it is `static` (no scripted behavior) or `interactive` (ships a TypeScript controller). Look the component up in the [ownership matrix](../../../docs/governance/component-ownership-matrix.md) to get its type (A themed USWDS, B CoDS-authored, C divergent) and USWDS id.
2. Run the scaffold script from the repository root:

   ```sh
   node .agents/skills/create-cods-component/scripts/create-component.mjs \
     --name <kebab-case-name> \
     --type <static|interactive> \
     --display-name "<Human Readable Name>" \
     --uswds <uswds-component-id> \
     --component-type <A|B|C>
   ```

   Omit `--uswds` when there is no USWDS equivalent. `--component-type` defaults to `A` with `--uswds` and `B` without. The script creates `packages/colorado-design-system/src/components/<name>/` with:
   - `<name>.metadata.json`: pre-filled shape, including the ownership-matrix fields `componentType`, `uswdsVersion` (read from the pinned dependency), `divergenceApproved`, and `divergenceNotes`.
   - `<name>.fixture.html`: a starter semantic fixture with a `default` state block (contract section 2).
   - `<name>.scss`: a `cods.components`-layered partial using the token package (contract section 3).
   - `<name>.ts` and `<name>.test.ts`: interactive only; an `init`/`initAll`/`destroy` controller skeleton and Vitest smoke tests (contract section 4). The controller's exports are also added to `src/components/index.ts`.
   - `accessibility/<name>.evidence.md`: generated from the [governance evidence template](../../../docs/governance/templates/accessibility-evidence-template.md), so the checklist cannot drift (contract section 6).

   It also writes `apps/storybook/src/stories/<name>.stories.ts`, which renders the component's own fixture and Sass.

3. Replace every `TODO` with the component's real markup, styles, behavior, and description.
4. Add one fixture block per documented state (default, focus, disabled, error, loading, empty, long-content, as applicable) and list them in `metadata.json`.
5. For type A or C, follow [themed USWDS components](./references/uswds-wrapper.md) before writing markup, styles, or behavior: keep `usa-*` classes and add `cods-*` alongside, and use USWDS's own JavaScript rather than reimplementing it. For an interactive one, replace the generated controller with a thin wrapper over the USWDS behavior ([contract section 4.5](../../../docs/governance/component-contract.md#45-wrapping-uswds-javascript)).
6. Need a color, spacing, or other value with no token? Stop and use the [token change skill](../cods-token-change/SKILL.md). Never hard-code it.
7. Work through the [registration and handoff checklist](./references/registration-checklist.md): the parts the script does not automate (Sass registration, browser specs, package export).
8. Complete the accessibility evidence with the [accessibility review skill](../cods-accessibility-review/SKILL.md). Do not leave items blank, and do not mark the component `stable`.
9. Walk the [acceptance-criteria checklist](../../../docs/governance/component-contract.md#7-acceptance-criteria-checklist) and run `pnpm check` from the repo root.

## Reference

- [Condensed contract checklist](./references/contract-checklist.md) — quick lookup without opening the full contract.
- [Registration and handoff checklist](./references/registration-checklist.md) — what the script does not do: exports, story, browser specs, and metadata steps.
- [Themed USWDS components](./references/uswds-wrapper.md) — type A and C workflow, including how to wrap a USWDS behavior in a controller.
- [Full canonical component contract](../../../docs/governance/component-contract.md) — normative source; consult this for anything the checklist doesn't resolve.
- [Scaffold script](./scripts/create-component.mjs) — run with `--help` for argument details.
