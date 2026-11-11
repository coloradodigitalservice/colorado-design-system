const ROOT = '[data-cods-toast]';
const instances = new WeakMap<HTMLElement, Instance>();

interface Instance {
  polite: HTMLElement;
  assertive: HTMLElement;
  items: Map<HTMLElement, () => void>;
}

export interface ToastOptions {
  message: string;
  dismissLabel: string;
  urgency?: 'polite' | 'assertive';
  /** Only for supplemental messages whose information remains available elsewhere. */
  duration?: number;
  returnFocus?: HTMLElement;
  /** Actions must also be available in context. Toasts with actions do not expire. */
  action?: { label: string; onActivate: () => void };
}

export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const polite = root.querySelector<HTMLElement>('[data-cods-toast-polite]');
  const assertive = root.querySelector<HTMLElement>(
    '[data-cods-toast-assertive]',
  );
  if (!polite || !assertive || !root.querySelector('[data-cods-toast-list]')) {
    console.warn('cods-toast: missing list or live regions', root);
    return;
  }
  instances.set(root, { polite, assertive, items: new Map() });
}

export function initAll(container: ParentNode = document): void {
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

export function show(
  root: HTMLElement,
  options: ToastOptions,
): HTMLElement | undefined {
  const instance = instances.get(root);
  const list = root.querySelector<HTMLElement>('[data-cods-toast-list]');
  if (
    !instance ||
    !list ||
    !options.message.trim() ||
    !options.dismissLabel.trim()
  )
    return;
  const item = document.createElement('div');
  item.className = 'cods-toast__item';
  const message = document.createElement('span');
  message.className = 'cods-toast__message';
  message.textContent = options.message;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cods-toast__dismiss';
  button.textContent = options.dismissLabel;
  item.append(message);
  if (options.action?.label.trim()) {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'cods-toast__action';
    action.textContent = options.action.label;
    action.addEventListener('click', options.action.onActivate);
    item.append(action);
  }
  item.append(button);
  list.append(item);
  const live =
    options.urgency === 'assertive' ? instance.assertive : instance.polite;
  live.textContent = options.message;
  let remaining =
    !options.action &&
    Number.isFinite(options.duration) &&
    options.duration! > 0
      ? Math.max(10000, options.duration!)
      : 0;
  let started = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pause = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
      remaining = Math.max(1, remaining - (Date.now() - started));
    }
  };
  const resume = () => {
    if (
      !remaining ||
      timer !== undefined ||
      item.matches(':hover') ||
      item.contains(document.activeElement)
    )
      return;
    started = Date.now();
    timer = setTimeout(() => dismiss(root, item), remaining);
  };
  const onFocusOut = (event: FocusEvent) => {
    if (!item.contains(event.relatedTarget as Node | null)) resume();
  };
  const onDismiss = () => dismiss(root, item);
  button.addEventListener('click', onDismiss);
  item.addEventListener('mouseenter', pause);
  item.addEventListener('mouseleave', resume);
  item.addEventListener('focusin', pause);
  item.addEventListener('focusout', onFocusOut);
  instance.items.set(item, () => {
    pause();
    button.removeEventListener('click', onDismiss);
    item.removeEventListener('mouseenter', pause);
    item.removeEventListener('mouseleave', resume);
    item.removeEventListener('focusin', pause);
    item.removeEventListener('focusout', onFocusOut);
    if (item.contains(document.activeElement)) {
      const next = [...instance.items.keys()]
        .find((other) => other !== item)
        ?.querySelector<HTMLButtonElement>('button');
      if (next) next.focus();
      else if (options.returnFocus?.isConnected) options.returnFocus.focus();
      else {
        const previousTabindex = root.getAttribute('tabindex');
        root.setAttribute('tabindex', '-1');
        root.focus();
        if (previousTabindex === null) root.removeAttribute('tabindex');
        else root.setAttribute('tabindex', previousTabindex);
      }
    }
  });
  resume();
  root.dispatchEvent(
    new CustomEvent('cods-toast:show', { bubbles: true, detail: { item } }),
  );
  return item;
}

export function dismiss(root: HTMLElement, item: HTMLElement): void {
  const instance = instances.get(root);
  const cleanup = instance?.items.get(item);
  if (!instance || !cleanup) return;
  cleanup();
  instance.items.delete(item);
  item.remove();
  root.dispatchEvent(
    new CustomEvent('cods-toast:dismiss', { bubbles: true, detail: { item } }),
  );
}

export function dismissAll(root: HTMLElement): void {
  const instance = instances.get(root);
  if (instance)
    [...instance.items.keys()].forEach((item) => dismiss(root, item));
}

export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  dismissAll(root);
  instance.polite.textContent = '';
  instance.assertive.textContent = '';
  instances.delete(root);
}
