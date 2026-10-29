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
  const comboBox: { on(root: HTMLElement): void; off(root: HTMLElement): void };
  export default comboBox;
}
