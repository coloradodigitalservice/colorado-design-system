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
  the recorded Figma vector dimensions. The user selected shared Phosphor `export` for Upload on 2026-10-21 after
  comparing the Figma artwork; `upload` has an extra dot.

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

## Implementation resolution — 2026-10-21

The user authorized resolving the conflicting measurements by retaining Figma's
intended 32px Slim height and using 8px top/bottom padding with the 16px text line
and icons. This is an explicit deviation from Figma's 12px padding setting,
which appears inconsistent with its height. Formal reviewer approval remains
separate; the Figma file and ticket have not been edited by this change.

Medium stays 40px high with 12px vertical padding. Slim uses a 32px minimum
height and 8px vertical padding; wrapped labels grow instead of clipping.
Label buttons retain 16px horizontal padding. Icon-only Slim retains 12px
horizontal padding, producing 40×32px targets. Forced-colors borders preserve
the same outer dimensions through compensated padding.

Upload uses shared Phosphor Regular `export`, selected by the user after
comparison with the Figma artwork. No upload-icon decision remains open.

Regression checks cover Medium/Slim dimensions, expanded and translated Slim
labels at 320px, and the same Slim dimensions under forced colors. Human
accessibility checks and formal design review remain open.
