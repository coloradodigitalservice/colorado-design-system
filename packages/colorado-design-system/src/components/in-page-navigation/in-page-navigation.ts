const ROOT = '[data-cods-in-page-navigation]';

type LinkTarget = {
  link: HTMLAnchorElement;
  target: HTMLElement;
  current: string | null;
};

interface Instance {
  observer: IntersectionObserver;
  lastObserver: IntersectionObserver;
  links: LinkTarget[];
}

export interface InPageNavigationChangeDetail {
  id: string;
}

const instances = new WeakMap<HTMLElement, Instance>();

/** Enhance an authored list of links to sections in the same document. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const view = root.ownerDocument.defaultView;
  if (!view || !view.IntersectionObserver) return;
  const anchors = [...root.querySelectorAll<HTMLAnchorElement>('a[href]')];
  const links: LinkTarget[] = [];
  for (const link of anchors) {
    const href = link.getAttribute('href') ?? '';
    let id: string;
    try {
      id = href.startsWith('#') ? decodeURIComponent(href.slice(1)) : '';
    } catch {
      id = '';
    }
    const target = id && root.ownerDocument.getElementById(id);
    if (
      !target ||
      target.tagName !== 'SECTION' ||
      links.some((item) => item.target === target)
    ) {
      console.warn(
        'cods-in-page-navigation: links need unique section targets',
        root,
      );
      return;
    }
    links.push({ link, target, current: link.getAttribute('aria-current') });
  }
  if (!links.length) {
    console.warn('cods-in-page-navigation: no section links found', root);
    return;
  }

  let active: LinkTarget | undefined;
  const setCurrent = (next: LinkTarget, notify: boolean) => {
    if (active === next) return;
    for (const { link } of links) link.removeAttribute('aria-current');
    next.link.setAttribute('aria-current', 'location');
    if (notify && active) {
      root.dispatchEvent(
        new CustomEvent<InPageNavigationChangeDetail>(
          'cods-in-page-navigation:change',
          {
            bubbles: true,
            composed: false,
            detail: { id: next.target.id },
          },
        ),
      );
    }
    active = next;
  };
  const update = (notify: boolean) => {
    if (!instances.has(root)) return;
    const visible = links.filter(
      ({ target }) => target.getClientRects().length,
    );
    if (!visible.length) return;
    let next = visible[0]!;
    for (const item of visible) {
      if (item.target.getBoundingClientRect().top <= view.innerHeight * 0.25)
        next = item;
    }
    const last = visible[visible.length - 1]!;
    const lastRect = last.target.getBoundingClientRect();
    if (
      view.scrollY > 0 &&
      lastRect.top >= 0 &&
      lastRect.bottom <= view.innerHeight
    ) {
      next = last;
    }
    const page = root.ownerDocument.documentElement;
    if (
      page.scrollHeight > view.innerHeight &&
      view.scrollY + view.innerHeight >= page.scrollHeight - 1
    ) {
      next = visible[visible.length - 1]!;
    }
    setCurrent(next, notify);
  };
  const observer = new view.IntersectionObserver(() => update(true), {
    rootMargin: '0px 0px -75% 0px',
  });
  const lastObserver = new view.IntersectionObserver(() => update(true), {
    threshold: 1,
  });
  instances.set(root, { observer, lastObserver, links });
  for (const { target } of links) observer.observe(target);
  lastObserver.observe(links[links.length - 1]!.target);
  update(false);
}

/** Enhance each navigation inside the container. */
export function initAll(container: ParentNode = document): void {
  if (container instanceof HTMLElement && container.matches(ROOT))
    init(container);
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Remove listeners and restore authored current states. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instances.delete(root);
  instance.observer.disconnect();
  instance.lastObserver.disconnect();
  for (const { link, current } of instance.links) {
    if (current === null) link.removeAttribute('aria-current');
    else link.setAttribute('aria-current', current);
  }
}
