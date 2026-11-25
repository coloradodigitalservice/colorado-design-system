---
title: Modal
description: An experimental, focus-trapped dialog for decisions that must be made before continuing.
navLabel: Modal
order: 24
figma: https://www.figma.com/design/jQ3EiYqe3uEvFbid5ewc41/Colorado-Design-System?node-id=3381-4959
accessibilityStatus: Automated checks cover the modal; manual accessibility review is pending.
---

## Guidance

### When to use

Modals interrupt whatever the person was doing, so use them sparingly. Frequent modals cause dialog fatigue: people learn to dismiss them without reading. Most messages belong on the page.

Use a modal when:

- A decision must be made before the person can continue, such as confirming a destructive action.
- A short, self-contained task interrupts the current one and returning to it matters.
- A session or security event needs acknowledgement before any further action.

Don't use a modal when:

- The content is long, complex, or worth a URL of its own. Use a page.
- The message needs no response. Use an in-page alert or a site alert.
- The person is partway through a form. Interrupting loses their place and their context.
- You are stacking it on another modal. Nested modals are out of scope and are not supported.
- The decision is low-stakes. Never use the forced-action variant for it: locking the page adds friction without protecting anything.

### Writing for modals

- Write the heading as the decision, not the topic: "Delete this record?" rather than "Confirm".
- Label the buttons with the action they take. "Delete record" and "Cancel" beat "OK" and "Close".
- Put the consequence in the description, especially when the action cannot be undone.
- Keep the description to a sentence or two. A modal that needs scrolling should be a page.

### Writing error messages

When a modal reports a problem, make the message solution-oriented:

- Say what happened and what the person can do next, in plain language.
- Offer a way forward, such as retrying, changing an entry, or contacting support, rather than only naming the error.
- Match the tone to the situation, and do not blame the person.
- Prefer preventing the error in the first place, for example with clear labels and validation, over explaining it afterward.

### Variants

**Default** is dismissible. `Escape`, the close button, a click on the overlay, and any in-dialog action all close it. Use it for everything that is safe to dismiss.

**Forced action** has no dismiss affordance. `Escape` and overlay clicks do nothing, so the person must choose one of the actions in the dialog. Reserve it for session, security, and data-loss decisions where silently dismissing would be the wrong outcome, never for low-stakes choices. Every forced-action modal needs at least one action that lets the person proceed.

**Large** widens the dialog for content that needs the room, such as a statement or a short policy. It changes width only; the behavior is the default dismissible one.

### Accessibility for modals

- Focus moves into the dialog, stays inside while it is open, and returns to the trigger when it closes. The page behind it cannot scroll while it is open.
- The default dialog closes with Escape, the close button, the backdrop, or a marked close action. Forced-action dialogs require a marked action; Escape and backdrop clicks do not close them.

- Each dialog needs a unique `id`, an `aria-labelledby` pointing at its heading, and an `aria-describedby` pointing at its description. The controller leaves the markup untouched if any are missing or duplicated rather than failing at runtime. If a dialog, heading, or description ID becomes duplicated after initialization, the existing trigger warns and does not open until the duplicate is removed.
- Triggers are buttons, not links: they open a dialog rather than navigating.
- Without JavaScript the dialog content stays inline on the page and the trigger does nothing, so the content must still make sense where you wrote it.

## Specifications

### Variants and elements

Pair the CoDS classes with the USWDS classes shown in the component code.

| Class                 | Use                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `cods-modal`          | Root containing the trigger and dialog.                                                                     |
| `cods-modal__dialog`  | Dialog surface; pair with `usa-modal`. Add `usa-modal--lg cods-modal__dialog--large` for the large variant. |
| `cods-modal__content` | Content container; pair with `usa-modal__content`.                                                          |
| `cods-modal__main`    | Main content; pair with `usa-modal__main`.                                                                  |
| `cods-modal__heading` | Dialog heading; pair with `usa-modal__heading`.                                                             |
| `cods-modal__footer`  | Action area; pair with `usa-modal__footer`.                                                                 |
| `cods-modal__close`   | Dismiss button; pair with `usa-modal__close`.                                                               |

