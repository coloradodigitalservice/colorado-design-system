# USWDS Upgrade & Security Policy

**Status:** Draft for G1 approval  
**Related work:** CODS-P1-015 — Integrate USWDS as the foundational dependency  
**Effective:** Phase 1.0 (candidate)  
**Last updated:** 2026-09-22

## Executive Summary

The Colorado Design System pins a specific version of @uswds/uswds and follows a structured review and upgrade process. This policy balances security, accessibility, and stability to ensure CoDS remains current, secure, and aligned with federal design system best practices while minimizing disruption to consuming projects.

## 1. Version Pinning

**Current pinned version:** `@uswds/uswds@3.14.0`  
**Pinning strategy:** Exact semantic version in `package.json`:

```json
{
  "dependencies": {
    "@uswds/uswds": "3.14.0"
  }
}
```

**Rationale:**

- Exact pinning ensures reproducible builds across all environments.
- Prevents unexpected breaking changes in USWDS minor or patch releases.
- All CoDS development and testing is validated against the pinned version.
- Security and accessibility reviews are conducted against this specific version snapshot.

**Caret versioning is not used** (e.g., `^3.14.0`) to avoid implicit updates that could introduce unvetted changes.

## 2. Upgrade Review Cycle

USWDS releases are monitored on a **quarterly review schedule** (Jan, Apr, Jul, Oct). The following process applies to all version changes:

### 2.1 Screening Phase (Week 1 of review quarter)

**Responsibility:** Aten technical lead  
**Tasks:**

1. Check USWDS release notes and changelog since last pinned version.
2. Identify security advisories, accessibility fixes, and new features.
3. Assess impact on CoDS Type A components (those reusing USWDS markup).
4. Flag any breaking changes in USWDS Sass APIs or CSS class names.

**Outcome:** Decision matrix:

- **Critical security/accessibility fix** → Fast-track to approval phase (see 2.3).
- **Feature addition or non-breaking enhancement** → Standard review (see 2.2).
- **Breaking change or major refactor** → Requires Architecture Decision Record (ADR) amendment.
- **No relevant changes** → Defer to next quarter.

### 2.2 Standard Review Phase (Weeks 1–3)

**Responsibility:** Aten technical lead + State technical owner  
**Tasks:**

1. **Aten:** Create a test branch pinning the new USWDS version.
2. **Aten:** Build and test the colorado-design-system package:
   - Confirm Sass compilation succeeds with new USWDS load paths.
   - Run existing Vitest unit tests.
   - Verify generated CSS output reflects CoDS tokens correctly.
3. **Aten:** Run visual regression tests on all Type A components:
   - Compare before/after screenshots with new USWDS version.
   - Document any visual shifts or behavioral changes.
4. **State technical owner:** Review change summary and test results.
5. **State accessibility lead:** Confirm USWDS accessibility baseline still applies.
6. **Decision:** Approve, defer, or reject the upgrade.

**Timeline:** 2–3 weeks

### 2.3 Security Fast-Track Phase

**Responsibility:** Aten technical lead + State technical owner (urgent)  
**Trigger:** Critical security vulnerability or accessibility regression in the current USWDS version.

**Tasks:**

