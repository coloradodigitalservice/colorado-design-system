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

Post on the component ticket after the user approves:

```markdown
**Developer pass complete: content/web and test audit** (handoff to Aten Accessibility/QA)

- PR: <url> (commit `<sha>`)
- Preview: https://deploy-preview-<pr>--coloradodesignsystem.netlify.app/<name>/

**Content** …
**Test audit** <table>
**Results** …
**Open items** …
**Next owner:** Aten Accessibility/QA.
```
