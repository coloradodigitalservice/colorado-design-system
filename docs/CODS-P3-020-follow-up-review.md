# CODS-P3-020: follow-up review

Temporary review notes for the updated Divider pull request. No feedback has
been posted as part of this review.

## Review basis

- [PR #78](https://github.com/coloradodigitalservice/colorado-design-system/pull/78)
  at head `a463d268f3b7c5e85d22763c375fefb05d04e8e8`
- Current `main` at review time:
  `b6dbed751de5763afd7f3540a72d24e0fa2c07aa`
- The prior review comment and the reviewer's decisions from the preceding
  discussion.

## Status against the feedback

| Feedback                          | Status                                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Merge conflicts and release       | Conflicts are resolved and prior release history is preserved, but the new patch release is not prepared; see item 1. |
| Figma terminology and spacing     | Addressed: the documentation names Section Divider and Item Divider and gives the requested token names and values.   |
| Figma, source, and evidence links | Added, with no USWDS equivalent; source and evidence links currently return 404 before merge. See item 2.             |
| Human accessibility review        | Still open and recorded in the evidence and PR. The reviewer previously decided this follow-up must not block the PR. |

### 1. Release readiness still blocks the PR

**Status:** Confirmed blocker. The reviewer will prepare the package version
on the branch before merge.

- Current `main` has moved to the already-released
  [v0.2.12](https://github.com/coloradodigitalservice/colorado-design-system/releases/tag/v0.2.12).
  Both packages on this branch also remain at `0.2.12`.
- The [Divider changeset](../.changeset/divider.md) is still pending, and the
  Divider entries for the next release have not been generated.
- Running `node scripts/check-release-readiness.mjs origin/main` with the pinned
  Node version reports both the pending changeset and the missing version bump.
  The current [CI run](https://github.com/coloradodigitalservice/colorado-design-system/actions/runs/41695657751)
  fails its repository and aggregate Foundation checks for the same reason.
- The merge conflicts have been resolved, and the existing `0.2.10`, `0.2.11`,
  and `0.2.12` changelog history is retained.

**Reviewer decision:** The reviewer owns preparing the next available
task-level patch for both packages and will do so when ready. Do not ask Eric
to prepare it. The next version would be `0.2.13` if `main` has not advanced
again; the required checks must pass before merge.

### 2. Source and evidence links return 404 before merge

**Status:** Confirmed preview limitation. The reviewer accepts the existing
links and does not request additional feedback.

- The new [summary](../apps/web/src/components/ComponentSummary.astro) links to
  the Figma design, source, and evidence and correctly states that Divider has no
  USWDS equivalent.
- It follows the existing shared-summary convention of linking to `main`.
  The Divider source and evidence do not yet exist on `main`, so both links
  currently return HTTP 404. The corresponding URLs on `CODS-P3-020` return
  HTTP 200.
- The links are expected to work after this PR merges. The
  [Divider browser test](../tests/browser/web-divider.spec.ts) verifies the
  link attributes, not the HTTP responses.

**Reviewer decision:** Accept the temporary preview limitation; the links are
expected to work after merge.

### 3. Firefox evidence is older than the latest automated results

**Status:** Updated locally at the reviewer's request.

- The [evidence file](../packages/colorado-design-system/src/components/divider/accessibility/divider.evidence.md)
  records the October 29 local Firefox launch failure.
- The current PR description reports a subsequent local Firefox run with a
  temporary-home workaround. Hosted CI also passed the web suite in its Chromium,
  Firefox, and WebKit projects on the reviewed head.
- Those automated results do not complete the pending human screen-reader,
  actual zoom/reflow, or operating-system forced-colors checks.

**Reviewer decision:** Update the evidence locally before preparing the
release. The evidence now records the successful automated Firefox results,
while keeping the human checks open and noting that the earlier local profile
issue was not verified as repaired.

## Verification

- Hosted CI for this head reports **200 unit tests**, **471 web browser tests**,
  and **382 Storybook tests** passed. Its repository and Foundation checks
  failed as described in item 1.
- The release-readiness failure was independently reproduced locally with Node
  `24.21.0`. Source and evidence link responses were checked directly.
- No local browser suite or new manual accessibility test was run.

## Draft follow-up to Eric

No additional feedback is currently needed: the reviewer will prepare the
release, accepts the temporary preview-link limitation, and updated the Firefox
evidence locally. Nothing has been posted.
