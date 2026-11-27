import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from './toast.fixture.html?raw';
import { destroy, dismiss, dismissAll, init, show } from './toast.js';

let root: HTMLElement;
let observers: {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}[];
beforeEach(() => {
  vi.useFakeTimers();
  observers = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor() {
        observers.push(this);
      }
    },
  );
  document.body.innerHTML = fixture;
  root = document.querySelector<HTMLElement>('[data-cods-toast]')!;
  init(root);
});
afterEach(() => {
  destroy(root);
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('toast', () => {
  it('announces without moving focus and remains until dismissed', () => {
    const trigger = document.querySelector<HTMLButtonElement>(
      '[data-cods-toast-demo]',
    )!;
    trigger.focus();
    const item = show(root, {
      message: 'Saved',
      dismissLabel: 'Dismiss',
      returnFocus: trigger,
    })!;
    expect(document.activeElement).toBe(trigger);
    vi.advanceTimersByTime(50);
    expect(root.querySelector('[role=status]')?.textContent).toBe('Saved');
    vi.advanceTimersByTime(60000);
    expect(item.isConnected).toBe(true);
    item.querySelector('button')!.focus();
    item.querySelector('button')!.click();
    expect(document.activeElement).toBe(trigger);
    expect(item.isConnected).toBe(false);
  });
  it('stacks messages and pauses timed messages on focus', () => {
    const first = show(root, {
      message: 'One',
      dismissLabel: 'Dismiss',
      duration: 1000,
    })!;
    const second = show(root, {
      message: 'Two',
      dismissLabel: 'Dismiss',
      urgency: 'assertive',
    })!;
    vi.advanceTimersByTime(1100);
    expect(root.querySelector('[role=alert]')?.textContent).toBe('Two');
    vi.advanceTimersByTime(3900);
    first.querySelector('button')!.focus();
    vi.advanceTimersByTime(20000);
    expect(first.isConnected).toBe(true);
    (document.querySelector('[data-cods-toast-demo]') as HTMLElement).focus();
    vi.advanceTimersByTime(5000);
    expect(first.isConnected).toBe(false);
    expect(second.isConnected).toBe(true);
    dismiss(root, second);
  });
  it('cleans up timers and only dismisses notifications owned by its instance', () => {
    const item = show(root, {
      message: 'Saved',
      dismissLabel: 'Dismiss',
      duration: 10000,
    })!;
    dismissAll(root);
    vi.runAllTimers();
    expect(item.isConnected).toBe(false);
    destroy(root);
    expect(
      show(root, { message: 'Again', dismissLabel: 'Dismiss' }),
    ).toBeUndefined();
  });
  it('keeps actionable messages available even when a duration is supplied', () => {
    const onActivate = vi.fn();
    const item = show(root, {
      message: 'Changes saved',
      dismissLabel: 'Dismiss',
      duration: 10000,
      action: { label: 'Undo', onActivate },
    })!;
    vi.advanceTimersByTime(60000);
    expect(item.isConnected).toBe(true);
    item.querySelector<HTMLButtonElement>('.cods-toast__action')!.click();
    expect(onActivate).toHaveBeenCalledOnce();
  });
  it('returns focus to the notification area if the trigger becomes disabled', () => {
    const trigger = document.querySelector<HTMLButtonElement>(
      '[data-cods-toast-demo]',
    )!;
    const item = show(root, {
      message: 'Saved',
      dismissLabel: 'Dismiss',
      returnFocus: trigger,
    })!;
    item.querySelector('button')!.focus();
    trigger.disabled = true;
    dismiss(root, item);
    expect(document.activeElement).toBe(root);
  });
  it('queues repeated announcements and skips a dismissed pending message', () => {
    const first = show(root, { message: 'First', dismissLabel: 'Dismiss' })!;
    const second = show(root, { message: 'Second', dismissLabel: 'Dismiss' })!;
    vi.advanceTimersByTime(50);
    expect(root.querySelector('[role=status]')?.textContent).toBe('First');
    dismiss(root, second);
    vi.advanceTimersByTime(1050);
    expect(root.querySelector('[role=status]')?.textContent).not.toBe('Second');
    expect(first.isConnected).toBe(true);
  });
  it('restores placement and removes positioning listeners on destroy', () => {
    const list = root.querySelector<HTMLElement>('[data-cods-toast-list]')!;
    const contextAction = document.querySelector<HTMLButtonElement>(
      '[data-cods-toast-context-action]',
    )!;
    destroy(root);
    const addDocumentListener = vi.spyOn(document, 'addEventListener');
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const addWindowListener = vi.spyOn(window, 'addEventListener');
    const removeWindowListener = vi.spyOn(window, 'removeEventListener');
    const addListListener = vi.spyOn(list, 'addEventListener');
    const removeListListener = vi.spyOn(list, 'removeEventListener');
    list.style.setProperty('max-width', '20rem');
    list.style.setProperty(
      '--cods-toast-focus-shadow-limit',
      '24px',
      'important',
    );
    init(root);
    const observer = observers.at(-1)!;
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(16, 600, 288, 152),
    );
    vi.spyOn(contextAction, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(16, 650, 200, 40),
    );
    const item = show(root, {
      message: 'Saved',
      dismissLabel: 'Dismiss',
    })!;
    expect(observer.observe).toHaveBeenCalledWith(list);
    expect(observer.observe).toHaveBeenCalledWith(item);
    contextAction.focus();
    expect(list.classList.contains('cods-toast__list--focus-top')).toBe(true);
    expect(
      list.style.getPropertyValue('--cods-toast-focus-max-height'),
    ).not.toBe('');

    destroy(root);
    expect(observer.unobserve).toHaveBeenCalledWith(item);
    expect(observer.disconnect).toHaveBeenCalledOnce();
    for (const event of [
      'focusin',
      'focusout',
      'scroll',
      'pointerup',
      'pointercancel',
    ]) {
      const added = addDocumentListener.mock.calls.find(
        ([type]) => type === event,
      );
      expect(added).toBeDefined();
      expect(removeDocumentListener).toHaveBeenCalledWith(...added!);
    }
    for (const event of ['resize', 'blur']) {
      const added = addWindowListener.mock.calls.find(
        ([type]) => type === event,
      );
      expect(added).toBeDefined();
      expect(removeWindowListener).toHaveBeenCalledWith(...added!);
    }
    for (const event of ['pointerdown', 'animationend', 'animationcancel']) {
      const added = addListListener.mock.calls.find(([type]) => type === event);
      expect(added).toBeDefined();
      expect(removeListListener).toHaveBeenCalledWith(...added!);
    }
    expect(list.className).toBe('cods-toast__list');
    expect(list.style.getPropertyValue('--cods-toast-focus-max-height')).toBe(
      '',
    );
    expect(list.style.getPropertyValue('max-width')).toBe('20rem');
    expect(list.style.getPropertyValue('--cods-toast-focus-shadow-limit')).toBe(
      '24px',
    );
    expect(
      list.style.getPropertyPriority('--cods-toast-focus-shadow-limit'),
    ).toBe('important');
    list.append(item);
    contextAction.blur();
    contextAction.focus();
    document.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);
    expect(list.className).toBe('cods-toast__list');
    expect(list.style.getPropertyValue('--cods-toast-focus-max-height')).toBe(
      '',
    );
  });
  it('keeps the scroll area pointer-accessible without ResizeObserver', () => {
    destroy(root);
    vi.stubGlobal('ResizeObserver', undefined);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    init(root);
    show(root, { message: 'Saved', dismissLabel: 'Dismiss' });
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('ResizeObserver unavailable'),
      root,
    );
    expect(
      root
        .querySelector('[data-cods-toast-list]')
        ?.classList.contains('cods-toast__list--click-through'),
    ).toBe(false);
  });
});
