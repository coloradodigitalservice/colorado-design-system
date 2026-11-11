---
title: Toasts and snackbars
description: Guidance for supplemental notifications and accessible alternatives.
navLabel: Toasts and snackbars
order: 25
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4179-18149
---

## Choose feedback near the action first

Prefer feedback next to the action or content it describes. For example, show “Changes saved” beside the save button, or explain an error beside the field that needs attention. A notification in a distant part of the screen can be missed or disconnected from the action. Do not use a toast as the only way to communicate an error, important information, or an action.

Toasts can be difficult to notice, read, reach, and revisit. Screen magnification, keyboard navigation, screen readers, and different reading speeds can make these challenges more pronounced. [Primer recommends alternatives to toast notifications](https://primer.style/accessibility/patterns/accessible-notifications-and-messages/#toasts).

## If you use a toast

Use it only as supplemental feedback. Keep the same information available in context. By default, notifications remain until dismissed. Every notification has a dismiss button, and new messages do not move focus. Provide a localized dismiss label and a return-focus target when calling `showToast`.

An optional duration is intended only for messages whose information remains available elsewhere. It is at least ten seconds and pauses while the pointer or keyboard focus is over the notification. **Neither the minimum duration nor pausing alone makes timed content accessible.** Check the full experience against [WCAG timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable). Do not rely on a timed toast as the only way to perform an action. The component does not currently provide the Undo action shown in the design; keep actions such as Undo available in context.

Use polite announcements for ordinary updates and reserve assertive announcements for urgent interruptions. The live regions must be present before messages are added. Screen-reader behavior varies, so test announcements with people using assistive technology; automated checks cannot confirm that users hear or understand them. Avoid sending several messages in rapid succession.

Check keyboard access, focus after dismissal, 400% zoom, reflow, forced colors, reduced motion, long translations, and that notifications do not obscure controls. The component is experimental and requires human accessibility and design review.

## Example

The example retains the saved status beside the button. The supplemental notification stays until dismissed.

Initialize the notification area before showing a message. The example uses a persistent notification:

```js
import {
  initToast,
  showToast,
} from '@coloradodigitalservice/colorado-design-system';

const notifications = document.querySelector('[data-cods-toast]');
const saveButton = document.querySelector('#save');
initToast(notifications);
showToast(notifications, {
  message: 'Changes saved.',
  dismissLabel: 'Dismiss',
  returnFocus: saveButton,
});
```

Place the notification area in a logical position in the page and avoid covering existing content. An application should manage the layout and provide an accessible way to revisit important information.
