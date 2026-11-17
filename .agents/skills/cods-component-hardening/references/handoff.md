# Evidence and handoff templates

## Evidence section

Add at the top of `accessibility/<name>.evidence.md`, below the header bullets.

```markdown
## CODS-P4-0xx hardening — YYYY-MM-DD

Developer first pass for Phase 4 (CDS-nnn). Manual QA, State domain acceptance,
and client sign-off are pending; this section records only the content and
test-audit work and its automated results.

### Documentation page

<What the page now contains, what was removed, and which fixture states the
preview shows. Note that the status makes no conformance claim.>

### Test audit

| Area | Before | After |
| ---- | ------ | ----- |

Decisions:

- **Moved:** …
- **Consolidated:** …
- **Removed as duplicates:** …
- **Kept:** …

### Automated results

<Exact commands and pass counts, the base commit, and any browser that could
not run locally.>

### Manual matrix for Aten Accessibility/QA (pending)

Review all supported variants and states on the PR preview and in Storybook.
Record browser, assistive technology, and versions for each result.

- [ ] <ticket focus check 1>
- [ ] …
- [ ] Contrast, 400% zoom / 320px reflow, narrow screens.
- [ ] Reduced motion, forced colors.
- [ ] Internal localization and long-text notes.
```

## PR description

```markdown
Developer pass for CODS-P4-0xx / CDS-nnn: <Component> content, test audit, and
evidence prep. Ready for Aten Accessibility/QA on the Netlify preview. Do not
merge until QA, State domain acceptance, and client sign-off are recorded.

## Page content

## Test audit

## Validation

## Open items
```

## Jira handoff comment

Post a short, plain-language update on the component's Jira ticket so the QA
reviewer can start without reading the PR. Keep it to a few lines: what
changed, where to look, and what to check. Detailed results stay in the PR
and the evidence file. Wait for the Netlify deploy preview to finish so the
link works, and post only after the user approves.

```markdown
Ready for QA. The <Component> page now follows the new component page layout
(preview, code, status, guidance, specifications), and its tests were cleaned
up (<before> → <after> browser test runs, no coverage lost).

- Preview: https://deploy-preview-<pr>--coloradodesignsystem.netlify.app/<name>/
- PR: <url>

Please run the manual checklist in `<name>.evidence.md` (<two or three of the
ticket's focus checks>). Open question for Design: <if any>.
```

Add a Storybook link for all states once hosted Storybook previews exist (CDS-160); until then QA can run it locally with `pnpm dev:storybook`. Reassign the ticket to the QA reviewer only if the user asks.
