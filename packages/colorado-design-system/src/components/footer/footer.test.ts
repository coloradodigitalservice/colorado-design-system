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

function setGroupCount(root: HTMLElement, count: number) {
  const list = root.querySelector<HTMLElement>('.cods-footer__groups')!;
  const first = list.firstElementChild!;
  while (list.children.length > count) list.lastElementChild!.remove();
  while (list.children.length < count) {
    const group = first.cloneNode(true) as HTMLElement;
    const heading = group.querySelector<HTMLElement>(
      '.usa-footer__primary-link',
    )!;
    heading.setAttribute(
      'data-cods-footer-group',
      `additional-${list.children.length}`,
    );
    heading.textContent = `Additional group ${list.children.length + 1}`;
    list.append(group);
  }
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

  it.each([1, 2, 3, 5, 8])(
    'enhances and restores %i navigation groups',
    (count) => {
      const root = fullFooter();
      setGroupCount(root, count);
      panels(root)[0].setAttribute('id', 'authored-panel');
      const original = root.outerHTML;
      const events: CustomEvent<FooterChangeDetail>[] = [];
      root.addEventListener('cods-footer:change', (event) => {
        events.push(event as CustomEvent<FooterChangeDetail>);
      });
      window.innerWidth = 375;
      init(root);
      init(root);

      const buttons = Array.from(
        root.querySelectorAll<HTMLButtonElement>(
          'button.usa-footer__primary-link',
        ),
      );
      expect(buttons).toHaveLength(count);
      for (const [index, button] of buttons.entries()) {
        expect(button.getAttribute('aria-expanded')).toBe('false');
        expect(button.getAttribute('aria-controls')).toBe(
          panels(root)[index].getAttribute('id'),
        );
      }

      buttons[0].click();
      if (count > 1) buttons[count - 1].click();
      else buttons[0].click();
      expect(events.map((event) => event.detail)).toEqual(
        count === 1
          ? [
              { group: 'services', expanded: true },
              { group: 'services', expanded: false },
            ]
          : [
              { group: 'services', expanded: true },
              { group: 'services', expanded: false },
              {
                group:
                  count <= 4
                    ? ['services', 'government', 'about', 'contact'][count - 1]
                    : `additional-${count - 1}`,
                expanded: true,
              },
            ],
      );
      expect(events.every((event) => event.bubbles && !event.composed)).toBe(
        true,
      );

      resize(1024);
      expect(headings(root)).toHaveLength(count);
      expect(headings(root).every((heading) => heading.tagName === 'H2')).toBe(
        true,
      );
      resize(375);
      expect(
        root.querySelectorAll('button.usa-footer__primary-link'),
      ).toHaveLength(count);
      destroy(root);
      expect(root.outerHTML).toBe(original);
      expect(listeners.size).toBe(0);
    },
  );

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

  it.each([
    ['no groups', (root: HTMLElement) => setGroupCount(root, 0)],
    [
      'a missing group key',
      (root: HTMLElement) =>
        headings(root)[0].removeAttribute('data-cods-footer-group'),
    ],
    [
      'a blank group key',
      (root: HTMLElement) =>
        headings(root)[0].setAttribute('data-cods-footer-group', '  '),
    ],
    [
      'duplicate group keys',
      (root: HTMLElement) =>
        headings(root)[1].setAttribute('data-cods-footer-group', 'services'),
    ],
    ['a missing panel', (root: HTMLElement) => panels(root)[0].remove()],
    [
      'a panel without the USWDS class',
      (root: HTMLElement) =>
        panels(root)[0].classList.remove('usa-list--unstyled'),
    ],
    [
      'a heading outside the navigation',
      (root: HTMLElement) => {
        const heading = headings(root)[0];
        root.append(heading, heading.nextElementSibling!);
      },
    ],
    [
      'a non-heading control',
      (root: HTMLElement) => {
        const heading = headings(root)[0];
        const replacement = document.createElement('span');
        for (const attribute of heading.attributes)
          replacement.setAttribute(attribute.name, attribute.value);
        replacement.textContent = heading.textContent;
        heading.replaceWith(replacement);
      },
    ],
  ])('warns and preserves markup with %s', (_description, mutate) => {
    const root = fullFooter();
    mutate(root);
    const original = root.outerHTML;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    init(root);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(root.outerHTML).toBe(original);
    expect(listeners.size).toBe(0);
  });
});
