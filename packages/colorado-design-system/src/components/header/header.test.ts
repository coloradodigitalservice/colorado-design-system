import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { destroy, init, initAll, type HeaderToggleDetail } from './header.js';
import fixtures from './header.fixture.html?raw';

/** One fixture state; a document supports one header. */
function fixtureState(state: string): string {
  const template = document.createElement('template');
  template.innerHTML = fixtures;
  return template.content.querySelector(`[data-cods-fixture-state="${state}"]`)!
    .outerHTML;
}
const fixture = fixtureState('default');

const header = () => document.querySelector<HTMLElement>('[data-cods-header]')!;
const menuButton = () =>
  document.querySelector<HTMLButtonElement>('.cods-header__menu-button')!;
const closeButton = () =>
  document.querySelector<HTMLButtonElement>('.cods-header__close')!;
const nav = () => document.querySelector<HTMLElement>('.cods-header__nav')!;
const overlay = () =>
  document.querySelector<HTMLElement>('.cods-header__overlay')!;
const isOpen = () =>
  document.body.classList.contains('usa-js-mobile-nav--active');
/** MutationObserver callbacks run as microtasks after the click handler. */
const settle = () => new Promise((resolve) => setTimeout(resolve));

function render(markup = fixture) {
  document.body.innerHTML = `<div id="layout"><div id="shell">${markup}</div></div><main id="main">Page content</main>`;
}

function recordEvents(root: HTMLElement) {
  const events: Array<{ type: string; detail: HeaderToggleDetail }> = [];
  for (const type of ['cods-header:open', 'cods-header:close'])
    root.addEventListener(type, (event) =>
      events.push({
        type,
        detail: (event as CustomEvent<HeaderToggleDetail>).detail,
      }),
    );
  return events;
}

beforeEach(() => render());

afterEach(() => {
  document.querySelectorAll<HTMLElement>('[data-cods-header]').forEach(destroy);
  document.body.innerHTML = '';
  document.body.className = '';
  document.body.removeAttribute('style');
  vi.restoreAllMocks();
});

describe('Header markup without JavaScript', () => {
  it('controls a labelled navigation without claiming an expanded state', () => {
    expect(nav().getAttribute('aria-label')).toBe('Primary');
    expect(menuButton().getAttribute('aria-controls')).toBe(nav().id);
    expect(menuButton().hasAttribute('aria-expanded')).toBe(false);
    expect(header().hasAttribute('data-cods-header-enhanced')).toBe(false);
  });
});

