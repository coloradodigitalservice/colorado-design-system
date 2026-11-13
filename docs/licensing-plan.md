# Licensing Plan

Tracks CODS-P2-009 / Jira CDS-107. Do not publish packages or release archives containing assets whose redistribution rights are unresolved.

## Decisions and answers

| Item                                     | Status    | Answer / evidence                                                                                                                                                                                                                                                    |
| ---------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository and published-package license | Confirmed | Client approval reported by the project owner on 2026-10-12: MIT for the repository and both published packages.                                                                                                                                                     |
| Copyright holder and exact notice text   | Confirmed | Direction received: `Copyright © 2026 State of Colorado`.                                                                                                                                                                                                            |
| Contributions from Aten                  | Confirmed | No separate contributor agreement is required; Aten's contributions are covered under an existing contract.                                                                                                                                                          |
| Museo Slab redistribution                | Excluded  | On 2026-11-13 the project owner reported the client's inability to procure redistribution rights and request for consumer instructions, and approved optional consumer-supplied Museo Slab with the existing h1 fallback. No font binary or loading rule is shipped. |
| Third-party notice requirements          | Recorded  | Open Sans and Source Code Pro OFL texts, the pinned USWDS license map and Apache text, and Phosphor's MIT notice are included in package output. Museo Slab is excluded.                                                                                             |
| Logo ownership and redistribution        | Excluded  | No State logo artwork is tracked or bundled in this checkout. Rights must be confirmed before artwork is introduced; coordinate with CODS-P2-008. This is not a confirmation of trademark or redistribution rights.                                                  |

### USWDS font research

