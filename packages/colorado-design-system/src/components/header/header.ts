import uswdsHeader from '@uswds/uswds/js/usa-header';

const ROOT = '[data-cods-header]';
const HEADER = '.usa-header';
const NAV = '.usa-nav';
const MENU_BUTTON = '.usa-menu-btn';
const CLOSE_BUTTON = '.usa-nav__close';
const OVERLAY = '.usa-overlay';
/** USWDS's body class while the mobile navigation is open. */
const ACTIVE = 'usa-js-mobile-nav--active';
/** USWDS marks the elements it hides from assistive technology with this. */
const NAV_HIDDEN = 'data-nav-hidden';
/** Set while enhanced; the stylesheet keeps the navigation visible without it. */
const ENHANCED = 'data-cods-header-enhanced';
const SAFARI = 'is-safari';

/** Payload for the bubbling cods-header:open and cods-header:close events. */
export interface HeaderToggleDetail {
  open: boolean;
}

interface Instance {
  menuButton: HTMLButtonElement;
  /** Authored `aria-expanded`; the controller owns it while enhanced. */
  expanded: string | null;
  /** Whether `<body>` already carried USWDS's Safari class before `init`. */
  safari: boolean;
  observer: MutationObserver;
  open: boolean;
}

const instances = new WeakMap<HTMLElement, Instance>();
const warned = new WeakSet<HTMLElement>();

function warn(root: HTMLElement, reason: string): void {
  if (warned.has(root)) return;
  warned.add(root);
  console.warn(`cods-header: ${reason}; markup was left unchanged.`, root);
}

function isOpen(root: HTMLElement): boolean {
  return root.ownerDocument.body.classList.contains(ACTIVE);
}

/**
 * USWDS hides every element outside the header from assistive technology while
 * the mobile navigation is open, but only spares the header's direct parent.
 * Un-hide the header's other ancestors so the open navigation stays exposed
 * when the header is nested (for example inside a layout wrapper).
 */
function exposeAncestors(root: HTMLElement): void {
  for (
    let ancestor = root.parentElement;
    ancestor && ancestor !== root.ownerDocument.body;
    ancestor = ancestor.parentElement
  ) {
    if (!ancestor.hasAttribute(NAV_HIDDEN)) continue;
    ancestor.removeAttribute('aria-hidden');
    ancestor.removeAttribute(NAV_HIDDEN);
  }
}

/** Mirror USWDS's open state onto the menu button and emit CoDS events. */
function sync(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.takeRecords();
  const open = isOpen(root);
  instance.menuButton.setAttribute('aria-expanded', String(open));
  if (open) exposeAncestors(root);
  if (open === instance.open) return;
  instance.open = open;
  root.dispatchEvent(
    new CustomEvent<HeaderToggleDetail>(
      open ? 'cods-header:open' : 'cods-header:close',
      { bubbles: true, composed: false, detail: { open } },
    ),
  );
}

/**
 * Enhance the document's one connected basic header with the pinned USWDS
 * mobile navigation behavior. Invalid markup is left untouched.
 */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const document_ = root.ownerDocument;
  const nav = root.querySelector<HTMLElement>(NAV);
  const menuButton = root.querySelector<HTMLButtonElement>(MENU_BUTTON);
  const controls = menuButton?.getAttribute('aria-controls');
  if (
    !root.matches(ROOT) ||
    !root.matches(HEADER) ||
    !root.isConnected ||
    // USWDS keeps module-level state and resolves the header with
    // `document.querySelector`, so it supports one header per document.
    document_.querySelectorAll(HEADER).length !== 1 ||
    !nav ||
    !nav.id ||
    !nav.getAttribute('aria-label')?.trim() ||
    !menuButton ||
    controls !== nav.id ||
    !root.querySelector(CLOSE_BUTTON) ||
    !root.querySelector(OVERLAY) ||
    !nav.querySelector('a[href]')
  ) {
    warn(
      root,
      'expected the only .usa-header in the document, containing an overlay, a menu button whose aria-controls names a labelled .usa-nav, a close button, and at least one link',
    );
    return;
  }

  const instance: Instance = {
    menuButton,
    expanded: menuButton.getAttribute('aria-expanded'),
    safari: document_.body.classList.contains(SAFARI),
    observer: new MutationObserver(() => sync(root)),
    open: isOpen(root),
  };
  instances.set(root, instance);
  uswdsHeader.on(root);
  root.setAttribute(ENHANCED, '');
  menuButton.setAttribute('aria-expanded', String(instance.open));
  // Observe after `on`, so USWDS's own setup emits nothing.
  instance.observer.observe(document_.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

/** Initialize the header within a container, including the container itself. */
export function initAll(container: ParentNode = document): void {
  if (container instanceof HTMLElement && container.matches(ROOT))
    init(container);
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Close the mobile navigation, remove listeners, and restore authored markup. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.disconnect();
  // USWDS's teardown leaves an open navigation, its focus trap, and the
  // hidden page content in place, so close it first.
  if (isOpen(root)) uswdsHeader.toggleNav(false);
  uswdsHeader.off(root);
  root.removeAttribute(ENHANCED);
  if (instance.expanded === null)
    instance.menuButton.removeAttribute('aria-expanded');
  else instance.menuButton.setAttribute('aria-expanded', instance.expanded);
  if (!instance.safari) root.ownerDocument.body.classList.remove(SAFARI);
  instances.delete(root);
}
