# Third-Party License Notices

The CoDS software license is in the package-root `LICENSE`; it does not replace the terms for bundled third-party assets.

## Font assets

- **Source Code Pro:** Adobe's copyright and Reserved Font Name `Source` notice, along with the SIL Open Font License 1.1, are in [`../fonts/source-code-pro/LICENSE.md`](../fonts/source-code-pro/LICENSE.md).
- **Open Sans:** The project owner confirms the source was downloaded from Google Fonts. The current Google Fonts license is SIL OFL 1.1; its copyright notice and full license text are in [`../fonts/open-sans/OFL.txt`](../fonts/open-sans/OFL.txt). Do not sell the font by itself, and keep the OFL notice with distributed font files.
- **Museo Slab:** The applicable acquisition license and package redistribution permission have not been confirmed. Do not distribute this font in a release until the license or written permission is recorded, or the client approves a fallback.

## USWDS assets

This package includes image assets from USWDS 3.14.0. The USWDS license record is in [`USWDS-LICENSE.md`](USWDS-LICENSE.md). It identifies Google Material Icons as Apache 2.0; the full license text is in [`Apache-2.0.txt`](Apache-2.0.txt). USWDS's other asset and public-domain notices are documented in its license file. USWDS font files are not copied into this package's `dist/fonts`; CoDS's self-hosted font assets are listed above.

**Release gate:** Museo Slab remains in the current build output without a confirmed redistribution license. Do not publish or distribute package/release artifacts containing it until its rights are verified or the asset is excluded under an approved decision.
