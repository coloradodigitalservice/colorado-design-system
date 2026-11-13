import uswdsFooter from '@uswds/uswds/js/usa-footer';

const ROOT = '[data-cods-footer]';
const FULL_FOOTER = '.usa-footer--big';
const HEADING = '.usa-footer__primary-link';

export interface FooterChangeDetail {
  group: string;
  expanded: boolean;
}

interface Item {
  heading: HTMLElement;
  panel: HTMLElement;
  panelId: string | null;
  group: string;
}

interface Instance {
  items: Item[];
  beforeClick: (event: MouseEvent) => void;
  afterClick: () => void;
}

const instances = new WeakMap<HTMLElement, Instance>();
const warned = new WeakSet<HTMLElement>();

function restoreId(panel: HTMLElement, id: string | null) {
  if (id === null) panel.removeAttribute('id');
  else panel.setAttribute('id', id);
}

function isHeadingTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(HEADING));
}

function expanded(item: Item): string | null {
  return (
    item.panel.previousElementSibling?.getAttribute('aria-expanded') ?? null
  );
}

/** Enhance one connected Full footer with the pinned USWDS disclosure behavior. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const headings = Array.from(
    root.querySelectorAll<HTMLElement>(HEADING),
  ).filter((heading) => heading.closest(ROOT) === root);
  const items: Item[] = [];
  const groups = new Set<string>();
  let valid =
    root.matches(ROOT) &&
    root.classList.contains('usa-footer') &&
    root.classList.contains('usa-footer--big') &&
    root.isConnected &&
    root.ownerDocument.querySelectorAll(FULL_FOOTER).length === 1 &&
    headings.length > 0;
  for (const heading of headings) {
    const panel = heading.nextElementSibling;
    const navigation = heading.closest('nav');
    const group = heading.getAttribute('data-cods-footer-group');
    if (
      !/^H[1-6]$/.test(heading.tagName) ||
      !navigation ||
      !root.contains(navigation) ||
      !group?.trim() ||
      groups.has(group) ||
      !(panel instanceof HTMLElement) ||
      !panel.classList.contains('usa-list--unstyled')
    ) {
      valid = false;
      break;
    }
    groups.add(group);
    items.push({
      heading,
      panel,
      panelId: panel.getAttribute('id'),
      group,
    });
  }
  if (!valid || items.length !== headings.length) {
    if (!warned.has(root)) {
      console.warn(
        'cods-footer: expected one connected Full footer with at least one uniquely named heading/panel pair inside navigation; markup was left unchanged.',
        root,
      );
      warned.add(root);
    }
    return;
  }

  uswdsFooter.on(root);
  let before: Array<string | null> | null = null;
  const beforeClick = (event: MouseEvent) => {
    if (isHeadingTarget(event.target))
      before = items.map((item) => expanded(item));
  };
  const afterClick = () => {
    if (!before) return;
    for (const [index, item] of items.entries()) {
      const current = expanded(item);
      if (
        current === before[index] ||
        (current !== 'true' && current !== 'false')
      )
        continue;
      root.dispatchEvent(
        new CustomEvent<FooterChangeDetail>('cods-footer:change', {
          bubbles: true,
          composed: false,
          detail: { group: item.group, expanded: current === 'true' },
        }),
      );
    }
    before = null;
  };
  const instance = { items, beforeClick, afterClick };
  instances.set(root, instance);
  root.addEventListener('click', beforeClick, true);
  root.addEventListener('click', afterClick);
}

/** Initialize Full footers within a container, including the container itself. */
export function initAll(container: ParentNode = document): void {
  if (container instanceof HTMLElement && container.matches(ROOT))
    init(container);
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Remove listeners and restore the authored heading and panel markup. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  root.removeEventListener('click', instance.beforeClick, true);
  root.removeEventListener('click', instance.afterClick);
  uswdsFooter.off(root);
  for (const item of instance.items) {
    const heading = item.panel.previousElementSibling;
    if (heading && heading !== item.heading && heading.matches(HEADING))
      heading.replaceWith(item.heading);
    restoreId(item.panel, item.panelId);
  }
  instances.delete(root);
}
