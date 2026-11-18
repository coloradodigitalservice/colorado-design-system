import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { destroy, init, initAll, type HeaderToggleDetail } from './header.js';
import fixture from './header.fixture.html?raw';

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
