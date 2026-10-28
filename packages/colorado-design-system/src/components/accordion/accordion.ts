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
  currentExpanded: string | null;
}

interface Instance {
  items: Item[];
  allowMultiple: string | null;
  enhanced: string | null;
  observer: MutationObserver;
  beforeClick: (event: Event) => void;
  afterClick: () => void;
  focusedElement: Element | null;
}

const instances = new WeakMap<HTMLElement, Instance>();
const warned = new WeakSet<HTMLElement>();

function restore(element: HTMLElement, name: string, value: string | null) {
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}

// Observe USWDS's attributes, including sibling side effects. Explicit API and
// click paths flush the observer before returning, preserving synchronous events.
function settle(root: HTMLElement) {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.takeRecords();
  const changes = instance.items.filter(
    (item) =>
      item.currentExpanded !== item.button.getAttribute('aria-expanded'),
  );
  const focusedElement =
    instance.focusedElement ?? root.ownerDocument.activeElement;
  instance.focusedElement = null;
  for (const item of changes) {
    item.currentExpanded = item.button.getAttribute('aria-expanded');
    if (item.currentExpanded === 'false' && item.panel.contains(focusedElement))
      item.button.focus();
  }
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
    !root.classList.contains('usa-accordion__button') &&
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
      currentExpanded: button.getAttribute('aria-expanded'),
    };
    items.push(item);
  }
  // USWDS toggles all its direct buttons, so they must all be valid CoDS pairs.
  const upstreamButtons = Array.from(
    root.querySelectorAll(uswdsAccordion.BUTTON),
  ).filter((button) => button.closest('.usa-accordion') === root);
  if (
    !valid ||
    root.querySelector(`${ROOT}, ${uswdsAccordion.ACCORDION}`) !== null ||
    Boolean(
      root.parentElement?.closest(`${ROOT}, ${uswdsAccordion.ACCORDION}`),
    ) ||
    panels.length !== items.length ||
    upstreamButtons.length !== items.length
  ) {
    if (!warned.has(root)) {
      console.warn(
        'cods-accordion: expected a connected, non-nested USWDS root with unique button/panel pairs; markup was left unchanged.',
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
    observer: new MutationObserver(() => settle(root)),
    focusedElement: null,
    beforeClick: (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(uswdsAccordion.BUTTON)
          : null;
      if (!(target instanceof HTMLButtonElement)) return;
      if (target.disabled) {
        event.stopImmediatePropagation();
        return;
      }
      instance.focusedElement = root.ownerDocument.activeElement;
    },
    afterClick: () => settle(root),
  };
  instances.set(root, instance);
  if (root.hasAttribute('data-cods-accordion-multiple'))
    root.setAttribute('data-allow-multiple', '');
  else root.removeAttribute('data-allow-multiple');
  // Capture focus before hiding content: browsers may move it to the body.
  const focusedItem = items.find(({ panel }) =>
    panel.contains(root.ownerDocument.activeElement),
  );
  // Seed declared enhancement states before USWDS initializes its own behavior.
  const lastExpanded = [...items]
    .reverse()
    .find((item) => item.initialExpanded);
  for (const item of items)
    item.button.setAttribute(
      'aria-expanded',
      String(
        item.initialExpanded &&
          (root.hasAttribute('data-cods-accordion-multiple') ||
            item === lastExpanded),
      ),
    );
  root.addEventListener('click', instance.beforeClick);
  uswdsAccordion.on(root);
  if (focusedItem?.panel.hidden) focusedItem.button.focus();
  root.setAttribute('data-cods-accordion-enhanced', '');
  for (const item of items)
    item.currentExpanded = item.button.getAttribute('aria-expanded');
  instance.observer.observe(root, {
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-expanded'],
  });
  root.addEventListener('click', instance.afterClick);
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
  if (!item || item.button.disabled) return;
  instances.get(root)!.focusedElement = root.ownerDocument.activeElement;
  uswdsAccordion.toggle(item.button, expanded);
  settle(root);
}

/** Remove this root's listeners and restore the authored attributes exactly. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.disconnect();
  root.removeEventListener('click', instance.beforeClick);
  uswdsAccordion.off(root);
  root.removeEventListener('click', instance.afterClick);
  for (const { button, panel, expanded, hidden } of instance.items) {
    restore(button, 'aria-expanded', expanded);
    restore(panel, 'hidden', hidden);
  }
  restore(root, 'data-allow-multiple', instance.allowMultiple);
  restore(root, 'data-cods-accordion-enhanced', instance.enhanced);
  instances.delete(root);
}
