/**
 * Tooltip is a Type C (CoDS divergent) component. It keeps the USWDS tooltip
 * authoring model (a trigger whose `title` holds the text, `data-position` for
 * the preferred side) but replaces the USWDS behavior so that it can:
 *
 * - use the authored root as the wrapper, so the trigger never moves in the
 *   DOM and keeps focus during `init` and `destroy`;
 * - position the tooltip in the root's local coordinate space, so the arrow,
 *   gap, and hover bridge stay aligned inside scaled ancestors;
 * - stay next to (never over) the trigger when no side has room;
 * - reposition within the visible viewport and clipping ancestors when the
 *   page or an ancestor scrolls;
 * - point the arrow at the trigger when the body is shifted to fit; and
 * - reopen after Escape on any fresh hover or focus.
 *
 * See the metadata `divergenceNotes` and section 4.1 of
 * docs/governance/component-contract.md for the document/window listener
 * allowance this relies on.
 */

const ROOT = '[data-cods-tooltip]';
const TRIGGER = '[data-cods-tooltip-trigger]';
const POSITIONS = ['top', 'bottom', 'left', 'right'] as const;
type Position = (typeof POSITIONS)[number];
const OPPOSITE: Record<Position, Position> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};
const CLIPPING_OVERFLOW = new Set(['auto', 'scroll', 'hidden', 'clip']);
/** Space between trigger and body in CSS px; matches the arrow and hover bridge in tooltip.scss. */
const GAP = 6;
/** Keeps the arrow clear of the body's rounded corners, in CSS px. */
const ARROW_INSET = 12;

const instances = new WeakMap<HTMLElement, () => void>();
let sequence = 0;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));

