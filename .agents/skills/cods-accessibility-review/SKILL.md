---
name: cods-accessibility-review
description: Review a CoDS component's accessibility and record the evidence file. Use when asked to review, audit, or complete accessibility evidence for a component; to run axe, keyboard, focus, zoom/reflow, reduced-motion, forced-colors, or localization checks; or before a component moves from experimental to stable. Prepares evidence only; screen-reader findings and stable sign-off belong to people.
argument-hint: '<component-name>'
---

# CoDS accessibility review

Produces the evidence required by [contract section 6](../../../docs/governance/component-contract.md#6-accessibility-localization-and-evidence-requirements) in `packages/colorado-design-system/src/components/<name>/accessibility/<name>.evidence.md`. The checklist itself lives in the [governance template](../../../docs/governance/templates/accessibility-evidence-template.md); this skill supplies the procedure and does not copy it.

## Rules for the agent

- **Screen-reader results come from a person.** Never write an observed announcement you did not hear. Leave those items unchecked and list them under "Open items" as needing a human reviewer with a named screen reader and browser pairing.
- **Check a box only for a check you ran and that passed.** Add a short note: how it was checked, in which browsers, and when. An unrun or failed check stays `[ ]`. Write `N/A — <reason>` only when the item genuinely does not apply.
- **Chromium, Firefox, and WebKit must all pass** before the evidence counts as complete. If one cannot be run, leave the item unchecked and list that browser under "Open items".
- **Never mark a component `stable`** or change `maturity`. Stable requires an evidence file with no open items, reviewed by the State accessibility owner ([RACI](../../../docs/governance/ownership-and-raci.md)).
- **Do not hide findings.** No broad axe exclusions or disabled rules; any exception needs an explicit, reviewed rationale ([tests/README.md](../../../tests/README.md#extend-the-foundation)).
- Automated scans and the contrast-pair checks supplement manual review; they do not replace it.

## Procedure

1. **Gather inputs.** Read the component's `metadata.json` (states, `localization`, `progressiveEnhancement`), fixture, controller, and existing evidence file. Confirm a Storybook story exists; if not, the component is not ready for review.
2. **Automated pass.** Run the Storybook axe suite and triage results: [automated checks](./references/automated-checks.md).
3. **Interactive pass.** Inspect the built story with the Playwright CLI for keyboard order, focus visibility and obscuration, reduced motion, forced colors, 320px reflow, and long or right-to-left content: [manual and emulated checks](./references/manual-checks.md). Use the [browser verification skill](../cods-browser-verification/SKILL.md) for the build and preview setup.
4. **Fix or report.** Fix defects that are within the component's own files. Report anything that needs a token, design, or contract decision instead of patching around it; use the [token change skill](../cods-token-change/SKILL.md) for token gaps.
5. **Record the evidence.** Update the evidence file item by item following the rules above. Fill the accessible-name table, list the keyboard interactions, and put every unresolved or human-only item under "Open items".
6. **Turn findings into tests.** Promote repeatable defects into `tests/browser/storybook-<name>.spec.ts`, importing the shared fixture.
7. **Hand off.** Summarize in the PR: automated result, checks run and not run, open items, and the people needed (accessibility owner; a screen-reader tester). Run `pnpm check` before calling the work done.

## Reference

- [Automated checks](./references/automated-checks.md)
- [Manual and emulated checks](./references/manual-checks.md)
- [Token README accessibility section](../../../packages/colorado-design-tokens/README.md#accessibility-and-troubleshooting): what the 16 contrast pairs do and do not establish.
