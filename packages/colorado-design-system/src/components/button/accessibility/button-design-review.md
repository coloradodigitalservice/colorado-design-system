# Button sizing decision

Source: [Button design](https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=808-2014&m=dev), inspected 2026-10-21.

The implemented variants are Primary, Secondary and Danger, in Medium and Slim,
with label and icon-only forms. The ticket's older outline/ghost terminology
needs reconciliation with the confirmed design scope.

Medium uses a 16px text line or icon, 12px vertical padding and 16px horizontal
padding, producing a 40px height. Its 2px boundary is inset.

Figma's Slim settings conflict: a 32px height cannot contain a 16px line plus
12px padding above and below. The implementation preserves the 32px minimum
height using 8px vertical padding. Labels wrap and increase the height rather
than clipping. Icon-only Slim retains 12px horizontal padding for a 40×32px target.
Forced-colors borders preserve these dimensions through compensated padding.

This sizing decision was accepted for implementation on 2026-10-21; formal
design and accessibility sign-off remain open in the evidence file.
