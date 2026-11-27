const ROOT = '[data-cods-toast]';
const instances = new WeakMap<HTMLElement, Instance>();

interface Instance {
  polite: HTMLElement;
  assertive: HTMLElement;
  items: Map<HTMLElement, () => void>;
  reposition: () => void;
  cleanupPositioning: () => void;
  resizeObserver: ResizeObserver | undefined;
  announcements: Array<{
    live: HTMLElement;
    message: string;
    item: HTMLElement;
  }>;
  announcementTimer?: ReturnType<typeof setTimeout>;
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
  /** URL of a decorative SVG sprite symbol. */
  iconHref?: string;
}

export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const polite = root.querySelector<HTMLElement>('[data-cods-toast-polite]');
  const assertive = root.querySelector<HTMLElement>(
    '[data-cods-toast-assertive]',
  );
  const list = root.querySelector<HTMLElement>('[data-cods-toast-list]');
  if (!polite || !assertive || !list) {
    console.warn('cods-toast: missing list or live regions', root);
    return;
  }
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) {
    console.warn('cods-toast: missing browsing context', root);
    return;
  }
  const topClass = 'cods-toast__list--focus-top';
  const clickThroughClass = 'cods-toast__list--click-through';
  const heightProperty = '--cods-toast-focus-max-height';
  const shadowLimitProperty = '--cods-toast-focus-shadow-limit';
  const hadTopClass = list.classList.contains(topClass);
  const hadClickThroughClass = list.classList.contains(clickThroughClass);
  const hadStyle = list.hasAttribute('style');
  const originalHeight = list.style.getPropertyValue(heightProperty);
  const originalPriority = list.style.getPropertyPriority(heightProperty);
  const originalShadowLimit = list.style.getPropertyValue(shadowLimitProperty);
  const originalShadowPriority =
    list.style.getPropertyPriority(shadowLimitProperty);
  const resetHeight = () => {
    if (originalHeight)
      list.style.setProperty(heightProperty, originalHeight, originalPriority);
    else list.style.removeProperty(heightProperty);
    if (originalShadowLimit)
      list.style.setProperty(
        shadowLimitProperty,
        originalShadowLimit,
        originalShadowPriority,
      );
    else list.style.removeProperty(shadowLimitProperty);
    if (!hadStyle && !list.style.length) list.removeAttribute('style');
  };
  const resetPosition = () => {
    list.classList.toggle(topClass, hadTopClass);
    resetHeight();
  };
  const pressedPointers = new Set<number>();
  let resizeObserver: ResizeObserver | undefined;
  const updatePosition = () => {
    if (!list.childElementCount) {
      resetPosition();
      return;
    }
    const focused = doc.activeElement;
    if (!focused || focused === doc.body || focused === doc.documentElement) {
      resetPosition();
      return;
    }
    if (root.contains(focused)) {
      resetHeight();
      return;
    }
    if (focused.contains(root)) {
      resetPosition();
      return;
    }
    resetPosition();
    const focusRect = focused.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const focusStyle = view.getComputedStyle(focused);
    const outline =
      focusStyle.outlineStyle === 'none'
        ? 0
        : Math.max(
            0,
            (parseFloat(focusStyle.outlineWidth) || 0) +
              (parseFloat(focusStyle.outlineOffset) || 0),
          );
    if (
      focusRect.right + outline <= listRect.left ||
      focusRect.left - outline >= listRect.right ||
      focusRect.bottom + outline <= listRect.top ||
      focusRect.top - outline >= listRect.bottom
    )
      return;
    const inset = Math.max(0, view.innerHeight - listRect.bottom);
    const above = focusRect.top - outline - inset;
    const below = view.innerHeight - focusRect.bottom - outline - inset;
    const useTop = above >= below;
    const available = Math.max(0, useTop ? above : below);
    list.classList.toggle(topClass, useTop);
    const listStyle = view.getComputedStyle(list);
    const paddingTop = parseFloat(listStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(listStyle.paddingBottom) || 0;
    const controlHeight =
      (list.querySelector('button')?.getBoundingClientRect().height ?? 0) +
      paddingTop +
      paddingBottom;
    const focusMiddle =
      (Math.max(0, focusRect.top) +
        Math.min(view.innerHeight, focusRect.bottom)) /
      2;
    // Keep both the stack and part of the focus target visible when neither
    // edge has enough space for a toast control.
    const fallback = useTop
      ? focusMiddle - inset
      : view.innerHeight - focusMiddle - inset;
    const height =
      available < controlHeight ? Math.max(available, fallback) : available;
    const contentHeight = list.scrollHeight - paddingTop - paddingBottom;
    const edgePadding = useTop ? paddingTop : paddingBottom;
    const shadowPadding = useTop ? paddingBottom : paddingTop;
    const shadowLimit = Math.floor(height - contentHeight - edgePadding);
    // Do not make a fitting toast scroll just to show shadow padding.
    if (shadowLimit >= 0 && shadowLimit < shadowPadding)
      list.style.setProperty(shadowLimitProperty, `${shadowLimit}px`);
    list.style.setProperty(heightProperty, `${height}px`);
  };
  const reposition = () => {
    if (pressedPointers.size) return;
    // Measuring the unconstrained list can clamp its scroll position.
    const scrollTop = list.scrollTop;
    updatePosition();
    list.scrollTop = scrollTop;
    // The transparent padding is click-through unless a scrollbar is needed.
    list.classList.toggle(
      clickThroughClass,
      !!resizeObserver && list.scrollHeight <= list.clientHeight,
    );
  };
  let pending: number | undefined;
  const scheduleReposition = () => {
    if (pending !== undefined) return;
    pending = view.requestAnimationFrame(() => {
      pending = undefined;
      reposition();
    });
  };
  const onScroll = (event: Event) => {
    if (event.target instanceof view.Node && list.contains(event.target))
      return;
    scheduleReposition();
  };
  const onFocusIn = () => {
    reposition();
    scheduleReposition();
  };
  const onPointerDown = (event: PointerEvent) => {
    pressedPointers.add(event.pointerId);
  };
  const onPointerEnd = (event: PointerEvent) => {
    if (pressedPointers.delete(event.pointerId) && !pressedPointers.size)
      scheduleReposition();
  };
  const onWindowBlur = () => {
    if (!pressedPointers.size) return;
    pressedPointers.clear();
    scheduleReposition();
  };
  if (typeof view.ResizeObserver === 'function') {
    resizeObserver = new view.ResizeObserver(scheduleReposition);
    resizeObserver.observe(list);
  } else {
    console.warn(
      'cods-toast: ResizeObserver unavailable; shadow padding may block nearby controls',
      root,
    );
  }
  // Focus can be anywhere on the page, and scrolling or resizing can change
  // its position relative to this instance's fixed list. Pointer tracking
  // prevents the list from moving between a press and its click.
  const scrollOptions = { capture: true, passive: true } as const;
  list.addEventListener('pointerdown', onPointerDown, true);
  list.addEventListener('animationend', scheduleReposition);
  list.addEventListener('animationcancel', scheduleReposition);
  doc.addEventListener('focusin', onFocusIn);
  doc.addEventListener('focusout', scheduleReposition);
  doc.addEventListener('scroll', onScroll, scrollOptions);
  doc.addEventListener('pointerup', onPointerEnd, true);
  doc.addEventListener('pointercancel', onPointerEnd, true);
  view.addEventListener('resize', scheduleReposition);
  view.addEventListener('blur', onWindowBlur);
  instances.set(root, {
    polite,
    assertive,
    items: new Map(),
    reposition,
    resizeObserver,
    cleanupPositioning: () => {
      list.removeEventListener('pointerdown', onPointerDown, true);
      list.removeEventListener('animationend', scheduleReposition);
      list.removeEventListener('animationcancel', scheduleReposition);
      doc.removeEventListener('focusin', onFocusIn);
      doc.removeEventListener('focusout', scheduleReposition);
      doc.removeEventListener('scroll', onScroll, scrollOptions);
      doc.removeEventListener('pointerup', onPointerEnd, true);
      doc.removeEventListener('pointercancel', onPointerEnd, true);
      view.removeEventListener('resize', scheduleReposition);
      view.removeEventListener('blur', onWindowBlur);
      resizeObserver?.disconnect();
      if (pending !== undefined) view.cancelAnimationFrame(pending);
      resetPosition();
      list.classList.toggle(clickThroughClass, hadClickThroughClass);
    },
    announcements: [],
  });
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
  if (options.iconHref) {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('cods-toast__icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', options.iconHref);
    icon.append(use);
    item.append(icon);
  }
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
  instance.resizeObserver?.observe(item);
  const live =
    options.urgency === 'assertive' ? instance.assertive : instance.polite;
  instance.announcements.push({ live, message: options.message, item });
  if (!instance.announcementTimer) {
    const announce = () => {
      const next = instance.announcements.shift();
      if (!next) {
        delete instance.announcementTimer;
        return;
      }
      next.live.textContent = '';
      instance.announcementTimer = setTimeout(() => {
        if (root.contains(next.item)) next.live.textContent = next.message;
        instance.announcementTimer = setTimeout(announce, 1000);
      }, 50);
    };
    announce();
  }
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
      if (item.contains(document.activeElement)) {
        const previousTabindex = root.getAttribute('tabindex');
        root.setAttribute('tabindex', '-1');
        root.focus();
        if (previousTabindex === null) root.removeAttribute('tabindex');
        else root.setAttribute('tabindex', previousTabindex);
      }
    }
  });
  instance.reposition();
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
  instance.resizeObserver?.unobserve(item);
  item.remove();
  instance.reposition();
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
  instance.cleanupPositioning();
  if (instance.announcementTimer) clearTimeout(instance.announcementTimer);
  instance.announcements.length = 0;
  instance.polite.textContent = '';
  instance.assertive.textContent = '';
  instances.delete(root);
}
