# ADR-003: Self-hosted brand typography for the USWDS theme

- **Status:** Proposed for State technical-owner acceptance
- **Date:** 2026-09-23
- **Amends:** ADR-002 (Section 3, Theme Settings — typography)
- **Related work:** CODS-P1-015 (task implementation), PR #5 review feedback

## Context

ADR-002 established that USWDS's Sass settings (`@use "uswds-core" with (...)`) would carry Colorado's typography into the compiled CSS. PR review on CODS-P1-015 found that the compiled output still listed USWDS's own default fonts ("Source Sans Pro Web", "Merriweather Web", "Roboto Mono Web") ahead of Colorado's — they were only ever fallbacks, because `$theme-font-type-sans/-serif/-mono` (the settings that actually select the _named, displayed_ font) had been left at USWDS defaults.

Fixing that surfaced two further, unplanned findings that this ADR records:

1. **A real USWDS behavior, not a config mistake:** `$theme-font-weight-medium` and `$theme-font-weight-semibold` default to `false` in USWDS. Any font file registered at weight 500 or 600 is silently dropped from `@font-face` generation (no error) unless these are explicitly enabled. This affected Museo Slab (500) and Open Sans Medium/SemiBold (500/600).
2. **An architecture mismatch:** USWDS has one `$theme-font-role-heading` setting applied uniformly to h1–h6; it has no per-level family or weight setting. Colorado's design only uses Museo Slab for h1 (weight 500); h2–h6 use Open Sans (weight 600). Mapping the heading role to Museo Slab would have forced it — and a nonexistent 600 weight — onto h2–h6 as well.

These were resolved in-session (not pre-planned) while responding to review feedback, using actual font files supplied directly in chat rather than a pre-existing asset pipeline. This ADR records those decisions for traceability.

## Decision

### 1. Self-hosting over CDN

Open Sans and Source Code Pro are self-hosted as WOFF2 files in `packages/colorado-design-system/src/assets/fonts/`, copied into `dist/fonts/` by a Vite plugin (`vite.config.ts`), rather than loaded from a third-party CDN. This avoids a third-party network dependency and is consistent with typical `.gov` privacy/reliability practice.

**CODS-P2-009 amendment (2026-11-13):** The project owner reports that the client cannot procure Museo Slab redistribution rights and requests consumer download instructions instead. The project owner approved retaining the existing system-font fallback with optional consumer-supplied Museo Slab. Its binary and generated `@font-face` rule are removed; the family name and h1 weight remain unchanged. Consumers obtain their own suitable web-use license and self-host the provider's font files outside CoDS. See the [licensing decision](../licensing-plan.md) and [consumer setup guide](../../apps/web/src/content/docs/typography.md). CoDS performs no automatic download.

### 2. Font preparation

