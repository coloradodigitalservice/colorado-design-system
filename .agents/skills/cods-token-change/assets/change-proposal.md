# Token change proposal: `<token-name>`

Paste into the pull-request description. Delete lines that do not apply; do not leave blanks.

## Change

- **Action:** add | rename | remove | re-alias
- **Token(s):** `<category.name>` (CSS `--cods-<category>-<name>`, Sass `$<category>-<name>`)
- **Source file:** primitives | semantic | supplemental | foundations
- **Value / alias:** `{color.co-...}` or the literal and its unit
- **Need:** which component or foundation requires it, and why no existing token fits (list tokens considered)
- **Design source:** Figma variable and library version, workbook row, or design reference. Git is authoritative; Figma alone is not a token change.

## Impact

- **Consumers found** (paths, from the alias-impact search):
- **Tokens that alias this one:**
- **Public name change (breaking in `0.0.x`):** yes | no
- **Contrast:** pair(s) added to `references/contrast-pairs.json`, with ratios against the real surfaces, or why none are needed
- **Reference files updated:** `references/mapping.md` | `references/design-values.json` (design-reviewed only) | README

## Verification

- [ ] `pnpm tokens:validate`
- [ ] `pnpm tokens:build`, with sources and all four generated files committed together
- [ ] `pnpm tokens:check`
- [ ] `pnpm check`

## Reviewers requested

- [ ] Aten design lead (responsible)
- [ ] State design owner (accountable)
- [ ] Accessibility lead (color, contrast, or focus changes)
- [ ] Aten technical lead (naming, generated output)
