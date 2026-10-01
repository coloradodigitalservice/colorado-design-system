import uswdsAccordion from '@uswds/uswds/js/usa-accordion';

const ROOT = '[data-cods-accordion]';
const TRIGGER = 'button[data-cods-accordion-trigger]';

/** Payload for the bubbling cods-accordion:change event. */
export interface AccordionChangeDetail {
  panelId: string;
  expanded: boolean;
}

interface Item {
  button: HTMLButtonElement;
  panel: HTMLElement;
  expanded: string | null;
  hidden: string | null;
  initialExpanded: boolean;
  onClick: () => void;
}

interface Instance {
  items: Item[];
  allowMultiple: string | null;
  enhanced: string | null;
}

const instances = new WeakMap<HTMLElement, Instance>();
const warned = new WeakSet<HTMLElement>();

function restore(element: HTMLElement, name: string, value: string | null) {
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}

function change(root: HTMLElement, item: Item, expanded: boolean) {
  const instance = instances.get(root);
  if (!instance || item.button.disabled) return;
  const before = instance.items.map(({ button }) =>
    button.getAttribute('aria-expanded'),
  );
  // Use pinned USWDS state/exclusivity behavior; only lifecycle, focus safety,
  // and CoDS events are added here. No document-level USWDS auto-initializer.
  uswdsAccordion.toggle(item.button, expanded);
  const changes = instance.items.filter(
    ({ button }, index) =>
      before[index] !== button.getAttribute('aria-expanded'),
  );
  for (const changed of changes) {
    if (
      changed.button.getAttribute('aria-expanded') === 'false' &&
      changed.panel.contains(root.ownerDocument.activeElement)
    ) {
      changed.button.focus();
    }
  }
  // Settle every affected panel before notifying consumers.
  for (const { button, panel } of changes) {
    root.dispatchEvent(
      new CustomEvent<AccordionChangeDetail>('cods-accordion:change', {
        bubbles: true,
        composed: false,
        detail: {
          panelId: panel.id,
          expanded: button.getAttribute('aria-expanded') === 'true',
        },
      }),
    );
  }
}

/** Enhance one connected root. Repeated calls do not bind additional listeners. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const buttons = Array.from(
    root.querySelectorAll<HTMLButtonElement>(TRIGGER),
  ).filter((button) => button.closest(ROOT) === root);
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>('[data-cods-accordion-panel]'),
  ).filter((panel) => panel.closest(ROOT) === root);
  const items: Item[] = [];
  const ids = new Set<string>();
  let valid =
    root.matches(ROOT) &&
    root.classList.contains('usa-accordion') &&
    root.isConnected &&
    buttons.length > 0;
  for (const button of buttons) {
    const id = button.getAttribute('aria-controls');
    const panel = panels.find((candidate) => candidate.id === id);
    const initial =
      button.getAttribute('data-cods-accordion-expanded') ??
      button.getAttribute('aria-expanded');
    if (
      !id ||
      !panel ||
      ids.has(id) ||
      root.ownerDocument.getElementById(id) !== panel ||
      !button.classList.contains('usa-accordion__button') ||
      button.type !== 'button' ||
      !['true', 'false'].includes(initial ?? '')
    ) {
      valid = false;
      break;
    }
    ids.add(id);
    const item: Item = {
      button,
      panel,
      expanded: button.getAttribute('aria-expanded'),
      hidden: panel.getAttribute('hidden'),
      initialExpanded: initial === 'true',
      onClick: () =>
        change(root, item, button.getAttribute('aria-expanded') !== 'true'),
    };
    items.push(item);
  }
  // USWDS toggles all its direct buttons, so they must all be valid CoDS pairs.
  const upstreamButtons = Array.from(
    root.querySelectorAll('.usa-accordion__button[aria-controls]'),
  ).filter((button) => button.closest('.usa-accordion') === root);
  if (
    !valid ||
    panels.length !== items.length ||
    upstreamButtons.length !== items.length
  ) {
    if (!warned.has(root)) {
      console.warn(
        'cods-accordion: expected a connected USWDS root with unique button/panel pairs; markup was left unchanged.',
        root,
      );
      warned.add(root);
    }
    return;
  }
  const instance: Instance = {
    items,
    allowMultiple: root.getAttribute('data-allow-multiple'),
    enhanced: root.getAttribute('data-cods-accordion-enhanced'),
  };
  instances.set(root, instance);
  if (root.hasAttribute('data-cods-accordion-multiple'))
    root.setAttribute('data-allow-multiple', '');
  else root.removeAttribute('data-allow-multiple');
  // Capture focus before hiding content: browsers may move it to the body.
  const focusedItem = items.find(({ panel }) =>
    panel.contains(root.ownerDocument.activeElement),
  );
  // Last initially expanded item wins in single-open mode, as in USWDS init.
  for (const item of items)
    uswdsAccordion.toggle(item.button, item.initialExpanded);
  if (focusedItem?.panel.hidden) focusedItem.button.focus();
  root.setAttribute('data-cods-accordion-enhanced', '');
  for (const item of items) item.button.addEventListener('click', item.onClick);
}

/** Initialize roots within a container, including the container itself. */
export function initAll(container: ParentNode = document): void {
  if (container instanceof HTMLElement && container.matches(ROOT))
    init(container);
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Open or close an owned panel. Unknown/uninitialized/disabled targets are no-ops. */
export function setExpanded(
  root: HTMLElement,
  panelId: string,
  expanded: boolean,
): void {
  const item = instances
    .get(root)
    ?.items.find((item) => item.panel.id === panelId);
  if (item) change(root, item, expanded);
}

/** Remove this root's listeners and restore the authored attributes exactly. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  for (const { button, panel, onClick, expanded, hidden } of instance.items) {
    button.removeEventListener('click', onClick);
    restore(button, 'aria-expanded', expanded);
    restore(panel, 'hidden', hidden);
  }
  restore(root, 'data-allow-multiple', instance.allowMultiple);
  restore(root, 'data-cods-accordion-enhanced', instance.enhanced);
  instances.delete(root);
}
