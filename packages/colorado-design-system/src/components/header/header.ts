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
/** Submenu buttons USWDS toggles; each `aria-controls` names its submenu. */
const SUBMENU_BUTTON = 'button.usa-nav__link[aria-controls]';
const FOCUSABLE = 'a[href], button:not([disabled])';
/** Everything USWDS's focus trap treats as focusable. */
const TABBABLE =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

/** Payload for the bubbling cods-header:open and cods-header:close events. */
export interface HeaderToggleDetail {
  open: boolean;
}

interface Submenu {
  button: HTMLButtonElement;
  panel: HTMLElement;
  expanded: string | null;
  hidden: boolean;
}

/** The page's `<body>` padding before the drawer opened. */
interface Padding {
  inline: string;
  /** `important` when the page set the inline padding with `!important`. */
  priority: string;
  computed: string;
  scrollbar: number;
}

interface Instance {
  nav: HTMLElement;
  menuButton: HTMLButtonElement;
  /** Authored `aria-expanded`; the controller owns it while enhanced. */
  expanded: string | null;
  /** Whether `<body>` already carried USWDS's Safari class before `init`. */
  safari: boolean;
  observer: MutationObserver;
  open: boolean;
  submenus: Submenu[];
  padding: Padding;
  /** The last element focused inside the open drawer. */
  lastFocus: HTMLElement | null;
  onFocusIn: (event: FocusEvent) => void;
  onFocusOut: (event: FocusEvent) => void;
  onBeforeToggle: () => void;
  onClick: (event: MouseEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onDocumentClick: (event: MouseEvent) => void;
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

/**
 * USWDS hides the menu button with the rest of the page while the drawer is
 * open, so its expanded state never reaches assistive technology. Keep the
 * button and its ancestors in the accessibility tree; their other contents,
 * such as the logo, stay hidden.
 */
function exposeMenuButton(root: HTMLElement, button: HTMLElement): void {
  for (
    let element: HTMLElement | null = button;
    element && element !== root;
    element = element.parentElement
  ) {
    if (!element.hasAttribute(NAV_HIDDEN)) continue;
    element.removeAttribute('aria-hidden');
    element.removeAttribute(NAV_HIDDEN);
  }
}

function measurePadding(document_: Document): Padding {
  const { body, documentElement } = document_;
  const view = document_.defaultView!;
  return {
    inline: body.style.paddingRight,
    priority: body.style.getPropertyPriority('padding-right'),
    computed: view.getComputedStyle(body).paddingRight,
    scrollbar: Math.max(0, view.innerWidth - documentElement.clientWidth),
  };
}

/**
 * USWDS replaces `<body>`'s right padding with values it measured when its
 * module loaded. Compensate for the scrollbar from the page's own padding
 * instead, and restore the page's inline value when the drawer closes.
 */
function applyPadding(root: HTMLElement, instance: Instance): void {
  const { inline, computed, scrollbar } = instance.padding;
  setPadding(
    root,
    instance,
    instance.open && scrollbar > 0
      ? `calc(${computed} + ${scrollbar}px)`
      : inline,
  );
}

/** Set `<body>`'s right padding, keeping the page's `!important` priority. */
function setPadding(
  root: HTMLElement,
  instance: Instance,
  value: string,
): void {
  const { style } = root.ownerDocument.body;
  if (value)
    style.setProperty('padding-right', value, instance.padding.priority);
  else style.removeProperty('padding-right');
}

/** Whether a control can take focus now; USWDS's trap also lists hidden ones. */
function tabbable(element: HTMLElement): boolean {
  if (
    (element.hasAttribute('tabindex') && element.tabIndex < 0) ||
    element.closest('[hidden], [inert]')
  )
    return false;
  return typeof element.checkVisibility === 'function'
    ? element.checkVisibility({ visibilityProperty: true })
    : true;
}

/** Keep Tab and Shift+Tab within the drawer's currently visible controls. */
function trapTab(event: KeyboardEvent, instance: Instance): void {
  const stops = [
    ...instance.nav.querySelectorAll<HTMLElement>(TABBABLE),
  ].filter(tabbable);
  if (!stops.length) return;
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  const active = instance.nav.ownerDocument.activeElement;
  let target: HTMLElement | null = null;
  if (
    event.shiftKey &&
    (active === first || !stops.includes(active as HTMLElement))
  )
    target = last;
  else if (!event.shiftKey && active === last) target = first;
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  target.focus();
}

function setSubmenu(submenu: Submenu, open: boolean): void {
  submenu.button.setAttribute('aria-expanded', String(open));
  submenu.panel.hidden = !open;
}

function closeSubmenus(instance: Instance, except?: Submenu): void {
  for (const submenu of instance.submenus)
    if (submenu !== except) setSubmenu(submenu, false);
}

function openSubmenu(instance: Instance): Submenu | undefined {
  return instance.submenus.find(
    ({ button }) => button.getAttribute('aria-expanded') === 'true',
  );
}

function visible(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.getClientRects().length > 0;
}

/**
 * When a wider window closes the drawer, USWDS focuses Menu only if it is
 * still displayed. Otherwise keep focus where it was, or on the first
 * navigation control, instead of losing it to the page.
 */
function restoreFocus(root: HTMLElement, instance: Instance): void {
  const active = root.ownerDocument.activeElement;
  if (visible(active) && active !== root.ownerDocument.body) return;
  if (visible(instance.menuButton)) return;
  const target = visible(instance.lastFocus)
    ? instance.lastFocus
    : [...instance.nav.querySelectorAll<HTMLElement>(FOCUSABLE)].find(visible);
  target?.focus();
}

/** Mirror USWDS's open state onto the menu button and emit CoDS events. */
function sync(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.takeRecords();
  const open = isOpen(root);
  instance.menuButton.setAttribute('aria-expanded', String(open));
  if (open) {
    exposeAncestors(root);
    exposeMenuButton(root, instance.menuButton);
  }
  if (open === instance.open) return;
  instance.open = open;
  applyPadding(root, instance);
  if (open) instance.lastFocus = null;
  else {
    closeSubmenus(instance);
    restoreFocus(root, instance);
  }
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

  const submenus = [
    ...nav.querySelectorAll<HTMLButtonElement>(SUBMENU_BUTTON),
  ].flatMap((button): Submenu[] => {
    const panel = document_.getElementById(
      button.getAttribute('aria-controls')!,
    );
    if (!panel || !nav.contains(panel)) return [];
    return [
      {
        button,
        panel,
        expanded: button.getAttribute('aria-expanded'),
        hidden: panel.hasAttribute('hidden'),
      },
    ];
  });

  const instance: Instance = {
    nav,
    menuButton,
    expanded: menuButton.getAttribute('aria-expanded'),
    safari: document_.body.classList.contains(SAFARI),
    observer: new MutationObserver(() => sync(root)),
    open: isOpen(root),
    submenus,
    padding: measurePadding(document_),
    lastFocus: null,
    onFocusIn: (event) => {
      if (instance.open && event.target instanceof HTMLElement)
        instance.lastFocus = event.target;
    },
    onFocusOut: (event) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !nav.contains(event.relatedTarget)
      )
        closeSubmenus(instance);
    },
    // USWDS can't close an open submenu without its accordion behavior.
    onClick: (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const submenu = instance.submenus.find(({ button }) =>
        button.contains(target),
      );
      if (submenu) {
        const open = submenu.button.getAttribute('aria-expanded') !== 'true';
        closeSubmenus(instance, submenu);
        setSubmenu(submenu, open);
        return;
      }
      if (target?.closest('a[href]')) closeSubmenus(instance);
    },
    onKeyDown: (event) => {
      if (event.key === 'Tab' && isOpen(root)) {
        trapTab(event, instance);
        return;
      }
      if (event.key !== 'Escape' && event.key !== 'Esc') return;
      const submenu = openSubmenu(instance);
      const target = event.target instanceof Node ? event.target : null;
      if (
        !submenu ||
        !(submenu.button.contains(target) || submenu.panel.contains(target))
      )
        return;
      // Otherwise USWDS also closes the drawer.
      event.preventDefault();
      event.stopPropagation();
      setSubmenu(submenu, false);
      submenu.button.focus();
    },
    onDocumentClick: (event) => {
      if (!(event.target instanceof Node) || !nav.contains(event.target))
        closeSubmenus(instance);
    },
    // Runs before USWDS's delegated handler, so it sees the closed page.
    onBeforeToggle: () => {
      if (!isOpen(root)) instance.padding = measurePadding(document_);
    },
  };
  instances.set(root, instance);
  // Submenus stay open in the page flow without JavaScript.
  for (const { button, panel } of submenus) {
    button.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }
  nav.addEventListener('focusin', instance.onFocusIn);
  nav.addEventListener('focusout', instance.onFocusOut);
  nav.addEventListener('click', instance.onClick);
  // Capture runs before USWDS's key handlers.
  nav.addEventListener('keydown', instance.onKeyDown, true);
  document_.addEventListener('click', instance.onDocumentClick);
  menuButton.addEventListener('click', instance.onBeforeToggle, true);
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
  if (isOpen(root)) {
    uswdsHeader.toggleNav(false);
    setPadding(root, instance, instance.padding.inline);
  }
  uswdsHeader.off(root);
  instance.nav.removeEventListener('focusin', instance.onFocusIn);
  instance.nav.removeEventListener('focusout', instance.onFocusOut);
  instance.nav.removeEventListener('click', instance.onClick);
  instance.nav.removeEventListener('keydown', instance.onKeyDown, true);
  root.ownerDocument.removeEventListener('click', instance.onDocumentClick);
  instance.menuButton.removeEventListener(
    'click',
    instance.onBeforeToggle,
    true,
  );
  for (const { button, panel, expanded, hidden } of instance.submenus) {
    if (expanded === null) button.removeAttribute('aria-expanded');
    else button.setAttribute('aria-expanded', expanded);
    panel.toggleAttribute('hidden', hidden);
  }
  root.removeAttribute(ENHANCED);
  if (instance.expanded === null)
    instance.menuButton.removeAttribute('aria-expanded');
  else instance.menuButton.setAttribute('aria-expanded', instance.expanded);
  if (!instance.safari) root.ownerDocument.body.classList.remove(SAFARI);
  instances.delete(root);
}
