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
    toggle(button: HTMLButtonElement, expanded: boolean): void;
  };
  export default accordion;
}
