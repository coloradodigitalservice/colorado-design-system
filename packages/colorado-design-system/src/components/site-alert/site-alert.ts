const ROOT = '[data-cods-site-alert]';
const DISMISS = 'button[data-cods-site-alert-dismiss]';

/** Payload of the bubbling cods-site-alert:dismiss event. */
export interface SiteAlertDismissDetail {
  focusTargetId: string;
}
interface Instance {
  button: HTMLButtonElement;
  buttonHidden: string | null;
  rootHidden: string | null;
  onClick: () => void;
}
const instances = new WeakMap<HTMLElement, Instance>();
const warned = new WeakSet<HTMLElement>();

function destination(root: HTMLElement): HTMLElement | null {
  const id = root.getAttribute('data-cods-site-alert-focus-target');
  const target = id ? root.ownerDocument.getElementById(id) : null;
  if (!target || root.contains(target) || !target.isConnected) return null;
  if (target.closest('[hidden], [inert]') || target.matches(':disabled'))
    return null;
  return target.matches('a[href], button, input, select, textarea, [tabindex]')
    ? target
    : null;
}
function warn(root: HTMLElement) {
  if (warned.has(root)) return;
  warned.add(root);
  console.warn(
    'cods-site-alert: dismissal requires a focusable destination outside the notice.',
    root,
  );
}

/** Enhance optional dismissal after attaching the authored markup to the document. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const button = root.querySelector<HTMLButtonElement>(DISMISS);
  // USWDS Site Alert has no JavaScript behavior to wrap; dismissal is optional.
  if (!button) return;
  if (!root.isConnected || !destination(root)) {
    warn(root);
    return;
  }
  const onClick = () => {
    if (button.disabled || root.hidden) return;
    const target = destination(root);
    if (!target) {
      warn(root);
      return;
    }
    // Move focus before hiding its current container. If focusing fails, leave
    // the notice visible rather than dropping keyboard focus into the body.
    target.focus({ preventScroll: true });
    if (root.ownerDocument.activeElement !== target) {
      warn(root);
      return;
    }
    root.hidden = true;
    root.dispatchEvent(
      new CustomEvent<SiteAlertDismissDetail>('cods-site-alert:dismiss', {
        bubbles: true,
        composed: false,
        detail: { focusTargetId: target.id },
      }),
    );
  };
  instances.set(root, {
    button,
    buttonHidden: button.getAttribute('hidden'),
    rootHidden: root.getAttribute('hidden'),
    onClick,
  });
  button.hidden = false;
  button.addEventListener('click', onClick);
}

export function initAll(scope: ParentNode = document): void {
  if (scope instanceof HTMLElement && scope.matches(ROOT)) init(scope);
  scope.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Restore authored markup and remove this instance's listener. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.button.removeEventListener('click', instance.onClick);
  for (const [element, value] of [
    [root, instance.rootHidden],
    [instance.button, instance.buttonHidden],
  ] as const) {
    if (value === null) element.removeAttribute('hidden');
    else element.setAttribute('hidden', value);
  }
  instances.delete(root);
  warned.delete(root);
}
