---
name: cods-component-stabilization
description: Promote an existing CoDS component from experimental to stable after human review and approval. Use when asked to stabilize a component or update its maturity, evidence, documentation, tests, and release preparation.
argument-hint: '<component-name>'
---

# CoDS component stabilization

Use this after component hardening and manual review, not as a substitute for
them. Accordion is the reference: its metadata, accessibility evidence, public
page, package README, and browser tests were updated together.

1. **Confirm readiness.** Read the component's metadata, evidence, docs, and
   tests, and check the [component contract](../../../docs/governance/component-contract.md#5-metadata-and-maturity-model).
   Confirm the contract criteria and required human accessibility and domain
   approvals are complete. An explicit user confirmation that all required
   human checks and approvals are complete may be recorded as verbal
   confirmation, with its date. Do not infer completion from automated tests,
   or treat a statement that testing is complete as approval. If any required
   check or approval is not confirmed, stop and ask.
2. **Update evidence.** Record the completed review and its known scope without
   inventing reviewer identities, observations, environments, or approvals.
   Resolve checklist items only when their completion is confirmed; preserve
   meaningful historical results. If a user confirms completion without
   supplying details, record the confirmation and date without fabricating
   those details. Do not publish private communications or inaccessible
   internal references.
   Stable evidence must pass the existing fixture validation: it rejects
   unchecked items, `pending`, and `not verified` anywhere in the file. Do not
   weaken that guard or hide unresolved findings to pass it.
3. **Promote consistently.** Set `maturity` to `stable` in the component's
   metadata. Search for component-specific experimental or review-in-progress
   language in documentation, package README, and tests; update stale status
   statements and assertions while preserving genuine limitations. Do not
   change the component API or unrelated components.
4. **Validate.** Run the component's unit tests, `tests/component-fixtures.test.ts`,
   `pnpm build`, and the affected web and Storybook browser specs, including
   the component's case in `web-shared-fixtures.spec.ts`. Keep web coverage in
   Chromium, Firefox, and WebKit. Run `pnpm lint`, `pnpm typecheck`,
   `pnpm format:check`, and `pnpm --filter @cods-internal/web validate`.
   Report exact results and any checks that could not run.
5. **Prepare the release.** Follow the [release workflow](../../../docs/RELEASE.md):
   a task-level package change needs a patch changeset and, before merge,
   `pnpm release:version` to consume it and update both fixed-group package
   versions and changelogs. Check for existing changesets first; versioning
   consumes all of them. Do not consume unrelated changesets without approval,
   or create a tag or publish a release as part of stabilization.
