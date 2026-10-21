import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { destroy, init, initAll, type FooterChangeDetail } from './footer.js';
import fixture from './footer.fixture.html?raw';

type MediaListener = (this: MediaQueryList, event: MediaQueryListEvent) => void;

const fullFooter = () =>
  document.querySelector<HTMLElement>('[data-cods-footer]')!;
const headings = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('.usa-footer__primary-link'));
const panels = (root: HTMLElement) =>
  headings(root).map((heading) => heading.nextElementSibling!);

let listeners: Set<MediaListener>;
let mediaQueryList: MediaQueryList;
let originalMatchMedia: PropertyDescriptor | undefined;

beforeEach(() => {
  document.body.innerHTML = fixture;
  window.innerWidth = 1024;
  listeners = new Set();
  originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
  mediaQueryList = {
    media: '(max-width: 479.9px)',
    matches: false,
    onchange: null,
    addListener: (listener) => {
      if (listener) listeners.add(listener);
    },
    removeListener: (listener) => {
      if (listener) listeners.delete(listener);
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => mediaQueryList),
  });
});

afterEach(() => {
  document.querySelectorAll<HTMLElement>('[data-cods-footer]').forEach(destroy);
  document.body.innerHTML = '';
  if (originalMatchMedia)
    Object.defineProperty(window, 'matchMedia', originalMatchMedia);
  else Reflect.deleteProperty(window, 'matchMedia');
  vi.restoreAllMocks();
});

function resize(width: number) {
  window.innerWidth = width;
  const event = {
    matches: width < 480,
    media: mediaQueryList.media,
  } as MediaQueryListEvent;
  for (const listener of listeners) listener.call(mediaQueryList, event);
}

describe('USWDS Footer lifecycle', () => {
  it('keeps every navigation panel visible without JavaScript', () => {
    const root = fullFooter();
    expect(headings(root).every((heading) => heading.tagName === 'H2')).toBe(
      true,
    );
    expect(
      panels(root).every(
        (panel) => panel.getAttribute('aria-expanded') === null,
      ),
    ).toBe(true);
    expect(root.querySelectorAll('[hidden]')).toHaveLength(0);
  });

  it('initializes mobile disclosures and dispatches settled group events', () => {
    const root = fullFooter();
    window.innerWidth = 375;
    const events: FooterChangeDetail[] = [];
    root.addEventListener('cods-footer:change', (event) => {
      events.push((event as CustomEvent<FooterChangeDetail>).detail);
    });
    init(root);

    const buttons = root.querySelectorAll<HTMLButtonElement>(
      'button.usa-footer__primary-link',
    );
    expect(buttons).toHaveLength(4);
    expect(
      Array.from(buttons).map((button) => button.getAttribute('aria-expanded')),
    ).toEqual(['false', 'false', 'false', 'false']);
    expect(buttons[0].getAttribute('aria-controls')).toBe(
      panels(root)[0].getAttribute('id'),
    );

    buttons[0].click();
    buttons[1].click();
    expect(events).toEqual([
      { group: 'services', expanded: true },
      { group: 'services', expanded: false },
      { group: 'government', expanded: true },
    ]);
  });

  it('tracks responsive markup and restores authored nodes on destroy', () => {
    const root = fullFooter();
    const original = root.outerHTML;
    init(root);
    expect(headings(root).every((heading) => heading.tagName === 'H2')).toBe(
      true,
    );
    resize(375);
    expect(
      root.querySelectorAll('button.usa-footer__primary-link'),
    ).toHaveLength(4);
    resize(1024);
    expect(headings(root).every((heading) => heading.tagName === 'H2')).toBe(
      true,
    );
    destroy(root);
    destroy(root);
    expect(root.outerHTML).toBe(original);
    expect(listeners.size).toBe(0);
  });

  it('does not initialize twice or alter Compact footers', () => {
    const root = fullFooter();
    const listener = vi.fn();
    root.addEventListener('cods-footer:change', listener);
    initAll(document);
    const before = root.outerHTML;
    init(root);
    expect(root.outerHTML).toBe(before);
    expect(
      document
        .querySelector('[data-cods-footer-fixture="compact"] .cods-footer')
        ?.querySelectorAll('.usa-footer__primary-link'),
    ).toHaveLength(0);
    expect(listener).not.toHaveBeenCalled();
  });

  it('warns and leaves ambiguous Full footer markup unchanged', () => {
    const root = fullFooter();
    const original = root.outerHTML;
    document.body.append(root.cloneNode(true));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    init(root);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(root.outerHTML).toBe(original);
  });
});
