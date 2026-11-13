# Third-Party License Notices

The CoDS software license is in the package-root `LICENSE`; it does not replace the terms for bundled third-party assets.

## Font assets

- **Source Code Pro:** Adobe's copyright and Reserved Font Name `Source` notice, along with the SIL Open Font License 1.1, are in [`../fonts/source-code-pro/LICENSE.md`](../fonts/source-code-pro/LICENSE.md).
- **Open Sans:** The project owner confirms the source was downloaded from Google Fonts. The current Google Fonts license is SIL OFL 1.1; its copyright notice and full license text are in [`../fonts/open-sans/OFL.txt`](../fonts/open-sans/OFL.txt). Do not sell the font by itself, and keep the OFL notice with distributed font files.
- **Museo Slab (not bundled):** The client-directed approach is consumer acquisition and self-hosting, not redistribution by CoDS. The h1 stack retains `Museo Slab`, followed by `Trebuchet MS`, `Georgia`, `Times New Roman`, and `serif`; no Museo Slab font file or `@font-face` rule is shipped. To opt in, start at the [foundry's Museo Slab page](https://www.exljbris.com/museoslab.html), obtain Museo Slab 500 normal with a license permitting web embedding on your domains, and host the provider's webfont files in your own site. Declare family `Museo Slab`, style `normal`, weight `500` in your own `@font-face` CSS. Retain your acquisition record and comply with the supplied license, including any attribution. A free desktop download or the CoDS MIT license does not establish web-use or package redistribution rights.

## USWDS assets

This package includes non-icon image assets from USWDS 3.14.0. The USWDS license record is in [`USWDS-LICENSE.md`](USWDS-LICENSE.md). It identifies Google Material Icons as Apache 2.0; the full license text is retained in [`Apache-2.0.txt`](Apache-2.0.txt). USWDS icons are replaced with Phosphor assets and excluded from package output. USWDS's other asset and public-domain notices are documented in its license file. USWDS font files are not copied into this package's `dist/fonts`; CoDS's self-hosted font assets are listed above.

## Phosphor icons

Phosphor Regular icons are MIT licensed; the complete notice is included in [`../icons/LICENSE`](../icons/LICENSE) and in the sprite. Keep that notice with redistributed icons.

## State marks

No State logo artwork is bundled in this package. The CoDS MIT license does not grant trademark rights; confirm ownership and redistribution terms before adding State marks.
