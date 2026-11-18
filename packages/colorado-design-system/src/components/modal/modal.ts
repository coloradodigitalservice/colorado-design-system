import uswdsModal from '@uswds/uswds/js/usa-modal';

const ROOT = '[data-cods-modal]';
const DIALOG = '.usa-modal';
const OPENER = '[data-open-modal]';
const CLOSER = '[data-close-modal]';
const VISIBLE = 'is-visible';
const WRAPPER = 'usa-modal-wrapper';
const PLACEHOLDER = 'data-placeholder-for';
/** The prefix USWDS's placeholder stores the authored dialog attributes under. */
const ORIGINAL = 'data-original-';

/** Payload for the bubbling cods-modal:open and cods-modal:close events. */
export interface ModalToggleDetail {
  modalId: string;
  open: boolean;
}

/** Authored state of an element USWDS binds `toggleModal` to and may mutate. */
interface Trigger {
  element: HTMLElement;
  /** USWDS generates an id on first open so it can return focus there. */
  id: string | null;
  /** USWDS adds `role="button"` to anchor triggers. */
  role: string | null;
}

interface Instance {
  modalId: string;
  /**
   * The wrapper USWDS builds and appends to `document.body`. The authored
   * dialog is moved inside it, so the wrapper — not the root — is what carries
   * the id and what `destroy` must hand back to USWDS.
   */
  wrapper: HTMLElement;
  dialog: HTMLElement;
  /** USWDS's marker for the dialog's authored position inside the root. */
  placeholder: HTMLElement;
  triggers: Trigger[];
  /** Authored tabindex; USWDS adds `-1` and never removes it on teardown. */
  tabIndex: string | null;
  observer: MutationObserver;
  wasOpen: boolean;
}

const instances = new WeakMap<HTMLElement, Instance>();
const warned = new WeakSet<HTMLElement>();

function warn(root: HTMLElement, reason: string): void {
  if (warned.has(root)) return;
  warned.add(root);
  console.warn(`cods-modal: ${reason}; markup was left unchanged.`, root);
}

function isOpen(instance: Instance): boolean {
  return instance.wrapper.classList.contains(VISIBLE);
}

/**
 * Translate USWDS's class toggle into CoDS events. USWDS flips the class
 * synchronously inside its own click handler, so the explicit open/close API
 * flushes pending records to keep those events synchronous.
 */
function settle(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.takeRecords();
  const open = isOpen(instance);
  if (open === instance.wasOpen) return;
  instance.wasOpen = open;
  root.dispatchEvent(
    new CustomEvent<ModalToggleDetail>(
      open ? 'cods-modal:open' : 'cods-modal:close',
      {
        bubbles: true,
        composed: false,
        detail: { modalId: instance.modalId, open },
      },
    ),
  );
}

/**
 * Enhance a connected root holding one `.usa-modal` with an id, an accessible
 * name, a description and at least one trigger. Invalid markup is left
 * untouched rather than letting the USWDS behavior throw.
 */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const document_ = root.ownerDocument;
  const dialog = root.querySelector<HTMLElement>(DIALOG);
  if (
    !root.matches(ROOT) ||
    !root.classList.contains('cods-modal') ||
    !root.isConnected ||
    !dialog ||
    root.querySelectorAll(DIALOG).length !== 1 ||
    dialog.closest(ROOT) !== root
  ) {
    warn(root, 'expected a connected root containing exactly one .usa-modal');
    return;
  }
  const modalId = dialog.id;
  const labelledBy = dialog.getAttribute('aria-labelledby');
  const describedBy = dialog.getAttribute('aria-describedby');
  // `getElementById` returns the first match, so a copied example would pass
  // an identity check; count instead. Every id the dialog depends on must be
  // unique, or USWDS resolves the wrong element and locks the page with no
  // visible dialog.
  const unique = (id: string | null): boolean =>
    !!id && document_.querySelectorAll(`#${CSS.escape(id)}`).length === 1;
  if (
    !/^[A-Za-z][A-Za-z0-9_-]*$/.test(modalId) ||
    document_.getElementById(modalId) !== dialog ||
    !unique(modalId) ||
    !unique(labelledBy) ||
    !unique(describedBy) ||
    // USWDS throws without these; it also moves them onto its wrapper.
    !labelledBy ||
    !describedBy ||
    !dialog.querySelector(`#${CSS.escape(labelledBy)}`) ||
    !dialog.querySelector(`#${CSS.escape(describedBy)}`)
  ) {
    warn(
      root,
      'the .usa-modal needs a unique simple id, and aria-labelledby and aria-describedby resolving to unique ids inside it',
    );
    return;
  }
  if (
    !root.querySelector(`${OPENER}[aria-controls="${CSS.escape(modalId)}"]`) ||
    !dialog.querySelector(CLOSER)
  ) {
    warn(
      root,
      'the root needs a [data-open-modal] trigger targeting the dialog and the dialog needs a [data-close-modal] action',
    );
    return;
  }
  if (
    document_.querySelector(`[data-placeholder-for="${CSS.escape(modalId)}"]`)
  ) {
    warn(root, 'the dialog is already enhanced');
    return;
  }
  const tabIndex = dialog.getAttribute('tabindex');
  // USWDS binds every element controlling the dialog, in or out of the root.
  const triggers = Array.from(
    document_.querySelectorAll<HTMLElement>(
      `[aria-controls="${CSS.escape(modalId)}"]`,
    ),
    (element): Trigger => ({
      element,
      id: element.getAttribute('id'),
      role: element.getAttribute('role'),
    }),
  );

  uswdsModal.on(root);

  // USWDS nests the dialog in overlay and wrapper, moves the id onto the
  // wrapper and appends it to body, leaving a placeholder in the root.
  const wrapper = dialog.parentElement?.parentElement;
  const placeholder = root.querySelector<HTMLElement>(
    `[${PLACEHOLDER}="${CSS.escape(modalId)}"]`,
  );
  if (!wrapper?.classList.contains(WRAPPER) || !placeholder) {
    warn(root, 'the USWDS behavior did not build a wrapper');
    return;
  }
  const instance: Instance = {
    modalId,
    wrapper,
    dialog,
    placeholder,
    triggers,
    tabIndex,
    wasOpen: wrapper.classList.contains(VISIBLE),
    observer: new MutationObserver(() => settle(root)),
  };
  // Observe after `on`, so the behavior's own setup emits nothing.
  instance.observer.observe(wrapper, {
    attributes: true,
    attributeFilter: ['class'],
  });
  // A CoDS hook on the generated overlay; it leaves with the wrapper.
  dialog.parentElement?.classList.add('cods-modal__overlay');
  instances.set(root, instance);
}

