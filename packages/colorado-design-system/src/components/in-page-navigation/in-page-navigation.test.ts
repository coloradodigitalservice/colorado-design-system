import { afterEach, describe, expect, it, vi } from 'vitest';
import fixtureHtml from './in-page-navigation.fixture.html?raw';
import { destroy, init, initAll } from './in-page-navigation.js';

let callbacks: IntersectionObserverCallback[] = [];
const disconnect = vi.fn();
const observe = vi.fn();
class Observer {
  constructor(fn: IntersectionObserverCallback) {
    callbacks.push(fn);
  }
  observe = observe;
  disconnect = disconnect;
}

function fixture() {
  document.body.innerHTML = fixtureHtml;
  const root = document.querySelector<HTMLElement>(
    '[data-cods-in-page-navigation]',
  )!;
  const links = [...root.querySelectorAll('a')];
  const targets = links.map((link) =>
    document.getElementById(link.hash.slice(1))!,
  );
  const positions = [0, 1000, 2000];
  targets.forEach((target, i) => {
    vi.spyOn(target, 'getClientRects').mockReturnValue([
      {},
    ] as unknown as DOMRectList);
    vi.spyOn(target, 'getBoundingClientRect').mockImplementation(
      () => ({ top: positions[i], bottom: positions[i]! + 50 }) as DOMRect,
    );
  });
  return { root, positions, links };
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  callbacks = [];
  disconnect.mockReset();
  observe.mockReset();
});

describe('in-page navigation', () => {
  it('tracks targets without moving focus and restores authored state on destroy', () => {
    vi.stubGlobal('IntersectionObserver', Observer);
    const { root, positions, links } = fixture();
    links[0]!.setAttribute('aria-current', 'page');
    const changes = vi.fn();
    root.addEventListener('cods-in-page-navigation:change', changes);
    links[0]!.focus();
    init(root);
    init(root);
    expect(observe).toHaveBeenCalledTimes(4);
    expect(links[0]!.getAttribute('aria-current')).toBe('location');
    expect(changes).not.toHaveBeenCalled();
    positions[1] = 0;
    callbacks[0]!([], {} as IntersectionObserver);
    expect(links[0]!.hasAttribute('aria-current')).toBe(false);
    expect(links[1]!.getAttribute('aria-current')).toBe('location');
    expect(document.activeElement).toBe(links[0]);
    expect(changes).toHaveBeenCalledOnce();
    expect(changes.mock.calls[0]![0].detail).toEqual({ id: 'payment-amounts' });
    destroy(root);
    destroy(root);
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(links[0]!.getAttribute('aria-current')).toBe('page');
    expect(links[1]!.hasAttribute('aria-current')).toBe(false);
    callbacks[0]!([], {} as IntersectionObserver);
    expect(changes).toHaveBeenCalledOnce();
  });
  it('selects a short final section when it becomes fully visible', () => {
    vi.stubGlobal('IntersectionObserver', Observer);
    vi.stubGlobal('scrollY', 500);
    const { root, positions, links } = fixture();
    init(root);
    positions[0] = -1000;
    positions[1] = -200;
    positions[2] = 300;
    callbacks[1]!([], {} as IntersectionObserver);
    expect(links[2]!.getAttribute('aria-current')).toBe('location');
    destroy(root);
  });
  it('leaves all links untouched if a target is missing', () => {
    vi.stubGlobal('IntersectionObserver', Observer);
    const { root, links } = fixture();
    links[1]!.href = '#missing';
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    initAll(root);
    expect(warning).toHaveBeenCalledOnce();
    expect(observe).not.toHaveBeenCalled();
    expect(links[0]!.hasAttribute('aria-current')).toBe(false);
  });
  it('keeps native links usable when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { root, links } = fixture();
    init(root);
    expect(links[1]!.getAttribute('href')).toBe('#payment-amounts');
    expect(links[0]!.hasAttribute('aria-current')).toBe(false);
  });
});
