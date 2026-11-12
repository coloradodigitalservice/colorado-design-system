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

An optional duration is intended only for messages whose information remains available elsewhere. It is at least ten seconds and pauses while the pointer or keyboard focus is over the notification. **Neither the minimum duration nor pausing alone makes timed content accessible.** Check the full experience against [WCAG timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable). Keep actions such as Undo available in context even when a toast is persistent. Toasts with an action remain until dismissed. Keep an equivalent action available in context as well; an action inside a toast can be difficult to find.

Use polite announcements for ordinary updates and reserve assertive announcements for urgent interruptions. The live regions must be present before messages are added. Screen-reader behavior varies, so test announcements with people using assistive technology; automated checks cannot confirm that users hear or understand them. Avoid sending several messages in rapid succession. A stack of persistent notifications can cover content or make keyboard navigation harder; dismiss or consolidate obsolete messages and ensure important information remains available in context.

Check keyboard access, focus after dismissal, 400% zoom, reflow, forced colors, reduced motion, long translations, and that notifications do not obscure controls. The component is experimental and requires human accessibility and design review.

## Behavior

Toasts appear at the bottom-right of the viewport and animate in over 250 milliseconds. The animation is removed when reduced motion is requested. Messages remain until dismissed by default; timed messages stay for at least ten seconds and pause while hovered or focused. A toast with an action stays until dismissed. The example below uses ten seconds, so a pause can make it visible for longer.

## Example

The example retains the saved status beside the button. Its supplemental notification disappears after ten seconds unless hovered or focused.

Initialize the notification area before showing a message. The example uses a timed supplemental notification:

```js
import {
  initToast,
  showToast,
} from '@coloradodigitalservice/colorado-design-system';

const notifications = document.querySelector('[data-cods-toast]');
const saveButton = document.querySelector('[data-cods-toast-demo]');
const status = document.querySelector('[data-cods-toast-demo-status]');
initToast(notifications);
saveButton.addEventListener('click', () => {
  status.textContent = 'Changes saved.';
  showToast(notifications, {
    message: 'Changes saved.',
    dismissLabel: 'Dismiss',
    duration: 10000,
    returnFocus: saveButton,
  });
});
```

Check that notifications do not obscure controls or content, especially when several messages are visible.

### Icons and actions

An optional `iconHref` points to a symbol in the design system's icon sprite. The icon is decorative, so the message itself must communicate the result. For an action, pass `action: { label, onActivate }` and keep the same action available beside the related content. Actionable toasts do not auto-dismiss. After an action succeeds, update or dismiss any notification that no longer describes the current state.