export function initAll(container: ParentNode = document): void {
  if (container instanceof HTMLElement && container.matches(ROOT))
    init(container);
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Open the dialog by driving the authored trigger, as a pointer would. */
export function open(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance || isOpen(instance)) return;
  root
    .querySelector<HTMLElement>(
      `${OPENER}[aria-controls="${CSS.escape(instance.modalId)}"]`,
    )
    ?.click();
  settle(root);
}

/**
 * Close through the path USWDS's own Escape handler takes. It hides the
 * visible dialog, releases the scroll lock, un-hides the page and returns
 * focus, without activating any of the dialog's actions: clicking one would
 * run its application handler (for example a "Delete record" button), and a
 * disabled one would not close at all. This is also how the forced-action
 * variant, which ignores Escape, is closed programmatically.
 */
function hide(instance: Instance): void {
  if (!isOpen(instance)) return;
  uswdsModal.toggleModal.call(uswdsModal, false);
}

/** Close the dialog without activating any of its actions. */
export function close(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  hide(instance);
  settle(root);
}

/**
 * Close if open, remove the generated wrapper and listeners, and restore the
 * authored markup, so the root can be enhanced again or left as plain HTML.
 */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  const { dialog, placeholder, wrapper } = instance;
  // Disconnect first, so teardown emits nothing.
  instance.observer.disconnect();
  // Close while still wired, or body keeps USWDS's scroll lock and the rest of
  // the page stays aria-hidden.
  hide(instance);
  // The dialog no longer lives inside the root, so USWDS has to be handed the
  // wrapper; `off(root)` would find nothing and silently leave the DOM built.
  uswdsModal.off(wrapper);
  // USWDS restores the dialog only when it can find the placeholder in the
  // document, so a root that was detached first is restored here instead.
  if (dialog.parentElement?.parentElement === wrapper) {
    for (const { name, value } of Array.from(placeholder.attributes)) {
      if (name.startsWith(ORIGINAL))
        dialog.setAttribute(name.slice(ORIGINAL.length), value);
    }
    placeholder.replaceWith(dialog);
  }
  wrapper.remove();
  // USWDS's teardown looks triggers up by the dialog id after it has already
  // moved that id, so it never unbinds them. Left bound, a later click would
  // lock and hide the page with no dialog to show.
  for (const { element, id, role } of instance.triggers) {
    element.removeEventListener('click', uswdsModal.toggleModal);
    if (id === null) element.removeAttribute('id');
    else element.setAttribute('id', id);
    if (role === null) element.removeAttribute('role');
    else element.setAttribute('role', role);
  }
  // USWDS's cleanup restores only the attributes it snapshotted before setup.
  if (instance.tabIndex === null) dialog.removeAttribute('tabindex');
  else dialog.setAttribute('tabindex', instance.tabIndex);
  instances.delete(root);
}
