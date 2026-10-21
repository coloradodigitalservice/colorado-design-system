# Button design verification and sizing decision — 2026-10-21

Review of [Phil's feedback](https://github.com/coloradodigitalservice/colorado-design-system/pull/33#pullrequestreview-5607228013)
against the live Figma file in the Aten Chrome profile and the connected Figma
inspection output. These observations do not establish design-owner approval.

## Where the requirements come from

The [CDS-50 ticket](https://atendesign.atlassian.net/browse/CDS-50), checked on
2026-10-21, requires token-based variants/sizes/states, accessible native markup,
and complete documentation and Storybook coverage. Its acceptance criteria do
not prescribe a 32px height, 12px padding, or 16px line-height. Those precise
measurements come from Figma and are repeated in Phil's PR review.

The ticket's scope still mentions outline/ghost and default/small, while the
Figma component exposes Primary/Secondary/Danger and Medium/Slim. The review
fixes follow Phil's requested alignment with Figma; the original variants were
supported by the ticket wording. The ticket should be reconciled with the
confirmed design scope and sizing rather than leaving two competing references.

## Confirmed design settings

- [Button documentation and component set, 808:2014](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=808-2014&m=dev):
  Primary, Secondary, Danger; Medium and Slim; label and icon-only styles;
  optional Icon prefix / Icon suffix. No separate Outline or Ghost type.
- Label buttons: 12px vertical / 16px horizontal padding, 16px line-height,
  16px icon slots, 8px gap. Secondary has a transparent surface and 2px stroke.
- Medium icon-only: 16px icon with 12px padding on all sides (40×40px).
- [Slim primary label, 1377:1222](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=1377-1222&m=dev):
  fixed 32px height, 12px top/bottom padding, 16px line-height. Chrome Inspect
  shows 8px available content height and border-box sizing.
- Figma includes use/don't-use guidance and Writing for Buttons. These are now
  reflected in the reference documentation.
- The shared plus at a 16px slot has a 12px visible span and 1px bars, matching
  the recorded Figma vector dimensions. The shared upload choice still needs
  design confirmation; its legacy Figma name alone does not prove parity.

## Why the Slim settings conflict

| Requirement           | Height contribution |
| --------------------- | ------------------: |
| Top padding           |                12px |
| Text line or icon     |                16px |
| Bottom padding        |                12px |
| Required height       |            **40px** |
| Specified Slim height |            **32px** |
| Shortfall             |             **8px** |

A fixed 32px box leaves only 8px for 16px content. A flex layout can still draw
some content into the padding, which makes a screenshot look plausible, but it
cannot preserve the stated internal spacing. Clipping or longer translated
labels makes this fragile. A normal CSS border would add another 4px; Figma's
inside stroke is instead represented by an inset shadow, preserving Medium's
40px outer height. Forced colors uses a system border with compensated padding.
The 2px stroke temporarily shares the focus-offset token; that coupling is
explicitly recorded in Sass pending a dedicated boundary-thickness token.

## Current implementation and open decision

Medium is 40px tall for one line; icon-only Medium is 40×40px. Slim retains
12px vertical padding and a 16px line-height, growing to 40px instead of forcing
32px. Its requested 32px height and 40×32px icon-only dimensions remain open.
No smaller padding or clipped label is silently substituted. Regression tests
cover the current dimensions, overflow, and the literal 32px conflict.

Recommended proposal: approve **8px vertical padding for Slim**, retain 16px
line-height and 16px icons, and use a **32px minimum height**, allowing multiline
labels to grow. Keep horizontal padding at 16px for label buttons and 12px for
icon-only buttons; this yields 40×32px icon-only targets. This is a proposal,
not an approved design change.

Alternative: keep 12px vertical padding and accept 40px Slim, revising the design
and its guidance about alignment with 32px inputs. Fixed 32px height plus shared
12px padding cannot satisfy all the requirements together.

## Suggested discussion wording

“Thanks, Phil — I checked the live Figma component and confirmed the mismatch.
Slim is set to 32px, but it also has 12px top and bottom padding around a 16px
line. That needs 40px. Medium now matches the 40px dimensions. For Slim, can we
confirm 8px vertical padding and a 32px minimum height, with room to grow for
longer labels? That also gives the requested 40×32px icon-only size. Until that
is confirmed, I have preserved the shared padding and kept content visible.”

Also request confirmation that Phosphor Regular `upload` is the intended glyph.

## How to close the decision

1. Present the conflicting Figma settings and the 8px-padding proposal to Phil
   and the design owner. Request confirmation of the intended padding and
   whether 32px is a minimum height that can grow for wrapped labels.
2. Once confirmed, record the Medium/Slim measurements in Figma and the CDS-50
   ticket, including icon-only dimensions. This prevents the same ambiguity in
   later implementations.
3. Apply the agreed Slim treatment using the approved spacing tokens, update
   the dimension/overflow tests and docs, and rerun the relevant checks.
4. Separately confirm the shared upload icon's appearance with design.

This commit records the proposal and completed review fixes. It does not treat
the proposal as approved or assert that the pending human checks are complete.
