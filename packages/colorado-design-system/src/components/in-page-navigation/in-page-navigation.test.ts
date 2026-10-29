import { afterEach, describe, expect, it, vi } from 'vitest';
import fixtureHtml from './in-page-navigation.fixture.html?raw';
import { destroy, init, initAll } from './in-page-navigation.js';

let callbacks: FrameRequestCallback[] = [];
function fixture() {
  document.body.innerHTML = fixtureHtml;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  const root = document.querySelector<HTMLElement>(
    '[data-cods-in-page-navigation]',
  )!;
  const links = [...root.querySelectorAll('a')];
  const positions = [0, 1000, 2000];
  links.forEach((link, i) => {
    const target = document.getElementById(link.hash.slice(1))!;
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
});

describe('in-page navigation', () => {
  it('coalesces scroll updates, preserves focus and restores authored state', () => {
    const { root, positions, links } = fixture();
    links[0]!.setAttribute('aria-current', 'page');
    const changes = vi.fn();
    root.addEventListener('cods-in-page-navigation:change', changes);
    links[0]!.focus();
    init(root);
    init(root);
    expect(links[0]!.getAttribute('aria-current')).toBe('location');
    expect(changes).not.toHaveBeenCalled();
    positions[1] = -400;
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(callbacks).toHaveLength(1);
    callbacks[0]!(0);
    expect(links[0]!.hasAttribute('aria-current')).toBe(false);
    expect(links[1]!.getAttribute('aria-current')).toBe('location');
    expect(document.activeElement).toBe(links[0]);
    expect(changes).toHaveBeenCalledOnce();
    expect(changes.mock.calls[0]![0].detail).toEqual({ id: 'payment-amounts' });
    window.dispatchEvent(new Event('scroll'));
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    destroy(root);
    destroy(root);
    expect(cancel).toHaveBeenCalledWith(2);
    expect(links[0]!.getAttribute('aria-current')).toBe('page');
    expect(links[1]!.hasAttribute('aria-current')).toBe(false);
    callbacks[1]!(0);
    window.dispatchEvent(new Event('scroll'));
    expect(callbacks).toHaveLength(2);
    expect(changes).toHaveBeenCalledOnce();
  });
  it('updates on resize and selects a fully visible final section', () => {
    vi.stubGlobal('scrollY', 500);
    const { root, positions, links } = fixture();
    init(root);
    positions[0] = -1000;
    positions[1] = -200;
    positions[2] = 300;
    window.dispatchEvent(new Event('resize'));
    callbacks[0]!(0);
    expect(links[2]!.getAttribute('aria-current')).toBe('location');
    destroy(root);
  });
  it('removes listeners from the original window if the root moves to another document', () => {
    const { root } = fixture();
    const remove = vi.spyOn(window, 'removeEventListener');
    init(root);
    const frame = document.createElement('iframe');
    document.body.append(frame);
    frame.contentDocument!.adoptNode(root);
    destroy(root);
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
  it('leaves all links untouched if a target is missing', () => {
    const { root, links } = fixture();
    links[1]!.href = '#missing';
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const add = vi.spyOn(window, 'addEventListener');
    initAll(root);
    expect(warning).toHaveBeenCalledOnce();
    expect(add).not.toHaveBeenCalled();
    expect(links[0]!.hasAttribute('aria-current')).toBe(false);
  });
});
