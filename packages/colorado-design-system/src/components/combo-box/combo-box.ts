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
  onInput: () => void;
  onReset: (event: Event) => void;
  decorate: () => void;
  form: HTMLFormElement | null;
}
const instances = new WeakMap<HTMLElement, Instance>();
const warned = new WeakSet<HTMLElement>();

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
    select.querySelector('option[disabled], optgroup[disabled]') ||
    new Set(
      Array.from(select.options)
        .filter((option) => option.value)
        .map((option) => option.value),
    ).size !==
      Array.from(select.options).filter((option) => option.value).length
  ) {
    if (!warned.has(root)) {
      console.warn(
        'cods-combo-box: expected a connected, labeled single select with a unique simple ID and no duplicate values or disabled options; markup was left unchanged.',
        root,
      );
      warned.add(root);
    }
    return;
  }
  let currentValue = select.value;
  const instance: Instance = {
    select,
    label,
    selectAttributes: attributes(select),
    labelId: label.getAttribute('id'),
    rootAttributes: attributes(root),
    children: new Set(root.childNodes),
    form: select.form,
    decorate: () => {
      let previousGroup = '';
      const options = new Map(
        Array.from(select.options, (option) => [option.value, option]),
      );
      for (const item of root.querySelectorAll<HTMLElement>(
        '[role="option"]',
      )) {
        const option = options.get(item.dataset.value ?? '');
        const group =
          option?.parentElement instanceof HTMLOptGroupElement
            ? option.parentElement.label
            : '';
        if (group)
          item.setAttribute('aria-label', `${group}: ${option?.text ?? ''}`);
        if (group && group !== previousGroup)
          item.dataset.codsComboBoxGroup = group;
        else delete item.dataset.codsComboBoxGroup;
        previousGroup = group;
      }
    },
    onInput: () => {
      const input = root.querySelector<HTMLInputElement>(
        '.usa-combo-box__input',
      );
      if (!input) return;
      const selectedText = select.value
        ? (select.selectedOptions[0]?.text ?? '')
        : '';
      input.setCustomValidity(
        input.value === selectedText ? '' : 'Select an option from the list.',
      );
    },
    onReset: (event) => {
      setTimeout(() => {
        if (event.defaultPrevented || instances.get(root) !== instance) return;
        const input = root.querySelector<HTMLInputElement>(
          '.usa-combo-box__input',
        )!;
        input.value = select.value
          ? (select.selectedOptions[0]?.text ?? '')
          : '';
        input.setCustomValidity('');
        currentValue = select.value;
        root.classList.toggle('usa-combo-box--pristine', Boolean(select.value));
        uswdsComboBox.hideList(root);
      }, 0);
    },
    onChange: (event) => {
      instance.onInput();
      if (event.target !== select || select.value === currentValue) return;
      currentValue = select.value;
      const message = select.value
        ? `${select.selectedOptions[0]?.text ?? ''} selected.`
        : 'Selection cleared.';
      queueMicrotask(() => {
        if (instances.get(root) !== instance) return;
        const status = root.querySelector<HTMLElement>('[role="status"]');
        if (status) status.textContent = message;
      });
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
  root
    .querySelector('.usa-combo-box__toggle-list')
    ?.classList.add('cods-combo-box__toggle');
  root
    .querySelector('.usa-combo-box__clear-input')
    ?.classList.add('cods-combo-box__clear');
  root
    .querySelector('.usa-combo-box__list')
    ?.classList.add('cods-combo-box__list');
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
  root.addEventListener('input', instance.onInput);
  for (const type of ['input', 'click', 'keydown'])
    root.addEventListener(type, instance.decorate);
  root.addEventListener('change', instance.onChange);
  instance.form?.addEventListener('reset', instance.onReset);
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
  root.removeEventListener('input', instance.onInput);
  for (const type of ['input', 'click', 'keydown'])
    root.removeEventListener(type, instance.decorate);
  root.removeEventListener('change', instance.onChange);
  instance.form?.removeEventListener('reset', instance.onReset);
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