- Open Sans variable TTF/OTF source was downloaded from Google Fonts, as confirmed by the project owner; its current SIL OFL 1.1 text is retained beside the derived WOFF2 files. Original variable sources used for font instancing were removed from the working tree after conversion at the State's direction.
- Font files were originally instanced to the specific static weights Colorado's tokens use — 400/500/600 for Open Sans (roman + italic), 500 for Museo Slab (roman only), 400 for Source Code Pro (roman + italic) — then converted to WOFF2 using `fonttools` in an isolated virtual environment (no system Python changes, no new repo dependency). The Museo Slab derivative is now removed under CODS-P2-009.
- **Cap-height** values required by USWDS's custom-typeface-token registration were measured directly from the delivered font files (`OS/2.sCapHeight / unitsPerEm * 500px`), not estimated. This cross-checked against USWDS's own published value for Open Sans (357px measured vs. 357px in USWDS's built-in token), validating the method.
- Original variable-font source files were provided by the State and have since been removed from the working tree at the State's direction; only Open Sans and Source Code Pro derived WOFF2s are retained in the repository.

### 3. Font-weight settings

`$theme-font-weight-medium: 500` and `$theme-font-weight-semibold: 600` are explicitly enabled in `_uswds-theme.scss`. Without this, USWDS silently omits `@font-face` rules for any font registered at those weights.

### 4. Heading role architecture

`$theme-font-role-heading` is set to `'sans'` (Open Sans), matching the h2–h6 majority. Museo Slab at weight 500 is applied only to `h1` via a dedicated override file, `_cods-typography-overrides.scss`, in the same `uswds` layer as USWDS and forwarded after it (see ADR-007; same pattern as the existing color-override layer in ADR-002). This is a necessary workaround for USWDS's lack of a per-heading-level family/weight setting — not a preference.

### 5. Trebuchet MS as system fallback only

Trebuchet MS is used as a fallback in the sans and serif stacks but is **not self-hosted**. It is a proprietary Microsoft font not licensed for redistribution as a webfont; it is included only as a system-font fallback string, relying on it being pre-installed on Windows.

### 6. Museo Slab weight limitation

Museo Slab is used only at weight 500 in current mocks. Colorado's token set defines a 600 weight for headings generally, but no 600/700 Museo Slab is currently needed. Consumers opting in supply their own licensed weight-500 normal webfont; CoDS ships none.

## Consequences

### Benefits

1. Compiled CSS now names the correct fonts as primary (not USWDS defaults with Colorado fonts as afterthought fallbacks).
2. Bundled Open Sans and Source Code Pro weights produce real `@font-face` rules (previously silently missing for Open Sans 500/600). Museo Slab deliberately produces no font request.
3. No third-party font CDN dependency; consistent with USWDS's own self-hosting model.
4. Cap-height and other metrics are measured from source-of-truth files rather than guessed, consistent with the "no guesswork" precedent set for color tokens.

### Costs & risks

1. **Licensing custody:** Open Sans and Source Code Pro copyright notices and SIL OFL 1.1 texts are stored beside their derived WOFF2 files. Museo Slab is excluded from the repository and release artifacts; consumers retain their own web-use acquisition record and comply with the applicable license. See the [CODS-P2-009 licensing plan](../licensing-plan.md).
2. **Fallback metrics:** h1 uses its existing system-font stack without consumer-supplied Museo Slab. Consumers must check long headings, narrow widths, and zoom with both their chosen font and fallback. Additional Museo Slab weights would require separate consumer acquisition and a design decision.
3. **Figma verification gap:** Figma MCP access hit a seat-tier rate limit during this work, so exact typography values were taken from Colorado's existing token package rather than cross-checked live against Figma. Should be spot-checked once access allows.
4. **USWDS upgrade risk:** the `$theme-font-weight-*` defaulting-to-`false` behavior is undocumented in the settings table's plain-language description (it's implied by the default value, not called out as a gotcha). A future USWDS upgrade could change this default; the upgrade-review checklist (`docs/governance/USWDS-UPGRADE-POLICY.md`) should include a font-weight regression check.

## Alternatives considered

### A1. CDN-hosted fonts (e.g., Google Fonts)

- **Pros:** No binaries in the repo; automatic browser caching across sites using the same CDN.
- **Cons:** Museo Slab is not available on any font CDN (commercial, foundry-distributed only), so this wasn't a full solution regardless; introduces a third-party network dependency atypical for self-hosted `.gov` design systems.
- **Decision:** Rejected in favor of self-hosting, consistent with USWDS's own approach.

### A2. Substitute an open-source slab serif for Museo Slab (VA's approach with Bitter)

- **Pros:** Removes the commercial-license question entirely; precedented by design.va.gov's own choice to use an open-source Google Font instead of a proprietary serif.
- **Cons:** Colorado's Figma source specifies Museo Slab as the brand heading font; substituting it is a brand decision outside engineering's authority to make unilaterally.
- **Decision:** Not adopted without explicit design-owner sign-off; flagged as context, not acted on.

### A3. Map `$theme-font-role-heading` to Museo Slab for all headings

- **Pros:** Simpler configuration; one setting instead of a role + override file.
- **Cons:** Contradicts the actual design (h2–h6 use Open Sans) and would require a nonexistent Museo Slab 600 weight.
- **Decision:** Rejected; see Decision Section 4.

## Governance & approval

- **Responsible:** Aten technical lead and design-system engineer
- **Accountable:** State technical owner
- **Consulted:** State design owner (Museo Slab brand requirement, Figma source of truth), legal/procurement (Museo Slab webfont license confirmation)
- **Informed:** Component contributors, product owner

## Open questions

**Q: Should Museo Slab support additional weights (600/700)?**
A: Not per current design mocks, which use it only at 500. If a future design need arises, a new font file and a corresponding ADR/decision-log update would be required.

**Q: Are the typography values (sizes, weights, line-heights) fully verified against Figma?**
A: Values used match Colorado's existing token package (`@coloradodigitalservice/colorado-design-tokens`), which predates this task. Direct Figma verification was blocked by an MCP rate limit and should be revisited once access is available.
