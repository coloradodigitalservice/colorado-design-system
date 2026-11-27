---
name: cods-component-hardening
description: Harden an existing CoDS component for Phase 4 release readiness (CODS-P4-011 to CODS-P4-037). Use when asked to finalize a component's content, tests, and evidence; to restructure its Astro docs page to the CoDS Website Content outline; to audit its tests; or to prepare the handoff to Aten Accessibility/QA. Accordion (CODS-P4-011) is the reference implementation.
argument-hint: '<component-name> <CODS-P4-0xx>'
---

# CoDS component hardening

The developer first pass on a Phase 4 hardening ticket. The shared requirements live in Jira CDS-85 ("Component content and hardening handoff"); each component ticket (CDS-125 to CDS-151) adds component-specific QA focus checks. Read both before starting. This skill gives the procedure that worked for Accordion; follow the ticket where they differ.

## Rules for the agent

- **Content comes from sources, not invention.** The page outline comes from the CoDS Website Content document. Component copy comes from the Phase 3 ticket's Figma link and the existing page. If Figma copy is not available, reuse the existing reviewed guidance and list "confirm against Figma" as an open item. Do not invent design rules or do's and don'ts.
- **Status must be evidence-backed.** Never write "passed WCAG 2.2" or any conformance claim. State what automated checks pass and that manual review is pending, until a person records otherwise.
- **Do not change the component contract.** No new variants, classes, custom properties, API, or metadata maturity changes in this first pass. Fix in-scope defects only. After required human approval, use the separate [stabilization skill](../cods-component-stabilization/SKILL.md).
- **Never weaken a test or drop browser coverage to make it pass or to reduce the count.** Storybook runs in Chromium only; web specs run in three browsers. Moving, merging, or parameterizing is fine when every assertion survives. Keeping every test with a reason is a valid audit result.
- **Screen-reader results and sign-off come from people.** Prepare the manual matrix; leave it unchecked.
- **No release steps.** Do not run changesets, `release:version`, or tags. The `repository` release-readiness check is expected to fail on these PRs.
- Branch is the canonical ticket ID, for example `CODS-P4-013`. Branch from the latest `main` once the shared page components are merged (they arrived with CODS-P4-011); until then, branch from `CODS-P4-011`.

## Procedure

1. **Gather inputs.** Read the Jira ticket and CDS-85, the component's `metadata.json`, fixture, existing `apps/web/src/content/docs/<name>.md`, `<Name>Examples.astro`, how `apps/web/src/pages/[...slug].astro` renders it, the evidence file, and every test that mentions the component (`grep -rli <name> tests packages/colorado-design-system/src apps/storybook/src`). Record baseline test counts (step 4) before editing.
2. **Restructure the page** to the [page outline](./references/page-outline.md):
   - Render the Overview with the shared `ComponentPreview.astro` (curated fixture states and exact code) and `ComponentStatus.astro` (maturity, `accessibilityStatus` frontmatter, USWDS basis, links). Wire them in `[...slug].astro` and remove the component from the `ComponentSummary` list.
   - Rewrite the markdown as `## Guidance` and `## Specifications` with the `###` sections from the outline.
   - Remove the examples catalogue and public localization/RTL guidance. Those fixture states stay in Storybook and the tests.
   - Verify every class, attribute, function, and custom property against the source (`<name>.scss`, `<name>.ts`, metadata).
3. **Build and look.** `pnpm build` (the docs output check verifies curated previews against the fixture), then check the page in the browser at desktop and 320px.
4. **Audit the tests** using the [test audit guide](./references/test-audit.md). Record before/after counts and a keep/consolidate/remove reason for each change.
5. **Record evidence.** Add a dated `## CODS-P4-0xx hardening — <date>` section at the top of the evidence file using the [evidence and handoff templates](./references/handoff.md), including the pending manual QA matrix built from the ticket's focus checks.
6. **Verify.** Run the component's unit tests, `pnpm build`, the affected browser specs (including the shared per-component specs), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm --filter @cods-internal/web validate`. Record exact results. If a browser cannot launch locally, say so and rely on CI for it.
7. **Hand off.** Push and write the PR description. Once the Netlify deploy preview is live, draft the short "ready for review and handoff" update for the Jira ticket from the [templates](./references/handoff.md), with the preview link. If the ticket is assigned to Eric Swanson, reassign it to Phil (Philip Stier). Ask the user before marking the PR ready, posting to Jira, or reassigning.

## Reference

- [Page outline](./references/page-outline.md): the content document's structure, the Button example, and reviewer comments.
- [Test audit guide](./references/test-audit.md): what to keep, move, merge, or remove, and the shared specs that cover every component.
- [Evidence and handoff templates](./references/handoff.md): the evidence section, PR description, and Jira comment.
- Accordion reference: `apps/web/src/content/docs/accordion.md`, `apps/web/src/components/AccordionExamples.astro`, `tests/browser/web-accordion.spec.ts`, and the CODS-P4-011 section of `accordion.evidence.md`.
