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
    expect(document.querySelectorAll('a[hreflang]').length).toBe(10);
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
  it('keeps another instance working after one is destroyed', () => {
    const first = document.querySelector<HTMLElement>(
      '[data-cods-language-selector]',
    )!;
    const second = first.cloneNode(true) as HTMLElement;
    second.querySelector('ul ul')!.id = 'language-options-2';
    second
      .querySelector('button')!
      .setAttribute('aria-controls', 'language-options-2');
    first.after(second);
    const button = second.querySelector<HTMLButtonElement>('button')!;
    const panel = second.querySelector<HTMLElement>('#language-options-2')!;
    const clicked = vi.fn();
    button.addEventListener('click', clicked);
    second.addEventListener('click', clicked);
    document.body.addEventListener('click', clicked);
    init(first);
    init(second);
    button.click();
    clicked.mockClear();
    destroy(first);
    expect(clicked).not.toHaveBeenCalled();
    expect(panel.hidden).toBe(false);
    panel
      .querySelector('a')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    expect(panel.hidden).toBe(true);
    button.click();
    expect(panel.hidden).toBe(false);
    button.click();
    expect(panel.hidden).toBe(true);
    document.body.removeEventListener('click', clicked);
  });
  it('lets another instance open after the open one is destroyed', () => {
    const first = document.querySelector<HTMLElement>(
      '[data-cods-language-selector]',
    )!;
    const second = first.cloneNode(true) as HTMLElement;
    second.querySelector('ul ul')!.id = 'language-options-2';
    second
      .querySelector('button')!
      .setAttribute('aria-controls', 'language-options-2');
    first.after(second);
    init(first);
    init(second);
    first.querySelector('button')!.click();
    destroy(first);
    const button = second.querySelector<HTMLButtonElement>('button')!;
    const panel = second.querySelector<HTMLElement>('#language-options-2')!;
    button.click();
    expect(panel.hidden).toBe(false);
    button.click();
    expect(panel.hidden).toBe(true);
  });
  it('warns and keeps the fallback links when USWDS markup is missing', () => {
    const root = document.querySelector<HTMLElement>(
      '[data-cods-language-selector]',
    )!;
    const button = root.querySelector('button')!;
    button.classList.remove('usa-language__link');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    expect(warn).toHaveBeenCalledOnce();
    expect(button.hidden).toBe(true);
    expect(
      root.querySelector<HTMLElement>('[data-cods-language-selector-panel]')!
        .hidden,
    ).toBe(false);
    expect(root.hasAttribute('data-cods-language-selector-enhanced')).toBe(
      false,
    );
    warn.mockRestore();
  });
});
