import { describe, expect, it, vi } from 'vitest';
import { destroy, init } from './tooltip.js';

function fixture(): HTMLElement {
  document.body.innerHTML =
    '<span data-cods-tooltip><button class="usa-tooltip" data-cods-tooltip-trigger title="Helpful text" aria-describedby="existing">Save</button></span>';
  return document.querySelector<HTMLElement>('[data-cods-tooltip]')!;
}

describe('tooltip', () => {
  it('opens on focus and remains open on hover until both leave, and Escape dismisses it', () => {
    const root = fixture();
    init(root);
    const trigger = root.querySelector('button')!;
    const wrapper = trigger.parentElement!;
    const body = root.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(trigger.getAttribute('aria-describedby')).toContain(body.id);
    expect(trigger.getAttribute('aria-describedby')).toContain('existing');
    trigger.dispatchEvent(new FocusEvent('focus'));
    expect(body.classList.contains('is-set')).toBe(true);
    wrapper.dispatchEvent(new MouseEvent('mouseenter'));
    trigger.dispatchEvent(new FocusEvent('blur'));
    expect(body.classList.contains('is-set')).toBe(true);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(body.classList.contains('is-set')).toBe(false);
    wrapper.dispatchEvent(new MouseEvent('mouseleave'));
    wrapper.dispatchEvent(new MouseEvent('mouseenter'));
    expect(body.classList.contains('is-set')).toBe(true);
    destroy(root);
  });

  it('restores authored markup and does not initialize twice', () => {
    const root = fixture();
    const original = root.cloneNode(true);
    init(root);
    init(root);
    expect(root.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
    destroy(root);
    expect(root.isEqualNode(original)).toBe(true);
    expect(() => destroy(root)).not.toThrow();
  });

  it('leaves invalid markup untouched', () => {
    const root = fixture();
    root.querySelector('button')!.removeAttribute('title');
    const original = root.innerHTML;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    expect(root.innerHTML).toBe(original);
    warning.mockRestore();
  });
});
