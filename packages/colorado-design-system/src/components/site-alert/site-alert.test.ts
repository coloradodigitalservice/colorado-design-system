import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import fixture from './site-alert.fixture.html?raw';
import { init, initAll, destroy } from './site-alert.js';

const roots = () => [
  ...document.querySelectorAll<HTMLElement>('[data-cods-site-alert]'),
];
const rootFor = (state = 'informational-dismissible') =>
  document.querySelector<HTMLElement>(
    `[data-cods-fixture-state="${state}"] [data-cods-site-alert]`,
  )!;
const buttonFor = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('button')!;

beforeEach(() => {
  document.body.innerHTML = fixture;
});
afterEach(() => {
  roots().forEach(destroy);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('optional site alert dismissal', () => {
  it('keeps both variants readable and enhancement buttons hidden without JavaScript', () => {
    expect(roots()).toHaveLength(11);
    expect(roots().every((root) => !root.hidden)).toBe(true);
    expect(
      [...document.querySelectorAll('button')].every((button) => button.hidden),
    ).toBe(true);
  });
  it('dismisses only its instance, moves focus, and emits one bubbling event', () => {
    initAll();
    const root = rootFor();
    const listener = vi.fn();
    document.body.addEventListener('cods-site-alert:dismiss', listener);
    const button = buttonFor(root);
    expect(button.hidden).toBe(false);
    button.focus();
    button.click();
    expect(root.hidden).toBe(true);
    expect(rootFor('emergency-dismissible').hidden).toBe(false);
    expect(document.activeElement?.id).toBe(
      'site-alert-informational-dismissible-destination',
    );
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      focusTargetId: 'site-alert-informational-dismissible-destination',
    });
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(false);
    button.click();
    expect(listener).toHaveBeenCalledTimes(1);
    document.body.removeEventListener('cods-site-alert:dismiss', listener);
  });
  it('restores exact authored markup after dismissal and can initialize again', () => {
    const before = document.body.cloneNode(true);
    initAll();
    initAll();
    buttonFor(rootFor()).click();
    roots().forEach(destroy);
    roots().forEach(destroy);
    expect(document.body.isEqualNode(before)).toBe(true);
    // A new document has no remembered dismissed state.
    document.body.innerHTML = fixture;
    initAll();
    expect(rootFor().hidden).toBe(false);
    buttonFor(rootFor()).click();
    expect(rootFor().hidden).toBe(true);
  });
  it('fails safely on a missing or internal focus destination and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = rootFor();
    root.setAttribute('data-cods-site-alert-focus-target', 'missing');
    const before = root.outerHTML;
    init(root);
    init(root);
    expect(root.outerHTML).toBe(before);
    expect(warn).toHaveBeenCalledTimes(1);
    root.setAttribute(
      'data-cods-site-alert-focus-target',
      root.querySelector('h3')!.id,
    );
    init(root);
    expect(buttonFor(root).hidden).toBe(true);
  });
  it('does not hide the notice if its destination disappears or cannot receive focus', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = rootFor();
    init(root);
    const target = document.getElementById(
      root.dataset.codsSiteAlertFocusTarget!,
    )!;
    target.hidden = true;
    buttonFor(root).click();
    expect(root.hidden).toBe(false);
    target.hidden = false;
    vi.spyOn(target, 'focus').mockImplementation(() => {});
    buttonFor(root).focus();
    buttonFor(root).click();
    expect(root.hidden).toBe(false);
    expect(document.activeElement).toBe(buttonFor(root));
    target.remove();
    buttonFor(root).click();
    expect(root.hidden).toBe(false);
  });
  it('supports a root scope and respects disabled dismissal', () => {
    const root = rootFor();
    initAll(root);
    const button = buttonFor(root);
    button.disabled = true;
    button.click();
    expect(root.hidden).toBe(false);
    expect(buttonFor(rootFor('emergency-dismissible')).hidden).toBe(true);
  });
});