1. **Aten:** Assess severity and CoDS exposure (does the vulnerability affect a Type A component in CoDS's dependency chain?).
2. **Aten:** Create a test branch and verify the fix resolves the vulnerability.
3. **Aten:** Run regression tests (see 2.2 tasks).
4. **State technical owner:** Approve the upgrade (expedited, may bypass full quarterly review).
5. **Publish:** Upgrade the pinned version, publish a patch or minor release of CoDS.

**Timeline:** 1–5 business days (depending on severity and testing scope)

### 2.4 Approval & Publication Phase (Weeks 3–4)

**Responsibility:** Aten technical lead + State technical owner  
**Prerequisites:**

- Screening phase completed and decision made (not deferred or rejected).
- Standard or security review tests passed.
- No new issues introduced.

**Tasks:**

1. **Aten:** Merge test branch into main; update `package.json` to new pinned version.
2. **Aten:** Run full CI/CD pipeline (build, lint, test, visual regression).
3. **Aten:** Update CHANGELOG.md with USWDS version change and any notable updates.
4. **Aten:** Publish a CoDS release (patch or minor, as appropriate).
5. **State technical owner:** Approve release.
6. **Communication:** Notify component contributors and consuming projects of the USWDS upgrade (via release notes, email).

**Timeline:** 1 week

## 3. Security Vulnerability Response

**Out-of-cycle security patches** supersede the quarterly schedule:

### 3.1 USWDS Security Advisory

If a critical vulnerability is disclosed in USWDS:

1. **Monitor:** Aten technical lead monitors USWDS release notes and npm security advisories.
2. **Assess:** Determine CoDS exposure and severity (exploitable in CoDS context?).
3. **Fast-track:** If critical, follow the fast-track approval process (2.3) immediately.
4. **Publish:** CoDS publishes a patch or minor release with the updated USWDS version.
5. **Alert:** Notify all consuming projects and request they upgrade CoDS.

**Target resolution time:** Within 48 hours of USWDS security advisory publication.

### 3.2 CoDS-Specific Security Issues

If a vulnerability exists in CoDS's own code (unrelated to USWDS):

- Follow standard CoDS release process.
- No special USWDS considerations required.

## 4. Accessibility Review & Conformance

Every USWDS upgrade must be validated for accessibility impact:

### 4.1 Review Criteria

**State accessibility lead** reviews:

1. **WCAG 2.0 AA conformance:** Do the new USWDS changes introduce any accessibility regressions?
2. **Section 508 compliance:** Are federal accessibility requirements still satisfied?
3. **CoDS accessibility evidence:** Do CoDS Type A components still meet manual testing requirements (keyboard navigation, focus management, screen reader testing)?
4. **Known issues:** Are there any newly documented accessibility limitations in the USWDS release notes?

**Outcome:**

- ✅ **Approved:** No accessibility regressions; upgrade proceeds.
- ⚠️ **Conditional:** Regressions exist but are acceptable (document in release notes); upgrade with documented exceptions.
- ❌ **Blocked:** Regressions are critical; defer upgrade until USWDS issue is resolved or CoDS implements a workaround.

### 4.2 Accessibility Testing Scope

Aten engineer performs manual testing on a representative subset of Type A components:

- **Button** (primary, secondary, disabled states)
- **Form inputs** (text input, select, checkbox, radio)
- **Navigation** (breadcrumb, in-page navigation)
- **Alerts** (site alert, success/warning/error states)

Testing includes:

- Keyboard navigation (Tab, Enter, Space, Escape, arrow keys as applicable)
- Focus indicator visibility and clarity
- Screen reader announcements (NVDA, JAWS, VoiceOver)
- Color contrast ratios (WCAG AAA preferred, AA minimum)

## 5. Breaking Change Handling

If a USWDS upgrade introduces breaking changes:

### 5.1 Identifying Breaking Changes

**Breaking change indicators:**

- CSS class names removed or renamed.
- Sass variable or mixin signatures changed.
- HTML markup structure altered (e.g., different nesting or required elements).
- JavaScript API changes (e.g., event names, listener parameters).

### 5.2 CoDS Response

1. **Aten technical lead:** Documents the breaking change and impact on each Type A component.
2. **State technical owner + Aten lead:** Decide:
   - **Absorb the change:** Update CoDS's themed output and component metadata.
   - **Defer the upgrade:** Wait for USWDS to stabilize or provide migration path.
   - **Fork/patch:** If breaking change is unacceptable, create a CoDS-specific patch to USWDS source (rare; requires code review and long-term maintenance burden).
3. **Architecture Decision Record (ADR):** If accepting a breaking change, an ADR amendment must be filed explaining the decision and impact.
4. **Release:** CoDS publishes a major version bump (semver MAJOR) communicating breaking changes to consumers.

## 6. Dependency Transparency

CoDS maintains a public record of the USWDS version pinned in each release:

### 6.1 Version Tracking

**Location:** CoDS `package.json` (publicly inspectable).  
**Release notes:** Every CoDS release notes include:

- Pinned USWDS version.
- USWDS changes incorporated (summary of breaking changes, security fixes, feature additions).
- Any CoDS-specific workarounds or patches applied to USWDS components.

**Example (in CHANGELOG.md):**

```markdown
## [0.1.0] - 2026-10-15

### Updated

- Upgraded @uswds/uswds from 3.14.0 to 3.15.0
  - Security fix: Improved focus indicator contrast (WCAG AAA)
  - Feature: New USWDS heading utility classes for consistent typography
  - No breaking changes; all Type A components remain compatible

### Component Updates

- Button: Leverages new USWDS focus utility for enhanced focus visibility
- Text Input: Now inherits improved form styling from USWDS 3.15.0

### Testing

- Regression tests passed for all Type A components
- Accessibility review approved by State accessibility lead
```

## 7. Consuming Project Guidance

CoDS provides guidance to consuming projects on upgrading to new CoDS versions:

### 7.1 Upgrade Recommendations

**In CoDS release notes:**

- "Upgrading to this version: This is a patch release. No breaking changes in CoDS or USWDS. To upgrade, run: `pnpm update @coloradodigitalservice/colorado-design-system`"
- "This version includes a critical USWDS security fix. Upgrade recommended for all deployments."
- "⚠️ This is a major release with breaking changes. See MIGRATION.md for upgrade instructions."

### 7.2 USWDS Transparency

When a consuming project upgrades CoDS, they implicitly update the pinned USWDS version. CoDS documentation makes this clear:

**Statement in README.md:**

> CoDS pins a specific version of @uswds/uswds (see package.json). When you upgrade CoDS, you are also upgrading the USWDS version. CoDS's Sass theme settings ensure your visual design remains consistent with Colorado tokens, but you benefit from USWDS's accessibility and security improvements.

## 8. Communication & Notification

### 8.1 Change Notification

**For each USWDS upgrade that results in a CoDS release:**

1. **Email:** Notify CODS implementation team and stakeholders.
2. **Release notes:** Publish detailed CHANGELOG entry.
3. **Security advisories:** For critical fixes, file a GitHub Security Advisory on the CoDS repository.
4. **Governance meeting:** If breaking changes, present to State governance for review.

### 8.2 Escalation Path

**If a USWDS upgrade is blocked or deferred:**

- **Aten technical lead:** Notifies State technical owner with rationale.
- **State technical owner:** Decides whether to file a USWDS issue, accept the block, or approve a workaround.

## 9. Maintenance Responsibility Matrix

| Activity                            | Aten | State Tech Owner | State A11y Lead | State Design Owner |
| ----------------------------------- | ---- | ---------------- | --------------- | ------------------ |
| Monitor USWDS releases              | ✓    |                  |                 |                    |
| Screen for security/a11y fixes      | ✓    |                  |                 |                    |
| Conduct regression testing          | ✓    |                  |                 |                    |
| Accessibility review                | ✓    |                  | ✓               |                    |
| Approve standard upgrade            |      | ✓                |                 |                    |
| Approve fast-track security upgrade | ✓    | ✓                | ✓               |                    |
| Publish CoDS release                | ✓    | ✓                |                 |                    |
| Notify stakeholders                 | ✓    |                  |                 |                    |

## 10. Review Dates & Cadence

**Quarterly review windows:**

- **Q1 review:** January (testing in Dec–Jan)
- **Q2 review:** April (testing in Mar–Apr)
- **Q3 review:** July (testing in Jun–Jul)
- **Q4 review:** October (testing in Sep–Oct)

**First review cycle:** Q4 2026 (October 2026) — 3 months post-launch of USWDS integration.

## 11. Exceptions & Deferrals

**When an upgrade may be deferred:**

- New USWDS version introduces a breaking change unacceptable to State without further review.
- A Type A component's behavior or output changes in ways that conflict with approved State design.
- An accessibility regression is introduced in USWDS (upgrade blocked until USWDS resolves).
- No security or critical accessibility fixes are included, and the release is minor/feature-driven.

**Deferral process:**

1. Aten technical lead documents rationale.
2. State technical owner approves deferral.
3. Next quarterly review reassesses.

## 12. Documentation & Artifacts

**Maintained by:** Aten technical lead  
**Artifacts:**

- `package.json` — Pinned USWDS version (source of truth).
- `CHANGELOG.md` — USWDS upgrade history and associated CoDS version.
- `docs/governance/USWDS-UPGRADE-POLICY.md` — This document.
- `docs/governance/component-ownership-matrix.md` — Component-to-USWDS mapping.

**Review frequency:** Annually (at end of calendar year); sooner if process changes are warranted.

---

**Document ID:** CODS-USWDS-UPGRADE-POLICY  
**Maintained by:** Aten Design Group (technical lead)  
**Approved by:** [State Technical Owner signature & date TBD]  
**Repository:** `docs/governance/USWDS-UPGRADE-POLICY.md`
