---
title: Typography
description: Use the bundled fonts and optionally supply your own licensed Museo Slab webfont.
navLabel: Typography
order: 2
---

CoDS bundles Open Sans (body text and h2–h6) and Source Code Pro (code), together with their SIL Open Font License 1.1 notices. Keep the `fonts/` directory beside the compiled stylesheet when serving the static release.

## Optional Museo Slab headings

Museo Slab 500 is the brand font for h1. **CoDS does not include or download Museo Slab.** Without a consumer-supplied font, the existing h1 stack uses Trebuchet MS, Georgia, Times New Roman, or the browser's serif font, depending on availability. Heading family tokens retain the brand font name; they do not load a font file.

### Obtain your own webfont

1. Start at the [foundry's Museo Slab page](https://www.exljbris.com/museoslab.html) and follow its authorized reseller links. The foundry lists Fontspring as its preferred reseller and a webfont provider. Choose **Museo Slab 500, normal/roman**, not Museo or Museo Sans.
2. Obtain a license that permits `@font-face` web embedding on your site's domains and download the webfont kit from that provider. A free desktop download does not by itself establish web-use rights; price, availability, formats, attribution, and permitted use depend on the license supplied with your download. Retain the license and acquisition record.
3. Use the provider's webfont files and CSS instructions. Prefer a supplied WOFF2 file; do not convert a desktop font unless your license expressly permits it. Host the file in your consuming site's own asset directory, outside the CoDS package. Do not copy it into this repository, npm packages, or shared release archives.
4. Declare the family as `Museo Slab`, with normal style and weight `500`, so CoDS's existing h1 stack picks it up. Adjust the example URL to the file you actually obtained:

```css
/* A font by Jos Buivenga (exljbris) -> www.exljbris.com */
@font-face {
  font-family: 'Museo Slab';
  src: url('/fonts/museo-slab-500.woff2') format('woff2');
  font-style: normal;
  font-weight: 500;
  font-display: swap;
}
```

Keep any attribution required by your actual license. The [foundry EULA](https://www.exljbris.com/eula.html) requires a foundry link and/or the comment shown above for its qualifying free-font `@font-face` use. That agreement is source-specific, and the attribution does **not** grant package redistribution rights or replace your provider's license.

### Verify the integration

Use an h1 inside `.usa-prose`, the selector carrying CoDS's heading treatment. Confirm in browser developer tools that your site's font request succeeds and its rendered font is Museo Slab at weight 500. Block that request and confirm the fallback remains readable. Check long headings at narrow widths and 400% zoom: the fallback's metrics differ from Museo Slab. No heading-selector override or CoDS rebuild is needed.

If you cannot obtain suitable web-use rights, leave Museo Slab unconfigured and use the existing fallback. CoDS's MIT license does not license Museo Slab, other third-party fonts, or State trademarks.
