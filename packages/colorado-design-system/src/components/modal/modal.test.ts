import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from './modal.fixture.html?raw';
import { close, destroy, init, open } from './modal.js';

const root = (state = 'default') =>
  document.querySelector<HTMLElement>(
    `[data-cods-fixture-state=${state}] [data-cods-modal]`,
  )!;

beforeEach(() => {
  document.body.innerHTML = fixture;
});
afterEach(() => {
  document.querySelectorAll<HTMLElement>('[data-cods-modal]').forEach(destroy);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('modal lifecycle', () => {
  it('leaves the dialog content readable without JavaScript', () => {
    const dialog = root().querySelector('.usa-modal')!;
    expect(dialog.id).toBe('cods-modal-default');
    expect(dialog.querySelector('.cods-modal__heading')!.textContent).toContain(
      'Delete this record?',
    );
  });

  it('enhances once and restores the authored markup on destroy', () => {
    const element = root();
    const original = element.outerHTML;
    init(element);
    init(element);
    const wrapper = document.getElementById('cods-modal-default')!;
    expect(wrapper.classList.contains('usa-modal-wrapper')).toBe(true);
    expect(wrapper.parentElement).toBe(document.body);
    expect(wrapper.getAttribute('role')).toBe('dialog');
    // The authored dialog was relocated out of the root.
    expect(element.querySelector('.usa-modal')).toBeNull();
    destroy(element);
    expect(element.outerHTML).toBe(original);
    expect(document.querySelector('.usa-modal-wrapper')).toBeNull();
    expect(
      document.querySelector('[data-placeholder-for="cods-modal-default"]'),
    ).toBeNull();
  });

  it('opens and closes through the authored controls and emits events', () => {
    const element = root();
    const events: string[] = [];
    element.addEventListener('cods-modal:open', () => events.push('open'));
    element.addEventListener('cods-modal:close', () => events.push('close'));
    init(element);
    const wrapper = document.getElementById('cods-modal-default')!;
    open(element);
    expect(wrapper.classList.contains('is-visible')).toBe(true);
    expect(wrapper.getAttribute('aria-modal')).toBe('true');
    close(element);
    expect(wrapper.classList.contains('is-visible')).toBe(false);
    expect(wrapper.hasAttribute('aria-modal')).toBe(false);
    expect(events).toEqual(['open', 'close']);
  });

  it('returns focus to the trigger after closing', () => {
    const element = root();
    init(element);
    const trigger =
      element.querySelector<HTMLButtonElement>('[data-open-modal]')!;
    trigger.focus();
    open(element);
    expect(document.activeElement).not.toBe(trigger);
    close(element);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes the forced-action variant only through an in-dialog action', () => {
    const element = root('forced-action');
    init(element);
    const wrapper = document.getElementById('cods-modal-forced')!;
    expect(wrapper.hasAttribute('data-force-action')).toBe(true);
    // No dismiss affordance is rendered for the forced-action variant.
    expect(wrapper.querySelector('.cods-modal__close')).toBeNull();
    open(element);
    expect(wrapper.classList.contains('is-visible')).toBe(true);
    close(element);
    expect(wrapper.classList.contains('is-visible')).toBe(false);
  });

  it('leaves the page usable when destroyed while open', () => {
    const element = root();
    init(element);
    open(element);
    expect(document.body.classList.contains('usa-js-modal--active')).toBe(true);
    destroy(element);
    expect(document.body.classList.contains('usa-js-modal--active')).toBe(
      false,
    );
    expect(document.querySelector('[data-modal-hidden]')).toBeNull();
  });

  it('leaves markup unchanged when the dialog has no description', () => {
    const element = root();
    element.querySelector('.usa-modal')!.removeAttribute('aria-describedby');
    const original = element.outerHTML;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(element);
    expect(warn).toHaveBeenCalledOnce();
    expect(element.outerHTML).toBe(original);
    expect(document.querySelector('.usa-modal-wrapper')).toBeNull();
  });

  it('does not throw when destroyed without init', () => {
    expect(() => destroy(root())).not.toThrow();
  });
});
