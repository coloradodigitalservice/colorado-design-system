# Tooltip follow-up review

Temporary working notes for [PR #98](https://github.com/coloradodigitalservice/colorado-design-system/pull/98), reviewed at commit `4026f39`. No follow-up feedback has been posted.

## Status of previous feedback

| Request                               | Status                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Hover path in a scaled-down ancestor  | Addressed in the tested case.                                                      |
| Accessible fallback when no side fits | Normal-flow scrolling fixed; fixed-layout limitation documented. See item 1.       |
| Keep tooltip visible on page scroll   | Page and scrolling-container placement fixed when space allows. See items 1 and 2. |
| Preserve focus on init and destroy    | Addressed in unit tests and manual checks in all three browser engines.            |
| Arrow tracks a shifted tooltip        | Addressed in the tested edge case.                                                 |
| Reopen on fresh hover or focus        | Addressed in the tested cases.                                                     |
| Light treatment, typography, shadow   | Implemented; individual accessibility verification remains open.                   |
| Figma authoring guidance              | Added.                                                                             |
| Type C direction and approvals        | Approvals confirmed and records aligned locally. See item 4.                       |
| Instance-owned external listeners     | Contract and teardown updated.                                                     |
| Canonical unit-test fixture           | Updated.                                                                           |

Focused checks passed: 11 unit tests, 39 Tooltip Storybook browser tests, and three documentation smoke tests across Chromium, Firefox, and WebKit. Actual 400% browser zoom, screen readers, forced colors, localization, and other manual accessibility checks remain open.

## Findings to discuss

### 1. No-fit fallback can leave text unreachable

At a simulated 320 × 180 viewport with 125 characters, the tooltip no longer covers its focused trigger, but its bottom extends 34px below the viewport. In a normal-flow example, attempting to scroll to the overflow snaps the page back; intercepting the scroll repositioning handler during diagnosis allowed the scroll. A fixed-position trigger also cannot create the page overflow needed to reach the tooltip in the tested layout.

At the reviewed commit, the [placement code](../packages/colorado-design-system/src/components/tooltip/tooltip.ts) and [documentation](../apps/web/src/content/docs/tooltip.md) said scrolling could reveal the content, while the no-fit test checked trigger overlap and horizontal bounds but not whether all text was reachable. Resetting `top` and `left` during repositioning contributed to the normal-flow scroll behavior.

The fixed-trigger case required a design decision: the full text was taller than the space above or below the trigger, and narrowing it to fit beside the trigger made it taller than the viewport. A standard tooltip is not keyboard-focusable, so a scrollable interactive fallback would change its semantics.

**Decision:** Fixed the normal-flow case locally. Kept standard tooltip behavior and documented the fixed-trigger no-fit limitation instead of adding a focusable popup.

### 2. A scrolling container can clip an open tooltip

In a tested `overflow: auto` container, scrolling left the trigger fully visible but clipped 24px from the tooltip, despite enough room above the trigger within the container. Before the fix, placement checked viewport bounds but not the container's visible bounds, and the [documentation](../apps/web/src/content/docs/tooltip.md) mentioned clipping only for `overflow: hidden`.

**Decision:** Fixed locally, accounting for the visible bounds of scrolling containers and flipping when space allows.

### 3. Scaled-up content can exceed the viewport width

At `scale(1.5)` in a 320px-wide viewport, a 125-character tooltip rendered 432px wide and extended about 112px beyond the viewport in Chromium, Firefox, and WebKit. The [CSS width limit](../packages/colorado-design-system/src/components/tooltip/tooltip.scss) applies before the ancestor transform. The existing scaled-ancestor test does not combine scaling with a narrow viewport and long content.

This is CSS scaling, not browser zoom. No `scale()` use was found in the app or component source files searched; the Tooltip browser tests deliberately exercise it. The original feedback concerned scaled-down hover behavior.

**Decision:** Omit; no fix or follow-up requested.

### 4. Type C approval records conflict

The [metadata](../packages/colorado-design-system/src/components/tooltip/tooltip.metadata.json) already sets `divergenceApproved: true`, but other records previously described State design and accessibility approvals as pending. The user confirmed both approvals. Updated the metadata notes, [evidence](../packages/colorado-design-system/src/components/tooltip/accessibility/tooltip.evidence.md), [ownership matrix](./governance/component-ownership-matrix.md), and public guidance to reflect that confirmation. Individual accessibility verification remains open.

**Decision:** Record the confirmed approvals locally. Done; no validator change is needed.

### 5. The ownership matrix overattributes earlier defects to USWDS

Before correction, the [matrix](./governance/component-ownership-matrix.md) described the previous scaled-down hover and fresh-interaction failures as USWDS behavior. In the earlier direct comparison, pinned USWDS stayed hoverable at `scale(0.5)` and reopened on a fresh hover after Escape. At the tested viewport edge it switched sides rather than exhibiting the earlier CoDS arrow shift; at 320 × 180 it clipped off-screen rather than covering the trigger. Upstream did lose focus during initialization and could clip on scroll.

**Decision:** Correct the attribution locally. Done.

### 6. Accessibility evidence overstates browser-test coverage

Before correction, the [accessibility evidence](../packages/colorado-design-system/src/components/tooltip/accessibility/tooltip.evidence.md) said browser tests covered focus preservation through initialization and destruction, but those assertions were in unit tests; this review checked the paths manually in all three browser engines.

**Decision:** Correct the evidence locally, distinguishing unit tests from the manual browser checks. Done.

### 7. The PR description is stale

The PR description still describes the old USWDS wrapper and says the light treatment is deferred.

**Decision:** Omit; leave the PR description unchanged.

## Follow-up comment draft

Selected local updates are implemented. No follow-up comment is requested; do not post without direction.
