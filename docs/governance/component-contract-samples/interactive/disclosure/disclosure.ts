// Contract sample only — demonstrates the section 4 controller lifecycle contract.
// Not part of the package's build entry point.

const ROOT_SELECTOR = '[data-cods-disclosure]';
const TRIGGER_SELECTOR = '[data-cods-disclosure-trigger]';

interface DisclosureInstance {
  root: HTMLDetailsElement;
  trigger: HTMLElement;
  onToggle: () => void;
}

const instances = new WeakMap<HTMLElement, DisclosureInstance>();

/**
 * Initializes a single `cods-disclosure` root. Idempotent: calling `init`
 * again on the same root is a no-op rather than double-binding listeners.
 */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  if (!(root instanceof HTMLDetailsElement)) {
    console.warn('cods-disclosure: root must be a <details> element', root);
    return;
  }

  const trigger = root.querySelector<HTMLElement>(TRIGGER_SELECTOR);
  if (!trigger) {
    console.warn('cods-disclosure: missing required trigger element', root);
    return;
  }

  const onToggle = () => {
    root.dispatchEvent(
      new CustomEvent('cods-disclosure:toggle', {
        bubbles: true,
        detail: { open: root.open },
      }),
    );
  };

  root.addEventListener('toggle', onToggle);
  instances.set(root, { root, trigger, onToggle });
}

/** Initializes every `cods-disclosure` instance found under `container`. */
export function initAll(container: ParentNode = document): void {
  container
    .querySelectorAll<HTMLElement>(ROOT_SELECTOR)
    .forEach((root) => init(root));
}

/**
 * Reverses `init`: removes listeners so the element returns to its
 * no-JavaScript, native `<details>` markup state. Safe to call without a
 * prior `init`.
 */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.root.removeEventListener('toggle', instance.onToggle);
  instances.delete(root);
}
