import uswdsComboBox from '@uswds/uswds/js/usa-combo-box';

const ROOT = '[data-cods-combo-box]';

type Attributes = Array<[string, string]>;
interface Instance {
  select: HTMLSelectElement;
  label: HTMLLabelElement;
  selectAttributes: Attributes;
  labelId: string | null;
  rootAttributes: Attributes;
  children: Set<ChildNode>;
  onChange: (event: Event) => void;
}
const instances = new WeakMap<HTMLElement, Instance>();

function attributes(element: Element): Attributes {
  return Array.from(element.attributes, ({ name, value }) => [name, value]);
}
function restore(element: Element, saved: Attributes): void {
  for (const { name } of Array.from(element.attributes))
    element.removeAttribute(name);
  for (const [name, value] of saved) element.setAttribute(name, value);
}

/** Enhance a connected, labeled select. Invalid markup is left untouched. */
export function init(root: HTMLElement): void {
  if (instances.has(root)) return;
  const select = root.querySelector<HTMLSelectElement>('select');
  const label = select?.id
    ? Array.from(
        root.ownerDocument.querySelectorAll<HTMLLabelElement>('label[for]'),
      ).find((item) => item.htmlFor === select.id)
    : undefined;
  if (
    !root.matches(ROOT) ||
    !root.classList.contains('usa-combo-box') ||
    !root.isConnected ||
    !select ||
    !label ||
    !/^[A-Za-z][A-Za-z0-9_-]*$/.test(select.id) ||
    Boolean(root.ownerDocument.getElementById(`${select.id}--list`)) ||
    Boolean(root.ownerDocument.getElementById(`${select.id}-label`)) ||
    root.querySelector('.usa-combo-box') !== null ||
    Boolean(root.parentElement?.closest('.usa-combo-box')) ||
    select.hasAttribute('aria-disabled') ||
    select.multiple ||
    root.querySelectorAll('select').length !== 1 ||
    root.ownerDocument.getElementById(select.id) !== select ||
    root.hasAttribute('data-enhanced') ||
    select.querySelector('optgroup, option:disabled')
  ) {
    console.warn(
      'cods-combo-box: expected a connected, labeled single select with a unique simple ID and no groups or disabled options; markup was left unchanged.',
      root,
    );
    return;
  }
  const instance: Instance = {
    select,
    label,
    selectAttributes: attributes(select),
    labelId: label.getAttribute('id'),
    rootAttributes: attributes(root),
    children: new Set(root.childNodes),
    onChange: (event) => {
      if (event.target !== select) return;
      root.dispatchEvent(
        new CustomEvent('cods-combo-box:change', {
          bubbles: true,
          composed: false,
          detail: { value: select.value },
        }),
      );
    },
  };
  const value = select.value;
  // USWDS only preserves a selection when data-default-value is present.
  if (value) root.dataset.defaultValue = value;
  uswdsComboBox.on(root);
  const input = root.querySelector<HTMLInputElement>('.usa-combo-box__input')!;
  input.classList.add('cods-combo-box__input');
  for (const name of [
    'aria-describedby',
    'aria-invalid',
    'aria-errormessage',
  ]) {
    if (select.hasAttribute(name))
      input.setAttribute(name, select.getAttribute(name)!);
  }
  // USWDS removes disabled from the native select, which would submit it.
  if (instance.selectAttributes.some(([name]) => name === 'disabled'))
    select.disabled = true;
  root.addEventListener('change', instance.onChange);
  instances.set(root, instance);
}

export function initAll(container: ParentNode = document): void {
  if (container instanceof HTMLElement && container.matches(ROOT))
    init(container);
  container.querySelectorAll<HTMLElement>(ROOT).forEach(init);
}

/** Remove generated controls while retaining the current selected value. */
export function destroy(root: HTMLElement): void {
  const instance = instances.get(root);
  if (!instance) return;
  root.removeEventListener('change', instance.onChange);
  uswdsComboBox.off(root);
  const value = instance.select.value;
  for (const child of Array.from(root.childNodes)) {
    if (!instance.children.has(child)) child.remove();
  }
  restore(instance.select, instance.selectAttributes);
  instance.select.value = value;
  if (instance.labelId === null) instance.label.removeAttribute('id');
  else instance.label.setAttribute('id', instance.labelId);
  restore(root, instance.rootAttributes);
  instances.delete(root);
}