### Using the controller

Import the controller from the package and initialize each root after its markup is in the document:

```js
import {
  initModal,
  initAllModal,
  openModal,
  closeModal,
  destroyModal,
} from '@coloradodigitalservice/colorado-design-system';

// Every modal root on the page:
initAllModal();

// Or a single root:
const root = document.querySelector('[data-cods-modal]');
initModal(root);

openModal(root);
closeModal(root);

// Before removing or replacing the markup:
destroyModal(root);
// After inserting new markup:
initAllModal(container);
```

Use the built ES module in a `script type="module"` when consuming without a bundler. USWDS 3.14.0's modal behavior is bundled into the module; the consumer needs no separate USWDS script. Do not also run a USWDS auto-initializer on these roots. The controller does not observe the DOM, so call `initAllModal()` after inserting new markup.

### Public API and events

| Hook or method            | Meaning                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-cods-modal`         | Root with the `cods-modal` class, containing one trigger and one dialog.                                                                                     |
| `data-open-modal`         | A trigger `<button>` whose `aria-controls` names the dialog `id`.                                                                                            |
| `data-close-modal`        | An in-dialog action or the close button. Activating it closes the dialog after its own handlers run.                                                         |
| `data-force-action`       | On the dialog, selects the forced-action variant.                                                                                                            |
| `initModal(root)`         | Enhance a connected root. Repeated calls are safe. Invalid markup, including a duplicate id, warns once and is left unchanged.                               |
| `initAllModal(container)` | Enhance roots within a container, including a root container itself. Defaults to `document`.                                                                 |
| `openModal(root)`         | Open the dialog through its trigger, so focus returns there on close. Ignored when the root is not enhanced or the dialog is already open.                   |
| `closeModal(root)`        | Close the dialog, release the page and return focus to the trigger. It activates none of the dialog's actions, and it also closes the forced-action variant. |
| `destroyModal(root)`      | Close if open, remove the generated wrapper and listeners, and restore the authored markup. Safe before initialization or when called repeatedly.            |

Each change of state dispatches **`cods-modal:open`** or **`cods-modal:close`** from the root with `bubbles: true`, `composed: false` and `detail: { modalId: string, open: boolean }`. User actions and the methods above both emit them; initialization and teardown do not. Because `closeModal()` never activates an action, listen for clicks on your own action buttons to learn which one the person chose.

### Lifecycle

The dialog is authored in place and moved into a wrapper at the end of `<body>` when the controller runs, so page content can be hidden from assistive technology while it is open. Once enhanced, the dialog is no longer inside the element you wrote it in; keep that in mind when styling or querying its ancestors. `destroyModal()` moves it back.

Focus moves into the dialog on open, is trapped while open, and returns to the trigger on close. The page behind the dialog cannot scroll while it is open.

Destroy a root before removing it from the page. Its dialog lives outside the root while enhanced, so removing the root alone leaves the wrapper behind and, if it was open, the page locked.

### IDs when copying an example

Every dialog on a page needs its own ids. When you copy an example, change all of these together:

- the dialog `id`, and the trigger's `aria-controls` that points at it;
- the heading `id`, and the dialog's `aria-labelledby`;
- the description `id`, and the dialog's `aria-describedby`.

A dialog whose id, heading id or description id appears more than once on the page is not enhanced: the controller warns in the console and leaves the markup in place.

### Close icon sprite

The close button draws its icon from the package's SVG sprite. The preview code uses this site’s built sprite URL. Deploy the packaged `icons/` assets and replace that URL with the sprite’s public path, keeping the `#x` fragment. When you upgrade the package, deploy its new sprite with it. See [Sprite URL and deployment path](../icon/#sprite-url-and-deployment-path) for prefixed and cross-origin hosting.
