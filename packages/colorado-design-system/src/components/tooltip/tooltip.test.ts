import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from './tooltip.fixture.html?raw';
import { destroy, init, initAll } from './tooltip.js';

/** Render the canonical fixture and return one state's tooltip parts. */
function render(state = 'top') {
  document.body.innerHTML = fixture;
  const root = document.querySelector<HTMLElement>(
    `[data-cods-fixture-state="${state}"] [data-cods-tooltip]`,
  )!;
  const trigger = root.querySelector<HTMLElement>(
    '[data-cods-tooltip-trigger]',
  )!;
  const body = () => root.querySelector<HTMLElement>('[role="tooltip"]')!;
  return { root, trigger, body };
}

const escape = () =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );

afterEach(() => {
  document
    .querySelectorAll<HTMLElement>('[data-cods-tooltip]')
    .forEach(destroy);
  document.body.innerHTML = '';
});

describe('tooltip', () => {
  it('creates a described, hidden tooltip from the trigger title', () => {
    const { root, trigger, body } = render();
    init(root);
    expect(body().textContent).toBe('Saves your progress.');
    expect(body().hidden).toBe(true);
    expect(trigger.hasAttribute('title')).toBe(false);
    expect(trigger.getAttribute('aria-describedby')).toBe(body().id);
  });

  it('preserves an existing description', () => {
    const { root, trigger, body } = render();
    trigger.setAttribute('aria-describedby', 'existing');
    init(root);
    expect(trigger.getAttribute('aria-describedby')).toBe(
      `existing ${body().id}`,
    );
    destroy(root);
    expect(trigger.getAttribute('aria-describedby')).toBe('existing');
  });

  it('stays open while hovered or focused and emits open and close', () => {
    const { root, trigger, body } = render();
    const events: string[] = [];
    root.addEventListener('cods-tooltip:open', (event) =>
      events.push(`open:${(event as CustomEvent).detail.trigger === trigger}`),
    );
    root.addEventListener('cods-tooltip:close', () => events.push('close'));
    init(root);
    trigger.dispatchEvent(new FocusEvent('focus'));
    expect(body().hidden).toBe(false);
    root.dispatchEvent(new MouseEvent('mouseenter'));
    trigger.dispatchEvent(new FocusEvent('blur'));
    expect(body().hidden).toBe(false);
    root.dispatchEvent(new MouseEvent('mouseleave'));
    expect(body().hidden).toBe(true);
    expect(events).toEqual(['open:true', 'close']);
  });

  it('reopens after Escape on a fresh hover while focus remains', () => {
    const { root, trigger, body } = render();
    init(root);
    trigger.dispatchEvent(new FocusEvent('focus'));
    escape();
    expect(body().hidden).toBe(true);
    root.dispatchEvent(new MouseEvent('mouseenter'));
    expect(body().hidden).toBe(false);
  });

  it('reopens after Escape on a fresh focus while hover remains', () => {
    const { root, trigger, body } = render();
    init(root);
    root.dispatchEvent(new MouseEvent('mouseenter'));
    escape();
    expect(body().hidden).toBe(true);
    trigger.dispatchEvent(new FocusEvent('focus'));
    expect(body().hidden).toBe(false);
  });

  it('preserves focus on the trigger through init and destroy', () => {
    const { root, trigger, body } = render();
    trigger.focus();
    init(root);
    expect(document.activeElement).toBe(trigger);
    expect(body().hidden).toBe(false);
    destroy(root);
    expect(document.activeElement).toBe(trigger);
  });

  it('shows for an already-focused trigger without emitting during init', () => {
    const { root, trigger, body } = render();
    const opened = vi.fn();
    root.addEventListener('cods-tooltip:open', opened);
    trigger.focus();
    init(root);
    expect(body().hidden).toBe(false);
    expect(opened).not.toHaveBeenCalled();
    trigger.dispatchEvent(new FocusEvent('blur'));
    trigger.dispatchEvent(new FocusEvent('focus'));
    expect(opened).toHaveBeenCalledOnce();
  });

  it('restores authored markup and does not initialize twice', () => {
    const { root } = render('light');
    const original = root.cloneNode(true);
    init(root);
    init(root);
    expect(root.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
    destroy(root);
    expect(root.isEqualNode(original)).toBe(true);
    expect(() => destroy(root)).not.toThrow();
  });

  it('removes document and window listeners on destroy', () => {
    const { root } = render();
    const addDoc = vi.spyOn(document, 'addEventListener');
    const removeDoc = vi.spyOn(document, 'removeEventListener');
    const addWin = vi.spyOn(window, 'addEventListener');
    const removeWin = vi.spyOn(window, 'removeEventListener');
    init(root);
    destroy(root);
    expect(removeDoc.mock.calls).toEqual(addDoc.mock.calls);
    expect(removeWin.mock.calls).toEqual(addWin.mock.calls);
    vi.restoreAllMocks();
  });

  it('initializes every fixture state with unique ids', () => {
    render();
    initAll(document);
    const ids = [...document.querySelectorAll('[role="tooltip"]')].map(
      (body) => body.id,
    );
    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(5);
  });

  it('leaves invalid markup untouched', () => {
    const { root, trigger } = render();
    trigger.removeAttribute('title');
    const original = root.innerHTML;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    expect(root.innerHTML).toBe(original);
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });
});
