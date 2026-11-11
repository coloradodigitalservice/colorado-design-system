import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from './toast.fixture.html?raw';
import { destroy, dismiss, dismissAll, init, show } from './toast.js';

let root: HTMLElement;
beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = fixture;
  root = document.querySelector<HTMLElement>('[data-cods-toast]')!;
  init(root);
});
afterEach(() => {
  destroy(root);
  vi.useRealTimers();
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
    expect(root.querySelector('[role=alert]')?.textContent).toBe('Two');
    vi.advanceTimersByTime(5000);
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
});
