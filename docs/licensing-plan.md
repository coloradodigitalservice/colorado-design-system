# Licensing Plan

Tracks CODS-P2-009 / Jira CDS-107. Do not publish packages or release archives containing assets whose redistribution rights are unresolved.

## Decisions and answers

| Item                                     | Status    | Answer / evidence                                                                                                                                                                 |
| ---------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository and published-package license | Confirmed | Client approval reported by the project owner on 2026-10-12: MIT for the repository and both published packages.                                                                  |
| Copyright holder and exact notice text   | Confirmed | Direction received: `Copyright © 2026 State of Colorado`.                                                                                                                         |
| Contributions from Aten                  | Confirmed | No separate contributor agreement is required; Aten's contributions are covered under an existing contract.                                                                       |
| Museo Slab redistribution                | Open      | The project owner does not yet have the license record for the repository's font file; permission to redistribute it to package consumers remains unverified. See research below. |
| Third-party notice requirements          | Open      | Open Sans, Source Code Pro, and USWDS license texts are included in package output. Museo Slab's redistribution terms remain unresolved; see research below.                      |
| Logo ownership and redistribution        | Open      | Confirm terms with the client brand owner before including logos in packages or archives; coordinate with CODS-P2-008.                                                            |

### USWDS font research

- The [USWDS 3.14.0 license](https://github.com/uswds/uswds/blob/v3.14.0/LICENSE.md) makes the distinction explicit: the rest of the project is CC0, while bundled Source Sans Pro, Merriweather, and Public Sans font files are under SIL OFL 1.1 and Roboto Mono font files are under Apache 2.0.
- The CoDS package copies USWDS image assets, including Material Icons, which USWDS licenses under Apache 2.0. The pinned USWDS license and full Apache text are included in `dist/licenses/`; no USWDS font files are copied into the current CoDS package.
- USWDS therefore has explicit licenses for its font distribution; the fonts are not all covered by the project's general public-domain/CC0 status. Its file-specific license mapping is included with the USWDS assets CoDS redistributes.

### Open Sans and Source Code Pro research

- The project owner confirms Open Sans was downloaded from Google Fonts. Its [current Google Fonts license](https://github.com/google/fonts/blob/main/ofl/opensans/OFL.txt) is SIL OFL 1.1, copyright 2020 The Open Sans Project Authors; the exact license text is stored at [`OFL.txt`](../packages/colorado-design-system/src/assets/fonts/open-sans/OFL.txt). This supersedes the older Apache 2.0 statement in the ADR and task draft.
- Adobe's [Source Code Pro license](https://github.com/adobe-fonts/source-code-pro/blob/release/LICENSE.md) is SIL OFL 1.1, with copyright and reserved-name notices. Its complete license is stored at [the font asset](../packages/colorado-design-system/src/assets/fonts/source-code-pro/LICENSE.md); the existing asset-copy plugin recursively includes it in `dist/fonts/source-code-pro/`.
- USWDS 3.14.0 does not use Open Sans or Source Code Pro. It documents OFL for Source Sans Pro, Merriweather, and Public Sans, and Apache 2.0 for Roboto Mono (and Google Material Icons). Its approach is to document exceptions by asset, not to apply one font license to the whole project.

### Museo Slab research

- The [exljbris EULA](https://exljbris.com/eula.html) says its free-font license applies to fonts downloaded directly from exljbris and prohibits distributing those font files without permission. Its standard-license excerpt also restricts embedding fonts in software products without a different license.
- For qualifying free fonts downloaded directly from exljbris, the EULA allows Font-Face embedding with a link to `www.exljbris.nl` on the page and/or this CSS comment near the `@font-face` declaration: `/* A font by Jos Buivenga (exljbris) -> www.exljbris.com */`. This attribution condition does not grant permission to redistribute the font file in a package.
- The [font.download listing](https://font.download/font/museo-slab-500) provides a copyright attribution but does not show a license grant in the page's license field.
- The repository contains `MuseoSlab-500.woff2`, but the project owner does not yet have its license record. Obtain the applicable license or written redistribution permission; otherwise use a client-approved fallback. Keep the font out of package and release artifacts until resolved.

## License file organization

- Keep the root `LICENSE` as the extensionless, plain-text MIT license for CoDS; it does not need a `.md` extension and should not imply third-party fonts share MIT terms.
- Keep each font's copyright, reserved-name notice, and applicable license text beside its source asset. Keep USWDS's license mapping and Apache text under `src/assets/licenses/`; the asset-copy step carries those files into `dist/licenses/`, and the release builder archives all of `dist`. The `THIRD-PARTY-LICENSES.md` index maps assets to those texts. Do not treat a reference link or the root MIT `LICENSE` as a substitute for required license text.

## Follow-through

- The confirmed `license: MIT` metadata is set in both published package manifests.
- Update `LICENSE`, package metadata, README, and decision records if the client directs a copyright-holder or license change.
- Link the client decision from ADR-002 and ADR-003, and remove resolved licensing questions from those records.
- Rehearse packaging; inspect both `pnpm pack --dry-run` outputs and the release archive for metadata, `LICENSE`, notices, and approved assets.
- Keep staged artifacts free of assets with unresolved redistribution rights. Do not publicly publish until required rights are confirmed.

## Acceptance checklist

- [x] Client approval of MIT for the repository and both published packages recorded here.
- [x] Copyright holder and exact notice text confirmed and recorded.
- [x] Aten's contribution terms confirmed: covered under an existing contract; no separate agreement is required.
- [x] Source Code Pro's Adobe copyright/reserved-name notice and SIL OFL 1.1 text recorded beside the font.
- [x] Open Sans's Google Fonts source and SIL OFL 1.1 notice recorded beside the font.
- [x] Package dry-run confirms the Source Code Pro license file is present; the release builder copies all of `dist` into the release archive.
- [x] Package dry-run confirms Open Sans's OFL file is included; the release builder archives all of `dist`.
- [x] Package dry-run confirms the pinned USWDS license map and full Apache 2.0 text for bundled Material Icons are present.
- [x] Both package dry-runs include the package-root MIT `LICENSE` file.
- [ ] Museo Slab redistribution basis and required notice confirmed, or an approved fallback recorded.
- [ ] Every bundled asset has confirmed redistribution rights and required notices in package and release artifacts; Museo Slab and logo terms remain open.
- [x] Both published package manifests declare MIT.
- [ ] Logo redistribution terms recorded before logos are included in package or archive.
- [ ] ADR-002 and ADR-003 link to the decision and contain no resolved open licensing questions.
- [ ] Release rehearsal verifies manifests and archive contents against the confirmed decisions.