/** Enhance a connected tooltip root. The trigger stays where it was authored. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const trigger = root.querySelector<HTMLElement>(TRIGGER);
  const text = trigger?.getAttribute('title')?.trim();
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!root.isConnected || !view || !trigger || !text) {
    console.warn(
      'cods-tooltip: expected a connected trigger with tooltip text in title',
      root,
    );
    return;
  }

  const authoredTitle = trigger.getAttribute('title');
  const authoredDescribedBy = trigger.getAttribute('aria-describedby');
  const preferred: Position =
    POSITIONS.find((side) => side === trigger.getAttribute('data-position')) ??
    'top';

  const body = doc.createElement('span');
  do body.id = `cods-tooltip-${++sequence}`;
  while (doc.getElementById(body.id));
  body.className = 'cods-tooltip__body';
  body.setAttribute('role', 'tooltip');
  body.hidden = true;
  body.textContent = text;
  root.append(body);
  trigger.removeAttribute('title');
  trigger.setAttribute(
    'aria-describedby',
    authoredDescribedBy ? `${authoredDescribedBy} ${body.id}` : body.id,
  );

  let hovered = false;
  let focused = doc.activeElement === trigger;
  let dismissed = false;
  let open = false;

  const place = () => {
    const t = trigger.getBoundingClientRect();
    const r = root.getBoundingClientRect();
    const { width: w, height: h } = body.getBoundingClientRect();
    // Ratio of rendered to layout size; 1 unless an ancestor is transformed.
    const scaleX = root.offsetWidth ? r.width / root.offsetWidth : 1;
    const scaleY = root.offsetHeight ? r.height / root.offsetHeight : 1;
    const gapX = GAP * scaleX;
    const gapY = GAP * scaleY;
    const vw = doc.documentElement.clientWidth || view.innerWidth;
    const vh = doc.documentElement.clientHeight || view.innerHeight;
    const bounds = { left: 0, top: 0, right: vw, bottom: vh };
    // Visible root overflow propagates the body's overflow to the viewport.
    const documentStyle = view.getComputedStyle(doc.documentElement);
    const bodyOverflowIsViewport =
      documentStyle.overflowX === 'visible' &&
      documentStyle.overflowY === 'visible';

    // Positioned ancestors can escape overflow clipping up to their containing block.
    let skipUntil: Element | null = null;
    for (
      let ancestor: HTMLElement | null = root;
      ancestor && ancestor !== doc.documentElement;
      ancestor = ancestor.parentElement
    ) {
      const style = view.getComputedStyle(ancestor);
      if (!skipUntil || ancestor === skipUntil) {
        skipUntil = null;
        const clipsX = CLIPPING_OVERFLOW.has(style.overflowX);
        const clipsY = CLIPPING_OVERFLOW.has(style.overflowY);
        if (
          (clipsX || clipsY) &&
          !(ancestor === doc.body && bodyOverflowIsViewport) &&
          style.display !== 'inline' &&
          style.display !== 'contents'
        ) {
          const box = ancestor.getBoundingClientRect();
          const clipScaleX = ancestor.offsetWidth
            ? box.width / ancestor.offsetWidth
            : 1;
          const clipScaleY = ancestor.offsetHeight
            ? box.height / ancestor.offsetHeight
            : 1;
          if (clipsX) {
            const left = box.left + ancestor.clientLeft * clipScaleX;
            bounds.left = Math.max(bounds.left, left);
            bounds.right = Math.min(
              bounds.right,
              left + ancestor.clientWidth * clipScaleX,
            );
          }
          if (clipsY) {
            const top = box.top + ancestor.clientTop * clipScaleY;
            bounds.top = Math.max(bounds.top, top);
            bounds.bottom = Math.min(
              bounds.bottom,
              top + ancestor.clientHeight * clipScaleY,
            );
          }
        }
      }
      if (
        style.display !== 'contents' &&
        (style.position === 'absolute' || style.position === 'fixed')
      ) {
        const containingBlock: Element | null = ancestor.offsetParent;
        if (!containingBlock) break;
        if (!skipUntil || containingBlock.contains(skipUntil))
          skipUntil = containingBlock;
      }
    }

    const main = (side: Position) => {
      switch (side) {
        case 'top':
          return t.top - gapY - h;
        case 'bottom':
          return t.bottom + gapY;
        case 'left':
          return t.left - gapX - w;
        case 'right':
          return t.right + gapX;
      }
    };
    const fits = (side: Position) => {
      const start = main(side);
      return side === 'top' || side === 'bottom'
        ? start >= bounds.top &&
            start + h <= bounds.bottom &&
            w <= bounds.right - bounds.left
        : start >= bounds.left &&
            start + w <= bounds.right &&
            h <= bounds.bottom - bounds.top;
    };
    const order: Position[] = [
      preferred,
      OPPOSITE[preferred],
      ...POSITIONS.filter(
        (side) => side !== preferred && side !== OPPOSITE[preferred],
      ),
    ];
    // Below is the only fallback that can extend normal page flow downward.
    // Fixed or clipping ancestors can still make the overflow unreachable.
    const side = order.find(fits) ?? 'bottom';

    const vertical = side === 'top' || side === 'bottom';
    const x = vertical
      ? clamp(t.left + (t.width - w) / 2, bounds.left, bounds.right - w)
      : main(side);
    const y = vertical
      ? main(side)
      : clamp(t.top + (t.height - h) / 2, bounds.top, bounds.bottom - h);

    for (const item of POSITIONS)
      body.classList.toggle(`cods-tooltip__body--${item}`, item === side);
    body.style.left = `${(x - r.left) / scaleX}px`;
    body.style.top = `${(y - r.top) / scaleY}px`;
    // Point the arrow at the trigger's center even when the body was shifted.
    const arrow = vertical
      ? clamp(
          (t.left + t.width / 2 - x) / scaleX,
          ARROW_INSET,
          w / scaleX - ARROW_INSET,
        )
      : clamp(
          (t.top + t.height / 2 - y) / scaleY,
          ARROW_INSET,
          h / scaleY - ARROW_INSET,
        );
    body.style.setProperty('--cods-tooltip-arrow-offset', `${arrow}px`);
  };

  /** Show or hide to match state; `emit` is false only during init. */
  const update = (emit = true) => {
    const next = (hovered || focused) && !dismissed;
    if (next === open) return;
    open = next;
    body.hidden = !next;
    if (next) place();
    if (!emit) return;
    root.dispatchEvent(
      new CustomEvent(`cods-tooltip:${next ? 'open' : 'close'}`, {
        bubbles: true,
        detail: { trigger },
      }),
    );
  };
  // A fresh hover or focus always reopens a tooltip dismissed with Escape,
  // even while the other modality is still active.
  const enter = () => {
    hovered = true;
    dismissed = false;
    update();
  };
  const leave = () => {
    hovered = false;
    update();
  };
  const focus = () => {
    focused = true;
    dismissed = false;
    update();
  };
  const blur = () => {
    focused = false;
    update();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      dismissed = true;
      update();
    }
  };
  const reposition = () => {
    if (open) place();
  };

  // Instance-owned document/window listeners (contract section 4.1): Escape
  // must work wherever the pointer is, and scrolling any ancestor or resizing
  // the viewport moves the trigger. All are removed in destroy.
  const scrollOptions = { capture: true, passive: true } as const;
  root.addEventListener('mouseenter', enter);
  root.addEventListener('mouseleave', leave);
  trigger.addEventListener('focus', focus);
  trigger.addEventListener('blur', blur);
  doc.addEventListener('keydown', keydown);
  doc.addEventListener('scroll', reposition, scrollOptions);
  view.addEventListener('resize', reposition);

  instances.set(root, () => {
    root.removeEventListener('mouseenter', enter);
    root.removeEventListener('mouseleave', leave);
    trigger.removeEventListener('focus', focus);
    trigger.removeEventListener('blur', blur);
    doc.removeEventListener('keydown', keydown);
    doc.removeEventListener('scroll', reposition, scrollOptions);
    view.removeEventListener('resize', reposition);
    body.remove();
    if (authoredTitle === null) trigger.removeAttribute('title');
    else trigger.setAttribute('title', authoredTitle);
    if (authoredDescribedBy === null)
      trigger.removeAttribute('aria-describedby');
    else trigger.setAttribute('aria-describedby', authoredDescribedBy);
  });
  // Show the tooltip for an already-focused trigger without emitting an event.
  update(false);
}

export function initAll(container: ParentNode = document): void {
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

export function destroy(root: HTMLElement): void {
  instances.get(root)?.();
  instances.delete(root);
}