describe('USWDS Header lifecycle', () => {
  it('marks the header enhanced and the menu collapsed', () => {
    init(header());
    expect(header().hasAttribute('data-cods-header-enhanced')).toBe(true);
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(isOpen()).toBe(false);
  });

  it('opens and closes the drawer with the menu and close buttons', async () => {
    const root = header();
    init(root);
    const events = recordEvents(root);

    menuButton().click();
    await settle();
    expect(isOpen()).toBe(true);
    expect(nav().classList).toContain('is-visible');
    expect(overlay().classList).toContain('is-visible');
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(closeButton());

    closeButton().click();
    await settle();
    expect(isOpen()).toBe(false);
    expect(nav().classList).not.toContain('is-visible');
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton());
    expect(events).toEqual([
      { type: 'cods-header:open', detail: { open: true } },
      { type: 'cods-header:close', detail: { open: false } },
    ]);
  });

  it('closes from the overlay, a navigation link, and Escape', async () => {
    init(header());
    const closers: Array<() => void> = [
      () => overlay().click(),
      () => {
        const link = nav().querySelector<HTMLAnchorElement>('a[href]')!;
        link.addEventListener('click', (event) => event.preventDefault(), {
          once: true,
        });
        link.click();
      },
      () =>
        closeButton().dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        ),
    ];
    for (const close of closers) {
      menuButton().click();
      await settle();
      expect(isOpen()).toBe(true);
      close();
      await settle();
      expect(isOpen()).toBe(false);
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('keeps the open navigation exposed when the header is nested', async () => {
    init(header());
    menuButton().click();
    await settle();
    for (const id of ['layout', 'shell'])
      expect(document.getElementById(id)!.hasAttribute('aria-hidden')).toBe(
        false,
      );
    expect(document.getElementById('main')!.getAttribute('aria-hidden')).toBe(
      'true',
    );

    closeButton().click();
    await settle();
    expect(
      document.querySelectorAll('[aria-hidden][data-nav-hidden]'),
    ).toHaveLength(0);
  });

  it('is idempotent and safe to destroy without init', () => {
    const root = header();
    expect(() => destroy(root)).not.toThrow();
    init(root);
    init(root);
    menuButton().click();
    expect(isOpen()).toBe(true);
    closeButton().click();
    expect(isOpen()).toBe(false);
  });

  it('closes an open drawer, removes listeners, and restores markup on destroy', async () => {
    const root = header();
    const before = root.outerHTML;
    init(root);
    const events = recordEvents(root);
    menuButton().click();
    await settle();
    events.length = 0;

    destroy(root);
    await settle();
    expect(isOpen()).toBe(false);
    expect(document.querySelectorAll('[data-nav-hidden]')).toHaveLength(0);
    expect(root.outerHTML).toBe(before);
    expect(events).toEqual([]);
    menuButton().click();
    expect(isOpen()).toBe(false);
  });

  it('initializes from a container, including the container itself', () => {
    initAll(document);
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    destroy(header());
    initAll(header());
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Header failure behavior', () => {
  it.each([
    [
      'a second header',
      () =>
        document.body.insertAdjacentHTML(
          'beforeend',
          '<header class="usa-header"></header>',
        ),
    ],
    ['a disconnected header', () => header().remove()],
    ['no aria-controls', () => menuButton().removeAttribute('aria-controls')],
    ['no navigation label', () => nav().removeAttribute('aria-label')],
    ['no close button', () => closeButton().remove()],
    ['no overlay', () => overlay().remove()],
    ['no links', () => nav().querySelector('ul')!.remove()],
  ])('warns once and leaves markup unchanged with %s', (_, breakIt) => {
    const root = header();
    breakIt();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const before = root.outerHTML;
    init(root);
    init(root);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(root.outerHTML).toBe(before);
    expect(root.hasAttribute('data-cods-header-enhanced')).toBe(false);
  });
});

describe('Header review fixes', () => {
  it('keeps Menu and its expanded state exposed while the drawer is open', async () => {
    init(header());
    menuButton().click();
    await settle();
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    for (
      let element: HTMLElement | null = menuButton();
      element && element !== header();
      element = element.parentElement
    )
      expect(element.hasAttribute('aria-hidden')).toBe(false);
    expect(
      document.querySelector('.cods-header__logo')!.getAttribute('aria-hidden'),
    ).toBe('true');
    expect(document.getElementById('main')!.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('restores the page body padding after closing and after destroy', async () => {
    document.body.style.paddingRight = '12px';
    init(header());
    menuButton().click();
    await settle();
    closeButton().click();
    await settle();
    expect(document.body.style.paddingRight).toBe('12px');
    menuButton().click();
    await settle();
    destroy(header());
    expect(document.body.style.paddingRight).toBe('12px');
  });

  it('keeps the page body padding priority', async () => {
    document.body.style.setProperty('padding-right', '32px', 'important');
    init(header());
    menuButton().click();
    await settle();
    expect(document.body.style.getPropertyPriority('padding-right')).toBe(
      'important',
    );
    closeButton().click();
    await settle();
    expect(document.body.style.getPropertyValue('padding-right')).toBe('32px');
    expect(document.body.style.getPropertyPriority('padding-right')).toBe(
      'important',
    );
  });

  it('leaves body padding unset when the page had none', async () => {
    init(header());
    menuButton().click();
    await settle();
    closeButton().click();
    await settle();
    expect(document.body.style.paddingRight).toBe('');
  });
});

describe('Header submenus', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    render(fixtureState('full'));
  });

  const buttons = () => [
    ...document.querySelectorAll<HTMLButtonElement>('.cods-header__toggle'),
  ];
  const panel = (button: HTMLButtonElement) =>
    document.getElementById(button.getAttribute('aria-controls')!)!;

  it('shows every submenu without JavaScript', () => {
    expect(buttons()).toHaveLength(3);
    for (const button of buttons()) expect(panel(button).hidden).toBe(false);
  });

  it('collapses submenus on init and opens one at a time', () => {
    init(header());
    for (const button of buttons()) {
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(panel(button).hidden).toBe(true);
    }
    const [services, licenses] = buttons();
    services.click();
    expect(services.getAttribute('aria-expanded')).toBe('true');
    expect(panel(services).hidden).toBe(false);
    licenses.click();
    expect(services.getAttribute('aria-expanded')).toBe('false');
    expect(panel(services).hidden).toBe(true);
    expect(panel(licenses).hidden).toBe(false);
  });

  it('closes an open submenu with Escape and returns focus to its button', () => {
    init(header());
    const [services] = buttons();
    services.click();
    const link = panel(services).querySelector('a')!;
    link.focus();
    link.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(panel(services).hidden).toBe(true);
    expect(document.activeElement).toBe(services);
  });

  it('closes an open submenu when its button is selected again', () => {
    init(header());
    const [services] = buttons();
    services.click();
    services.click();
    expect(services.getAttribute('aria-expanded')).toBe('false');
    expect(panel(services).hidden).toBe(true);
    services.click();
    expect(panel(services).hidden).toBe(false);
  });

  it('in the drawer, Escape closes only the submenu', async () => {
    init(header());
    menuButton().click();
    await settle();
    const [services] = buttons();
    services.click();
    const link = panel(services).querySelector('a')!;
    link.focus();
    link.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(panel(services).hidden).toBe(true);
    expect(document.activeElement).toBe(services);
    expect(isOpen()).toBe(true);
  });

  it('wraps Tab from a collapsed last submenu button to Close', async () => {
    document.querySelector('.cods-header__list > li:last-child')!.remove();
    init(header());
    menuButton().click();
    await settle();
    const last = buttons().at(-1)!;
    last.focus();
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    last.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(closeButton());
  });

  it('restores authored submenu markup on destroy', () => {
    const before = header().outerHTML;
    init(header());
    buttons()[0].click();
    destroy(header());
    expect(header().outerHTML).toBe(before);
  });
});
