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

Colorado's three brand fonts (Open Sans, Museo Slab, Source Code Pro) are self-hosted as WOFF2 files in `packages/colorado-design-system/src/assets/fonts/`, copied into `dist/fonts/` by a Vite plugin (`vite.config.ts`), rather than loaded from a third-party CDN (e.g., Google Fonts). This avoids a third-party network dependency and is consistent with typical `.gov` privacy/reliability practice, and matches how USWDS self-hosts its own default fonts.

### 2. Font preparation

- Source files (variable TTF/OTF, provided directly by the State) were instanced to the specific static weights Colorado's tokens use — 400/500/600 for Open Sans (roman + italic), 500 for Museo Slab (roman only), 400 for Source Code Pro (roman + italic) — then converted to WOFF2, using `fonttools` in an isolated virtual environment (no system Python changes, no new repo dependency).
- **Cap-height** values required by USWDS's custom-typeface-token registration were measured directly from the delivered font files (`OS/2.sCapHeight / unitsPerEm * 500px`), not estimated. This cross-checked against USWDS's own published value for Open Sans (357px measured vs. 357px in USWDS's built-in token), validating the method.
- Original variable-font source files were provided by the State and have since been removed from the working tree at the State's direction; only the derived WOFF2s are retained in the repository.

### 3. Font-weight settings

`$theme-font-weight-medium: 500` and `$theme-font-weight-semibold: 600` are explicitly enabled in `_uswds-theme.scss`. Without this, USWDS silently omits `@font-face` rules for any font registered at those weights.

### 4. Heading role architecture

`$theme-font-role-heading` is set to `'sans'` (Open Sans), matching the h2–h6 majority. Museo Slab at weight 500 is applied only to `h1` via a dedicated override file, `_cods-typography-overrides.scss`, forwarded after `uswds` in `index.scss` (same pattern as the existing color-override layer in ADR-002). This is a necessary workaround for USWDS's lack of a per-heading-level family/weight setting — not a preference.

### 5. Trebuchet MS as system fallback only

Trebuchet MS is used as a fallback in the sans and serif stacks but is **not self-hosted**. It is a proprietary Microsoft font not licensed for redistribution as a webfont; it is included only as a system-font fallback string, relying on it being pre-installed on Windows.

### 6. Museo Slab weight limitation

Only a weight-500 Museo Slab file was provided. Colorado's token set defines a 600 weight for headings generally, but per design-mock review, Museo Slab itself is only used at 500 in current mocks — no 600/700 Museo Slab file exists or is currently needed.

## Consequences

### Benefits

1. Compiled CSS now names the correct fonts as primary (not USWDS defaults with Colorado fonts as afterthought fallbacks).
2. All font weights Colorado's tokens actually reference now produce real `@font-face` rules (previously silently missing for 500/600).
3. No third-party font CDN dependency; consistent with USWDS's own self-hosting model.
4. Cap-height and other metrics are measured from source-of-truth files rather than guessed, consistent with the "no guesswork" precedent set for color tokens.

### Costs & risks

1. **Licensing custody:** the repository now contains a Museo Slab binary. Open Sans (Apache 2.0) and Source Code Pro (SIL OFL) are unambiguously fine to redistribute; Museo Slab is a commercial font (exljbris/FontSpring), and this ADR does **not** independently verify that Colorado/Aten holds a webfont license permitting redistribution in this repository — see Open Questions.
2. **No bold Museo Slab:** if a future design calls for Museo Slab at 600/700, a new font file is required; none exists today.
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

**Q: Is there a confirmed webfont license for Museo Slab permitting its inclusion in this repository?**
A: Not yet verified as part of this work. This must be confirmed by Colorado/Aten legal or procurement before this ADR is accepted, and the license reference should be recorded in the font's asset directory or this ADR.

**Q: Should Museo Slab support additional weights (600/700)?**
A: Not per current design mocks, which use it only at 500. If a future design need arises, a new font file and a corresponding ADR/decision-log update would be required.

**Q: Are the typography values (sizes, weights, line-heights) fully verified against Figma?**
A: Values used match Colorado's existing token package (`@coloradodigitalservice/colorado-design-tokens`), which predates this task. Direct Figma verification was blocked by an MCP rate limit and should be revisited once access is available.

## Acceptance criteria

- [ ] Museo Slab webfont license confirmed and referenced.
- [ ] State design owner confirms Museo Slab (weight 500 only) matches current brand requirements.
- [ ] Figma typography values spot-checked once MCP access allows.
- [ ] This ADR is signed by the State technical owner and Aten technical lead.