- The [USWDS 3.14.0 license](https://github.com/uswds/uswds/blob/v3.14.0/LICENSE.md) makes the distinction explicit: the rest of the project is CC0, while bundled Source Sans Pro, Merriweather, and Public Sans font files are under SIL OFL 1.1 and Roboto Mono font files are under Apache 2.0.
- The CoDS package copies non-icon USWDS image assets. USWDS icons, including Material Icons, are excluded and replaced with Phosphor Regular icons under MIT; the complete Phosphor notice ships in `dist/icons/LICENSE` and the sprite. The pinned USWDS license and full Apache text are retained in `dist/licenses/`; no USWDS font files are copied into the current CoDS package.
- USWDS therefore has explicit licenses for its font distribution; the fonts are not all covered by the project's general public-domain/CC0 status. Its file-specific license mapping is included with the USWDS assets CoDS redistributes.

### Open Sans and Source Code Pro research

- The project owner confirms Open Sans was downloaded from Google Fonts. Its [current Google Fonts license](https://github.com/google/fonts/blob/main/ofl/opensans/OFL.txt) is SIL OFL 1.1, copyright 2020 The Open Sans Project Authors; the exact license text is stored at [`OFL.txt`](../packages/colorado-design-system/src/assets/fonts/open-sans/OFL.txt). This supersedes the older Apache 2.0 statement in the ADR and task draft.
- Adobe's [Source Code Pro license](https://github.com/adobe-fonts/source-code-pro/blob/release/LICENSE.md) is SIL OFL 1.1, with copyright and reserved-name notices. Its complete license is stored at [the font asset](../packages/colorado-design-system/src/assets/fonts/source-code-pro/LICENSE.md); the existing asset-copy plugin recursively includes it in `dist/fonts/source-code-pro/`.
- USWDS 3.14.0 does not use Open Sans or Source Code Pro. It documents OFL for Source Sans Pro, Merriweather, and Public Sans, and Apache 2.0 for Roboto Mono (and Google Material Icons). Its approach is to document exceptions by asset, not to apply one font license to the whole project.

### Museo Slab decision and research

The client-directed approach is **no Museo Slab redistribution by CoDS**. The project owner approved optional consumer acquisition/self-hosting with the existing h1 fallback on 2026-11-13. `MuseoSlab-500.woff2` and its generated `@font-face` rule are removed. The unchanged stack is `Museo Slab`, `Trebuchet MS`, `Georgia`, `Times New Roman`, `serif`, at weight 500 for `.usa-prose > h1`. Family tokens retain the brand font name; no token value changes are needed.

The [Typography guide](../apps/web/src/content/docs/typography.md) directs consumers to the [foundry's Museo Slab page](https://www.exljbris.com/museoslab.html) and its authorized reseller links, to obtain their own weight-500 normal webfont with suitable domain/web-embedding rights, retain the acquisition record, and self-host outside CoDS. No download is performed by CoDS. The guide distinguishes web use from desktop use and package redistribution; it does not promise that a zero-price download grants any particular rights.

- The [exljbris EULA](https://exljbris.com/eula.html) says its free-font license applies to fonts downloaded directly from exljbris and prohibits distributing those font files without permission. Its standard-license excerpt also restricts embedding fonts in software products without a different license.
- For qualifying free fonts downloaded directly from exljbris, the EULA allows Font-Face embedding with a link to `www.exljbris.nl` on the page and/or this CSS comment near the `@font-face` declaration: `/* A font by Jos Buivenga (exljbris) -> www.exljbris.com */`. This attribution condition does not grant permission to redistribute the font file in a package.
- The previously considered third-party download listing did not establish redistribution permission. Consumer guidance now starts at the foundry, not that listing.
- Removing the tracked binary does not erase it from prior Git history or previously generated artifacts. Rebuild local outputs before packaging; do not redistribute historical artifacts containing it. Any cleanup of already-published releases requires a separately approved follow-up.

## License file organization

- Keep the root `LICENSE` as the extensionless, plain-text MIT license for CoDS; it does not need a `.md` extension and should not imply third-party fonts share MIT terms.
- Keep each font's copyright, reserved-name notice, and applicable license text beside its source asset. Keep USWDS's license mapping and Apache text under `src/assets/licenses/`; the asset-copy step carries those files into `dist/licenses/`, and the release builder archives all of `dist`. The `THIRD-PARTY-LICENSES.md` index maps assets to those texts. Do not treat a reference link or the root MIT `LICENSE` as a substitute for required license text.

## Follow-through

- The confirmed `license: MIT` metadata is set in both published package manifests.
- Update `LICENSE`, package metadata, README, and decision records if the client directs a copyright-holder or license change.
- Link the client decision from ADR-002 and ADR-003, and remove resolved licensing questions from those records.
- Rehearse packaging; inspect both package tarballs and the static archive layout for metadata, `LICENSE`, notices, and approved assets. The release builder requires a clean committed source; final manifest/checksum rehearsal waits for approval to commit. Do not bypass that gate.
- Keep staged artifacts free of assets with unresolved redistribution rights. Do not publicly publish until required rights are confirmed.

## Acceptance checklist

- [x] Client approval of MIT for the repository and both published packages recorded here.
- [x] Copyright holder and exact notice text confirmed and recorded.
- [x] Aten's contribution terms confirmed: covered under an existing contract; no separate agreement is required.
- [x] Source Code Pro's Adobe copyright/reserved-name notice and SIL OFL 1.1 text recorded beside the font.
- [x] Open Sans's Google Fonts source and SIL OFL 1.1 notice recorded beside the font.
- [x] Package dry-run confirms the Source Code Pro license file is present; the release builder copies all of `dist` into the release archive.
- [x] Package dry-run confirms Open Sans's OFL file is included; the release builder archives all of `dist`.
- [x] Package dry-run confirms the pinned USWDS license map and full Apache 2.0 text are retained; USWDS icons are excluded in favor of Phosphor.
- [x] Both package dry-runs include the package-root MIT `LICENSE` file.
- [x] Museo Slab is removed under the approved optional-consumer-font/existing-fallback decision; acquisition and setup instructions are provided.
- [x] Rebuilt package tarballs include the required notices and exclude Museo Slab and State logo artwork.
- [x] Both published package manifests declare MIT.
- [x] State logo artwork is not included; rights confirmation remains a prerequisite for adding it.
- [x] ADR-002 and ADR-003 link to the decision and contain no resolved open licensing questions.
- [ ] Final release rehearsal verifies manifests and archive contents against the confirmed decisions after commit approval.

## Validation on 2026-11-13

- `main` was merged into CODS-P2-009 with `--no-commit`; package-version and packaged-asset-test conflicts were resolved while retaining current icon handling and licensing notices. The merge commit is pending project-owner approval.
- Both packages are prepared at `0.2.24` using Changesets, without committing or publishing.
- Workspace checks, formatting, lint, typecheck, token drift checks, the complete workspace build, fixture-output checks, and static-consumer checks passed.
- All 13 packaged-asset integration tests passed. All 16 selected browser tests passed across Chromium, Firefox, WebKit, and Storybook, including the new guide's smoke/axe checks, bundled-font loading, absence of an automatic Museo Slab request, and optional consumer-font loading using an OFL font as a test probe.
- Interactive Firefox inspection at 320px verified the existing h1 family/weight, no Museo Slab face or request, no horizontal page overflow, and no console errors.
- Both `pnpm pack --dry-run --json` inventories and actual local tarballs were inspected: MIT metadata and package-root license texts match, core depends on tokens `0.2.24`, all font/USWDS/Phosphor notices are present, and no Museo Slab binary or loading rule is included. The optional family name remains in CSS and tokens. The USWDS generic `logo-img.png` placeholder is not State logo artwork.
- No commit, push, tag, publication, Jira update, or other outbound message was made. Full release-manifest/checksum/archive rehearsal remains pending an approved commit; the clean-source release gate was not bypassed.
