import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from './combo-box.fixture.html?raw';
import { destroy, init } from './combo-box.js';

const root = () =>
  document.querySelector<HTMLElement>('[data-cods-combo-box]')!;
beforeEach(() => {
  document.body.innerHTML = fixture;
});
afterEach(() => {
  document
    .querySelectorAll<HTMLElement>('[data-cods-combo-box]')
    .forEach(destroy);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('combo box lifecycle', () => {
  it('leaves a labeled native select without JavaScript', () => {
    expect(document.querySelector('label[for="combo-year"]')).not.toBeNull();
    expect(root().querySelector('select')!.options.length).toBe(4);
  });
  it('enhances once, emits changes, and restores markup on destroy', () => {
    const element = root();
    const original = element.outerHTML;
    const change = vi.fn();
    element.addEventListener('cods-combo-box:change', change);
    init(element);
    init(element);
    expect(change).not.toHaveBeenCalled();
    const input = element.querySelector<HTMLInputElement>('[role=combobox]')!;
    input.click();
    element.querySelector<HTMLElement>('[role=option]')!.click();
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0].detail.value).toBe('2026');
    destroy(element);
    expect(element.outerHTML).toBe(original);
    expect(element.querySelector('select')!.value).toBe('2026');
  });
  it('does not submit a disabled select after enhancement', () => {
    const element = document.querySelector<HTMLElement>(
      '[data-cods-fixture-state=disabled] [data-cods-combo-box]',
    )!;
    init(element);
    expect(element.querySelector('select')!.disabled).toBe(true);
    expect(element.querySelector('input')!.disabled).toBe(true);
  });
  it('leaves unsupported grouped options as a native select', () => {
    const element = root();
    element
      .querySelector('select')!
      .insertAdjacentHTML(
        'beforeend',
        '<optgroup label="Group"><option value="x">X</option></optgroup>',
      );
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(element);
    expect(element.querySelector('[role=combobox]')).toBeNull();
  });
});
