import uswdsModal from '@uswds/uswds/js/usa-modal';

const ROOT = '[data-cods-modal]';
const DIALOG = '.usa-modal';
const OPENER = '[data-open-modal]';
const CLOSER = '[data-close-modal]';
const VISIBLE = 'is-visible';

/** Payload for the bubbling cods-modal:open and cods-modal:close events. */
export interface ModalToggleDetail {
  modalId: string;
  open: boolean;
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
  if (
    !/^[A-Za-z][A-Za-z0-9_-]*$/.test(modalId) ||
    document_.getElementById(modalId) !== dialog ||
    // USWDS throws without these; it also moves them onto its wrapper.
    !labelledBy ||
    !describedBy ||
    !dialog.querySelector(`#${CSS.escape(labelledBy)}`) ||
    !dialog.querySelector(`#${CSS.escape(describedBy)}`)
  ) {
    warn(
      root,
      'the .usa-modal needs a unique simple id and aria-labelledby and aria-describedby resolving inside it',
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

  uswdsModal.on(root);

  // USWDS moved the id from the dialog onto the wrapper it appended to body.
  const wrapper = document_.getElementById(modalId);
  if (!wrapper) {
    warn(root, 'the USWDS behavior did not build a wrapper');
    return;
  }
  const instance: Instance = {
    modalId,
    wrapper,
    dialog,
    tabIndex,
    wasOpen: wrapper.classList.contains(VISIBLE),
    observer: new MutationObserver(() => settle(root)),
  };
  // Observe after `on`, so the behavior's own setup emits nothing.
  instance.observer.observe(wrapper, {
    attributes: true,
    attributeFilter: ['class'],
  });
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
 * Close the dialog through USWDS's own close path. The forced-action variant
 * has no dismiss affordance, so its in-dialog actions are the only closers.
 */
export function close(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance || !isOpen(instance)) return;
  instance.wrapper.querySelector<HTMLElement>(CLOSER)?.click();
  settle(root);
}

/** Remove the generated wrapper and return the dialog to its authored place. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  // Disconnect first, so teardown emits nothing.
  instance.observer.disconnect();
  // Close while still wired, or body keeps USWDS's scroll lock and the rest of
  // the page stays aria-hidden.
  if (isOpen(instance))
    instance.wrapper.querySelector<HTMLElement>(CLOSER)?.click();
  // The dialog no longer lives inside the root, so USWDS has to be handed the
  // wrapper; `off(root)` would find nothing and silently leave the DOM built.
  uswdsModal.off(instance.wrapper);
  // USWDS's cleanup restores only the attributes it snapshotted before setup.
  if (instance.tabIndex === null) instance.dialog.removeAttribute('tabindex');
  else instance.dialog.setAttribute('tabindex', instance.tabIndex);
  instances.delete(root);
}
