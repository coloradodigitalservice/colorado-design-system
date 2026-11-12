import tooltip from '@uswds/uswds/js/usa-tooltip';

const ROOT = '[data-cods-tooltip]';
const instances = new WeakMap<HTMLElement, () => void>();

/** Enhance a connected tooltip trigger using USWDS positioning and markup. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const trigger = root.querySelector<HTMLElement>(
    '.usa-tooltip[data-cods-tooltip-trigger]',
  );
  if (!root.isConnected || !trigger || !trigger.getAttribute('title')?.trim()) {
    console.warn(
      'cods-tooltip: expected a connected trigger with tooltip text in title',
      root,
    );
    return;
  }
  const attributes = [
    'class',
    'title',
    'tabindex',
    'aria-describedby',
    'data-position',
  ] as const;
  const original = new Map(
    attributes.map((name) => [name, trigger.getAttribute(name)]),
  );
  const { wrapper, tooltipBody, position } = tooltip.setup(trigger);
  const describedBy = original.get('aria-describedby');
  if (describedBy)
    trigger.setAttribute(
      'aria-describedby',
      `${describedBy} ${tooltipBody.id}`,
    );
  const tabIndex = original.get('tabindex');
  if (tabIndex === null) trigger.removeAttribute('tabindex');
  else if (tabIndex !== undefined) trigger.setAttribute('tabindex', tabIndex);
  wrapper.classList.add('cods-tooltip__wrapper');
  tooltipBody.classList.add('cods-tooltip__body');
  let hovered = false;
  let focused = false;
  let dismissed = false;
  let open = false;
  const place = () => {
    const triggerRect = trigger.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const bodyRect = tooltipBody.getBoundingClientRect();
    const gap = 5; // Matches the USWDS tooltip arrow and pointer bridge.
    const positions = ['top', 'bottom', 'left', 'right'] as const;
    type Position = (typeof positions)[number];
    const preferred: Position =
      positions.find((item) => item === position) ?? 'top';
    const coords = (side: Position) => {
      switch (side) {
        case 'top':
          return {
            x: triggerRect.left + (triggerRect.width - bodyRect.width) / 2,
            y: triggerRect.top - bodyRect.height - gap,
          };
        case 'bottom':
          return {
            x: triggerRect.left + (triggerRect.width - bodyRect.width) / 2,
            y: triggerRect.bottom + gap,
          };
        case 'left':
          return {
            x: triggerRect.left - bodyRect.width - gap,
            y: triggerRect.top + (triggerRect.height - bodyRect.height) / 2,
          };
        case 'right':
          return {
            x: triggerRect.right + gap,
            y: triggerRect.top + (triggerRect.height - bodyRect.height) / 2,
          };
      }
    };
    const view = root.ownerDocument.defaultView!;
    const options = [
      preferred,
      ...positions.filter((item) => item !== preferred),
    ];
    const side =
      options.find((item) => {
        const { x, y } = coords(item);
        return item === 'top' || item === 'bottom'
          ? y >= 0 && y + bodyRect.height <= view.innerHeight
          : x >= 0 && x + bodyRect.width <= view.innerWidth;
      }) ?? preferred;
    const { x, y } = coords(side);
    for (const item of positions)
      tooltipBody.classList.toggle(`usa-tooltip__body--${item}`, item === side);
    const wrapperStyle = view.getComputedStyle(wrapper);
    const scaleX = wrapperRect.width / parseFloat(wrapperStyle.width) || 1;
    const scaleY = wrapperRect.height / parseFloat(wrapperStyle.height) || 1;
    tooltipBody.style.left = `${(Math.max(0, Math.min(x, view.innerWidth - bodyRect.width)) - wrapperRect.left) / scaleX}px`;
    tooltipBody.style.top = `${(Math.max(0, Math.min(y, view.innerHeight - bodyRect.height)) - wrapperRect.top) / scaleY}px`;
    tooltipBody.style.bottom = '';
    tooltipBody.style.right = '';
    tooltipBody.style.margin = '0';
  };
  const update = () => {
    const next = (hovered || focused) && !dismissed;
    if (next === open) return;
    open = next;
    if (next) {
      tooltip.show(tooltipBody, trigger, position);
      place();
    } else tooltip.hide(tooltipBody);
    root.dispatchEvent(
      new CustomEvent(`cods-tooltip:${next ? 'open' : 'close'}`, {
        bubbles: true,
        detail: { trigger },
      }),
    );
  };
  const enter = () => {
    hovered = true;
    update();
  };
  const leave = () => {
    hovered = false;
    if (!focused) dismissed = false;
    update();
  };
  const focus = () => {
    focused = true;
    update();
  };
  const blur = () => {
    focused = false;
    if (!hovered) dismissed = false;
    update();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      dismissed = true;
      update();
    }
  };
  const resize = () => {
    if (open) place();
  };
  wrapper.addEventListener('mouseenter', enter);
  wrapper.addEventListener('mouseleave', leave);
  trigger.addEventListener('focus', focus);
  trigger.addEventListener('blur', blur);
  root.ownerDocument.addEventListener('keydown', keydown);
  root.ownerDocument.defaultView?.addEventListener('resize', resize);
  instances.set(root, () => {
    wrapper.removeEventListener('mouseenter', enter);
    wrapper.removeEventListener('mouseleave', leave);
    trigger.removeEventListener('focus', focus);
    trigger.removeEventListener('blur', blur);
    root.ownerDocument.removeEventListener('keydown', keydown);
    root.ownerDocument.defaultView?.removeEventListener('resize', resize);
    wrapper.replaceWith(trigger);
    for (const [name, value] of original) {
      if (value === null || value === undefined) trigger.removeAttribute(name);
      else trigger.setAttribute(name, value);
    }
  });
}

export function initAll(container: ParentNode = document): void {
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

export function destroy(root: HTMLElement): void {
  instances.get(root)?.();
  instances.delete(root);
}
