import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from './language-selector.fixture.html?raw';
import { destroy, init } from './language-selector.js';

beforeEach(() => {
  document.body.innerHTML = fixture;
});
afterEach(() => {
  document
    .querySelectorAll<HTMLElement>('[data-cods-language-selector]')
    .forEach(destroy);
  document.body.innerHTML = '';
});

describe('language selector', () => {
  it('keeps language links visible without JavaScript', () => {
    expect(document.querySelectorAll('a[lang][hreflang]').length).toBe(6);
    expect(
      document.querySelector<HTMLElement>(
        '[data-cods-language-selector-panel]',
      )!.hidden,
    ).toBe(false);
  });
  it('toggles the disclosure and restores the fallback on destroy', () => {
    const root = document.querySelector<HTMLElement>(
      '[data-cods-language-selector]',
    )!;
    const button = root.querySelector<HTMLButtonElement>('button')!;
    const panel = root.querySelector<HTMLElement>(
      '[data-cods-language-selector-panel]',
    )!;
    const original = root.outerHTML;
    const changed = vi.fn();
    root.addEventListener('cods-language-selector:change', changed);
    init(root);
    init(root);
    expect(panel.hidden).toBe(true);
    button.click();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][0].detail.expanded).toBe(true);
    expect(panel.hidden).toBe(false);
    panel.querySelector('a')!.focus();
    panel
      .querySelector('a')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(button);
    destroy(root);
    expect(root.outerHTML).toBe(original);
  });
});
