import uswdsLanguageSelector from '@uswds/uswds/js/usa-language-selector';

const ROOT = '[data-cods-language-selector]';
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
  if (
    !root.isConnected ||
    !button ||
    !panel ||
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
      new CustomEvent('cods-language-selector:change', {
        bubbles: true,
        detail: { expanded: next },
      }),
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
  instance.button.hidden = instance.buttonHidden;
  if (instance.expanded === null)
    instance.button.removeAttribute('aria-expanded');
  else instance.button.setAttribute('aria-expanded', instance.expanded);
  instance.panel.hidden = instance.panelHidden;
  root.removeAttribute('data-cods-language-selector-enhanced');
  instances.delete(root);
}
