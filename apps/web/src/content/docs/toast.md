---
title: Toast/Snackbar
description: Guidance for supplemental notifications and accessible alternatives.
navLabel: Toast/Snackbar
order: 25
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=4179-18149
accessibilityStatus: Automated checks do not establish accessibility acceptance. Human accessibility and design review is pending.
---

## Guidance

### When to use

Prefer feedback next to the action or content it describes. For example, show “Changes saved” beside the save button, or explain an error beside the field that needs attention. A notification in a distant part of the screen can be missed or disconnected from the action. Do not use a toast as the only way to communicate an error, important information, or an action.

Toasts can be difficult to notice, read, reach, and revisit. Screen magnification, keyboard navigation, screen readers, and different reading speeds can make these challenges more pronounced. [Primer recommends alternatives to toast notifications](https://primer.style/accessibility/patterns/accessible-notifications-and-messages/#toasts).

### Accessibility for Toast/Snackbar

Use it only as supplemental feedback. Keep the same information available in context. By default, notifications remain until dismissed. Every notification has a dismiss button, and new messages do not move focus. Provide a meaningful dismiss label and a return-focus target when calling `showToast`.

An optional duration is intended only for messages whose information remains available elsewhere. It is at least ten seconds and pauses while the pointer or keyboard focus is over the notification. **Neither the minimum duration nor pausing alone makes timed content accessible.** Check the full experience against [WCAG timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable). Keep actions such as Undo available in context even when a toast is persistent. Toasts with an action remain until dismissed. Keep an equivalent action available in context as well; an action inside a toast can be difficult to find.

Use polite announcements for ordinary updates and reserve assertive announcements for urgent interruptions. The live regions must be present before messages are added. Screen-reader behavior varies, so test announcements with people using assistive technology; automated checks cannot confirm that users hear or understand them. Avoid sending several messages in rapid succession. A stack of persistent notifications can cover content or make keyboard navigation harder; dismiss or consolidate obsolete messages and ensure important information remains available in context.

Check keyboard access, focus after dismissal, 400% zoom, reflow, forced colors, reduced motion, and that notifications do not obscure controls. The component is experimental and requires human accessibility and design review.

### Writing for Toast/Snackbar

Keep messages concise: aim for about two lines, or roughly 50 characters. Use plain language that states the result, such as “Response submitted.” Do not use a toast for long notifications or general announcements; use [Site Alert](../site-alert/) or an [in-page alert](../in-page-alert/) instead.

The 50-character target is guidance for authors, not a limit. The component does not truncate messages.

## Specifications

### Errors and urgency

Error-severity notifications must pass `urgency: 'assertive'` so they are announced through the alert live region. Use the default polite urgency for every other message. An error toast still supplements, and never replaces, an error message beside the field or content that needs attention.

```js
showToast(notifications, {
  message: 'Your changes could not be saved.',
  dismissLabel: 'Dismiss',
  urgency: 'assertive',
  returnFocus: saveButton,
});
```

### Behavior

Toasts normally appear at the bottom-right of the viewport, are 320 pixels wide (narrower when the viewport requires it), and animate in over 250 milliseconds. To avoid covering the focused control, a toast may temporarily move to the top or show a shorter, scrollable stack. If there is too little space for both, part of the focused control may still be covered. The animation is removed when reduced motion is requested. Messages remain until dismissed by default; timed messages stay for at least ten seconds and pause while hovered or focused. A toast with an action stays until dismissed. The example below uses ten seconds, so a pause can make it visible for longer.

### Initializing and showing a notification

Each JavaScript example is a standalone module for the matching copyable HTML above. Load it after the HTML using a bundler or an import map that resolves the package name. The examples select the matching preview controls; replace these selectors in your application. The live examples share one notification area so messages stack. Use one notification area per page to avoid overlapping fixed areas. The HTML above shows the required live regions and list. Load the package styles and tokens as described in [Getting started](../getting-started/).

The example retains the saved status beside the button. Its supplemental notification disappears after ten seconds unless hovered or focused.

Initialize the notification area before showing a message. The example uses a timed supplemental notification:

```js
import {
  initToast,
  showToast,
} from '@coloradodigitalservice/colorado-design-system';

const saveButton = document.querySelector(
  '[data-cods-toast-message="Changes saved."]',
);
const status = saveButton.nextElementSibling;
const notifications = document.querySelector(
  '[aria-label="Notifications"][data-cods-toast]',
);
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

An optional `iconHref` points to a symbol in the design system's icon sprite. The icon is decorative, so the message itself must state the result. Deploy the packaged icon sprite and replace `/icons/sprite.svg` in the matching HTML with its public URL. See [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path).

```js
import {
  initToast,
  showToast,
} from '@coloradodigitalservice/colorado-design-system';

const submitButton = document.querySelector(
  '[data-cods-toast-message="Response submitted."]',
);
const status = submitButton.nextElementSibling;
const notifications = document.querySelector(
  '[aria-label="Icon example notifications"][data-cods-toast]',
);
initToast(notifications);
submitButton.addEventListener('click', () => {
  status.textContent = 'Response submitted.';
  showToast(notifications, {
    message: 'Response submitted.',
    dismissLabel: 'Dismiss',
    iconHref: submitButton.dataset.codsToastIcon,
    duration: 10000,
    returnFocus: submitButton,
  });
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

const updateButton = document.querySelector(
  '[data-cods-toast-message="Contact information has been updated."]',
);
const contextUndo = updateButton.nextElementSibling;
const status = contextUndo.nextElementSibling;
const notifications = document.querySelector(
  '[aria-label="Action example notifications"][data-cods-toast]',
);
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

### Controller and limitations

Call `initToast(root)` after the notification area is in the document and before calling `showToast(root, options)`. `showToast` returns the created element, or `undefined` for an uninitialized area or empty message or dismiss label. Use `dismissToast(root, item)` or `dismissAllToast(root)` to remove notifications. Call `destroyToast(root)` before removing the area; it removes notifications, listeners, timers, and queued announcements. `initAllToast(container)` initializes descendant areas. The root dispatches bubbling `cods-toast:show` and `cods-toast:dismiss` events with the item in `detail.item`.

Announcements are queued in order, with a short delay between updates. A dismissed item is skipped if it has not yet been announced. This does not guarantee delivery by assistive technology. Showing a toast does not move focus. When a focused toast is dismissed, focus moves to another toast control, the supplied return target, or the notification area.

Without JavaScript, the notification area does not generate messages. Keep the same information and any action available in context; the example buttons require JavaScript to demonstrate the supplemental notification. The no-JavaScript exception still needs accessibility review.

The component is CoDS-authored and does not use USWDS classes. `cods-toast` marks the area; `cods-toast__announcer` hides the live regions visually, and `cods-toast__list` holds generated items. The controller creates the item, message, optional icon and action, and dismiss controls. Do not create those items by hand.
