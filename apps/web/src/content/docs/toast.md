---
title: Toast/Snackbar
description: Guidance for supplemental notifications and accessible alternatives.
navLabel: Toast/Snackbar
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

## Content

Keep messages concise: aim for about two lines, or roughly 50 characters. Use plain language that states the result, such as “Response submitted.” Do not use a toast for long notifications or general announcements; use [Site Alert](../site-alert/) or an [in-page alert](../in-page-alert/) instead.

The 50-character target is guidance for authors, not a limit. The component does not truncate messages, so translated text can be longer and still wraps and reflows at narrow widths and high zoom.

## Errors and urgency

Error-severity notifications must pass `urgency: 'assertive'` so they are announced through the alert live region. Use the default polite urgency for every other message. An error toast still supplements, and never replaces, an error message beside the field or content that needs attention.

```js
showToast(notifications, {
  message: 'Your changes could not be saved.',
  dismissLabel: 'Dismiss',
  urgency: 'assertive',
  returnFocus: saveButton,
});
```

## Behavior

Toasts appear at the bottom-right of the viewport, are 320 pixels wide (narrower when the viewport requires it), and animate in over 250 milliseconds. The animation is removed when reduced motion is requested. Messages remain until dismissed by default; timed messages stay for at least ten seconds and pause while hovered or focused. A toast with an action stays until dismissed. The example below uses ten seconds, so a pause can make it visible for longer.

## Examples

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

### Icon

An optional `iconHref` points to a symbol in the design system's icon sprite. The icon is decorative, so the message itself must state the result. Deploy the packaged icon sprite and replace `/icons/sprite.svg` with its public URL. See [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path).

```js
showToast(notifications, {
  message: 'Response submitted.',
  dismissLabel: 'Dismiss',
  iconHref: '/icons/sprite.svg#check',
  duration: 10000,
  returnFocus: submitButton,
});
```

### Action

Pass `action: { label, onActivate }` and keep an equivalent action available beside the related content; an action inside a toast can be difficult to find. Actionable toasts do not auto-dismiss. After the action runs, update or dismiss any notification that no longer describes the current state. In the example, “Undo contact information update” next to the form performs the same action as Undo in the notification.

```js
import {
  initToast,
  showToast,
  dismissAllToast,
} from '@coloradodigitalservice/colorado-design-system';

const notifications = document.querySelector('[data-cods-toast]');
const updateButton = document.querySelector('#update-contact');
const contextUndo = document.querySelector('#undo-contact-update');
const status = document.querySelector('#contact-status');
initToast(notifications);

const undo = () => {
  status.textContent = 'Contact information update undone.';
  dismissAllToast(notifications);
};
contextUndo.addEventListener('click', undo);
updateButton.addEventListener('click', () => {
  status.textContent = 'Contact information has been updated.';
  showToast(notifications, {
    message: 'Contact information has been updated.',
    dismissLabel: 'Dismiss',
    action: { label: 'Undo', onActivate: undo },
    returnFocus: updateButton,
  });
});
```

The runnable examples and their HTML follow.
