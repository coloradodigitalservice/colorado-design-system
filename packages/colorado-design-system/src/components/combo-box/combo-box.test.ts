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
  it('prevents submitting edited text as the previous selection', () => {
    const element = root();
    const select = element.querySelector('select')!;
    select.value = '2025';
    init(element);
    const input = element.querySelector<HTMLInputElement>('[role=combobox]')!;
    input.value = '2024';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.checkValidity()).toBe(false);
    input.click();
    element.querySelector<HTMLElement>('[role=option]')!.click();
    expect(input.checkValidity()).toBe(true);
    expect(select.value).toBe('2024');
  });
  it('syncs the visible value after form reset', async () => {
    const element = root();
    const form = document.createElement('form');
    element.parentElement!.append(form);
    form.append(element);
    const select = element.querySelector('select')!;
    select.options[2].defaultSelected = true;
    init(element);
    const input = element.querySelector<HTMLInputElement>('[role=combobox]')!;
    input.click();
    element.querySelector<HTMLElement>('[role=option]')!.click();
    expect(select.value).toBe('2026');
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(select.value).toBe('2025');
    expect(input.value).toBe('2025');
    expect(input.checkValidity()).toBe(true);
  });
  it('exposes group names without changing USWDS option navigation', () => {
    const element = root();
    element.querySelector('select')!.innerHTML =
      '<option value="">Choose</option><optgroup label="Renew"><option value="renew">Renew license</option><option value="replace">Replace license</option></optgroup><optgroup label="Apply"><option value="apply">Apply</option></optgroup>';
    init(element);
    const input = element.querySelector<HTMLInputElement>('[role=combobox]')!;
    input.click();
    const items = Array.from(
      element.querySelectorAll<HTMLElement>('[role=option]'),
    );
    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual([
      'Renew: Renew license',
      'Renew: Replace license',
      'Apply: Apply',
    ]);
    expect(items.map((item) => item.dataset.codsComboBoxGroup)).toEqual([
      'Renew',
      undefined,
      'Apply',
    ]);
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    items[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    items[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(element.querySelector('select')!.value).toBe('replace');
  });
  it('leaves individually disabled options as a native select', () => {
    const element = root();
    element.querySelector('option[value="2025"]')!.setAttribute('disabled', '');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(element);
    expect(element.querySelector('[role=combobox]')).toBeNull();
  });
});
