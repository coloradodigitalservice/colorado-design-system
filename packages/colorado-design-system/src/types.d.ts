/**
 * Type declarations for static asset imports
 */

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

declare module '@uswds/uswds/js/usa-accordion' {
  const accordion: {
    BUTTON: string;
    ACCORDION: string;
    on(root: HTMLElement): void;
    off(root: HTMLElement): void;
    toggle(button: HTMLButtonElement, expanded: boolean): void;
  };
  export default accordion;
}

declare module '@uswds/uswds/js/usa-combo-box' {
  const comboBox: {
    on(root: HTMLElement): void;
    off(root: HTMLElement): void;
    hideList(root: HTMLElement): void;
    displayList(root: HTMLElement): void;
  };
  export default comboBox;
}

declare module '@uswds/uswds/js/usa-language-selector' {
  const selector: { on(root: HTMLElement): void; off(root: HTMLElement): void };
  export default selector;
}

declare module '@uswds/uswds/js/usa-modal' {
  const modal: {
    on(root: HTMLElement): void;
    off(root: HTMLElement): void;
    toggleModal(event: Event | false): boolean;
    focusTrap: { update(active: boolean): void } | null;
  };
  export default modal;
}
