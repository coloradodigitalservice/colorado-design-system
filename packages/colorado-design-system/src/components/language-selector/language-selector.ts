import uswdsLanguageSelector from '@uswds/uswds/js/usa-language-selector';

const ROOT = '[data-cods-language-selector]';

/** Detail of the bubbling `cods-language-selector:change` event. */
export interface LanguageSelectorChangeDetail {
  /** `true` when the language list opened, `false` when it closed. */
  expanded: boolean;
}
const instances = new WeakMap<
  HTMLElement,
  {
    button: HTMLButtonElement;
    panel: HTMLElement;
    observer: MutationObserver;
    sync: () => void;
    buttonHidden: boolean;
    panelHidden: boolean;
    expanded: string | null;
  }
>();

/** Enhance a connected disclosure, leaving the language links visible without JavaScript. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const button = root.querySelector<HTMLButtonElement>(
    '[data-cods-language-selector-trigger]',
  );
  const panel = root.querySelector<HTMLElement>(
    '[data-cods-language-selector-panel]',
  );
  const item = button?.closest('.usa-language__primary-item');
  // USWDS delegates through these classes; without them the trigger would not work.
  if (
    !root.isConnected ||
    !button ||
    !panel ||
    !button.matches('button.usa-language__link') ||
    !panel.matches('.usa-language__submenu') ||
    !item?.contains(panel) ||
    !item.parentElement?.matches('.usa-language__primary') ||
    !root.contains(item) ||
    !panel.id ||
    button.getAttribute('aria-controls') !== panel.id ||
    root.ownerDocument.getElementById(panel.id) !== panel
  ) {
    console.warn('cods-language-selector: invalid disclosure markup', root);
    return;
  }
  const buttonHidden = button.hasAttribute('hidden');
  const panelHidden = panel.hasAttribute('hidden');
  const expanded = button.getAttribute('aria-expanded');
  uswdsLanguageSelector.on(root);
  root.setAttribute('data-cods-language-selector-enhanced', '');
  button.hidden = false;
  button.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
  let current = false;
  const sync = () => {
    const next = button.getAttribute('aria-expanded') === 'true';
    if (next === current) return;
    current = next;
    root.dispatchEvent(
      new CustomEvent<LanguageSelectorChangeDetail>(
        'cods-language-selector:change',
        {
          bubbles: true,
          detail: { expanded: next },
        },
      ),
    );
  };
  const observer = new MutationObserver(sync);
  observer.observe(button, {
    attributes: true,
    attributeFilter: ['aria-expanded'],
  });
  for (const name of ['click', 'keydown', 'focusout'])
    root.addEventListener(name, sync);
  instances.set(root, {
    button,
    panel,
    observer,
    sync,
    buttonHidden,
    panelHidden,
    expanded,
  });
}

/** Enhance disclosures contained in the supplied node. */
export function initAll(container: ParentNode = document): void {
  if (container instanceof HTMLElement && container.matches(ROOT))
    init(container);
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Remove enhancement and restore the visible links. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  instance.observer.disconnect();
  for (const name of ['click', 'keydown', 'focusout'])
    root.removeEventListener(name, instance.sync);
  uswdsLanguageSelector.off(root);
  readopt(root);
  instance.button.hidden = instance.buttonHidden;
  if (instance.expanded === null)
    instance.button.removeAttribute('aria-expanded');
  else instance.button.setAttribute('aria-expanded', instance.expanded);
  instance.panel.hidden = instance.panelHidden;
  root.removeAttribute('data-cods-language-selector-enhanced');
  instances.delete(root);
}

/**
 * USWDS teardown clears its module-wide open-menu reference, which leaves any
 * other open selector unable to close. Re-register that menu with USWDS: a
 * trigger click while nothing is tracked marks it active and keeps it open.
 * The click is stopped at its root so bubbling page listeners never see it.
 */
function readopt(destroyed: HTMLElement): void {
  document
    .querySelectorAll<HTMLElement>(
      `${ROOT}[data-cods-language-selector-enhanced]`,
    )
    .forEach((root) => {
      if (root === destroyed) return;
      const instance = instances.get(root);
      if (instance?.button.getAttribute('aria-expanded') !== 'true') return;
      const stop = (event: Event) => event.stopPropagation();
      root.addEventListener('click', stop);
      instance.button.click();
      root.removeEventListener('click', stop);
    });
}
