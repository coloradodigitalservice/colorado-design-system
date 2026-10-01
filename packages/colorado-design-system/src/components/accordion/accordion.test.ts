import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { init, initAll, destroy, setExpanded } from './accordion.js';

import fixture from './accordion.fixture.html?raw';
const rootFor = (state = 'default') =>
  document.querySelector<HTMLElement>(
    `[data-cods-fixture-state="${state}"] [data-cods-accordion]`,
  )!;
const buttons = (root: HTMLElement) =>
  Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-cods-accordion-trigger]'),
  );
const panels = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-cods-accordion-panel]'));

beforeEach(() => {
  document.body.innerHTML = fixture;
});
afterEach(() => {
  document
    .querySelectorAll<HTMLElement>('[data-cods-accordion]')
    .forEach(destroy);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('USWDS accordion lifecycle', () => {
  it('keeps every panel readable in authored markup without JavaScript', () => {
    expect(document.querySelectorAll('[hidden]')).toHaveLength(0);
    expect(
      Array.from(document.querySelectorAll('button')).every(
        (button) => button.getAttribute('aria-expanded') === 'true',
      ),
    ).toBe(true);
  });
  it('reads declared states and single-open behavior, dispatching settled events', () => {
    const root = rootFor();
    const events: unknown[] = [];
    const onChange = (event: Event) => {
      events.push((event as CustomEvent).detail);
      expect(
        buttons(root).map((button) => button.getAttribute('aria-expanded')),
      ).toEqual(['false', 'true']);
    };
    document.body.addEventListener('cods-accordion:change', onChange);
    init(root);
    expect(panels(root).map((panel) => panel.hidden)).toEqual([false, true]);
    buttons(root)[1].click();
    expect(events).toEqual([
      { panelId: 'accordion-default-1', expanded: false },
      { panelId: 'accordion-default-2', expanded: true },
    ]);
    expect(panels(root).map((panel) => panel.hidden)).toEqual([true, false]);
    document.body.removeEventListener('cods-accordion:change', onChange);
  });
  it('does not bind twice and does not emit on initialization or redundant calls', () => {
    const root = rootFor();
    const listener = vi.fn();
    root.addEventListener('cods-accordion:change', listener);
    init(root);
    init(root);
    setExpanded(root, 'accordion-default-1', true);
    expect(listener).not.toHaveBeenCalled();
    buttons(root)[0].click();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(panels(root)[0].hidden).toBe(true);
  });
  it('allows all panels to close and supports independent multiple-open panels', () => {
    const root = rootFor('multiple');
    init(root);
    expect(panels(root).map((panel) => panel.hidden)).toEqual([false, false]);
    buttons(root)[0].click();
    expect(panels(root).map((panel) => panel.hidden)).toEqual([true, false]);
    buttons(root)[1].click();
    expect(panels(root).every((panel) => panel.hidden)).toBe(true);
  });
  it('returns focus from a closing panel to its trigger', () => {
    const root = rootFor();
    init(root);
    setExpanded(root, 'accordion-default-2', true);
    root.querySelector('a')!.focus();
    setExpanded(root, 'accordion-default-1', true);
    expect(document.activeElement).toBe(buttons(root)[1]);
  });
  it('restores exactly the authored markup and removes listeners', () => {
    const root = rootFor();
    const original = root.outerHTML;
    init(root);
    buttons(root)[1].click();
    destroy(root);
    destroy(root);
    expect(root.outerHTML).toBe(original);
    buttons(root)[0].click();
    expect(root.outerHTML).toBe(original);
    init(root);
    expect(panels(root).map((panel) => panel.hidden)).toEqual([false, true]);
  });
  it('restores pre-existing hidden and integration attributes', () => {
    const root = rootFor();
    root.setAttribute('data-allow-multiple', 'original');
    root.setAttribute('data-cods-accordion-enhanced', 'original');
    panels(root)[1].setAttribute('hidden', 'hidden');
    const original = root.cloneNode(true);
    init(root);
    destroy(root);
    expect(root.isEqualNode(original)).toBe(true);
  });
  it('ignores disabled triggers and unknown or uninitialized panels', () => {
    const root = rootFor('disabled');
    const original = root.outerHTML;
    setExpanded(root, 'accordion-disabled-1', true);
    destroy(root);
    expect(root.outerHTML).toBe(original);
    init(root);
    setExpanded(root, 'accordion-disabled-1', true);
    buttons(root)[0].click();
    expect(panels(root)[0].hidden).toBe(false);
    setExpanded(root, 'missing', true);
    expect(panels(root)[0].hidden).toBe(false);
  });
  it('leaves malformed markup unchanged, warns once, and can retry after repair', () => {
    const root = rootFor();
    buttons(root)[1].setAttribute('aria-controls', 'missing');
    const original = root.outerHTML;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    init(root);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(root.outerHTML).toBe(original);
    buttons(root)[1].setAttribute('aria-controls', 'accordion-default-2');
    init(root);
    expect(panels(root)[1].hidden).toBe(true);
  });
  it('rejects duplicate targets before changing any markup', () => {
    const root = rootFor();
    buttons(root)[1].setAttribute('aria-controls', 'accordion-default-1');
    const original = root.outerHTML;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    expect(root.outerHTML).toBe(original);
  });
  it('initializes dynamically inserted roots and includes a root container itself', () => {
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.innerHTML = fixture;
    document.body.append(container);
    const root = rootFor();
    initAll(root);
    expect(panels(root)[1].hidden).toBe(true);
    initAll(container);
    expect(
      rootFor('multiple').hasAttribute('data-cods-accordion-enhanced'),
    ).toBe(true);
  });
  it('isolates nested roots and can destroy one without disabling another', () => {
    const outer = rootFor();
    const inner = rootFor('multiple');
    panels(outer)[0].append(inner);
    initAll();
    buttons(inner)[0].click();
    expect(buttons(outer)[0].getAttribute('aria-expanded')).toBe('true');
    destroy(outer);
    buttons(inner)[1].click();
    expect(panels(inner)[1].hidden).toBe(true);
    destroy(inner);
  });
});
