---
title: Modal
description: An experimental, focus-trapped dialog for decisions that must be made before continuing.
navLabel: Modal
order: 24
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3381-4959
---

## When to use

Use a modal when:

- A decision must be made before the person can continue, such as confirming a destructive action.
- A short, self-contained task interrupts the current one and returning to it matters.
- A session or security event needs acknowledgement before any further action.

Don't use a modal when:

- The content is long, complex, or worth a URL of its own. Use a page.
- The message needs no response. Use an in-page alert or a site alert.
- The person is partway through a form. Interrupting loses their place and their context.
- You are stacking it on another modal. Nested modals are out of scope and are not supported.

### Writing for modals

- Write the heading as the decision, not the topic: "Delete this record?" rather than "Confirm".
- Label the buttons with the action they take. "Delete record" and "Cancel" beat "OK" and "Close".
- Put the consequence in the description, especially when the action cannot be undone.
- Keep the description to a sentence or two. A modal that needs scrolling should be a page.

## Variants

**Default** is dismissible. `Escape`, the close button, a click on the overlay, and any in-dialog action all close it. Use it for everything that is safe to dismiss.

**Forced action** has no dismiss affordance. `Escape` and overlay clicks do nothing, so the person must choose one of the actions in the dialog. Reserve it for session, security, and data-loss decisions where silently dismissing would be the wrong outcome. Every forced-action modal needs at least one action that lets the person proceed.

**Large** widens the dialog for content that needs the room, such as a statement or a short policy. It changes width only; the behavior is the default dismissible one.

## Behavior

The dialog is authored in place and moved to the end of the document when the controller runs, so page content can be hidden from assistive technology while it is open. Keep that in mind when styling ancestors: once open, the dialog is no longer inside the element you wrote it in.

Focus moves into the dialog on open, is trapped while open, and returns to the trigger on close.

## Accessibility

- Each dialog needs an `id`, an `aria-labelledby` pointing at its heading, and an `aria-describedby` pointing at its description. The controller leaves the markup untouched if any are missing rather than failing at runtime.
- Triggers are buttons, not links: they open a dialog rather than navigating.
- Without JavaScript the dialog content stays inline on the page and the trigger does nothing, so the content must still make sense where you wrote it.

The examples above use the package's canonical fixture.
