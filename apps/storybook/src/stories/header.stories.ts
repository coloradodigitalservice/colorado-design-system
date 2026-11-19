import type { Meta, StoryObj } from '@storybook/html-vite';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/header.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/header.html?raw';
import logoUrl from '@coloradodigitalservice/colorado-design-system/logos/cods-logo.svg?url';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import {
  destroyHeader,
  destroyLanguageSelector,
  initAllHeaders,
  initAllLanguageSelector,
} from '@coloradodigitalservice/colorado-design-system';

/** Render one fixture state; a document supports one Header at a time. */
function renderState(state: string): string {
  const template = document.createElement('template');
  template.innerHTML = fixture;
  const block = template.content.querySelector(
    `[data-cods-fixture-state="${state}"]`,
  );
  if (!block) throw new Error(`Missing Header fixture state: ${state}`);
  return block.outerHTML
    .replaceAll('/icons/sprite.svg', spriteUrl)
    .replaceAll('/logos/cods-logo.svg', logoUrl);
}

/** Examples don't run searches. */
const preventSubmit = (event: Event) => event.preventDefault();

function initialize(canvas: HTMLElement): void {
  initAllHeaders(canvas);
  initAllLanguageSelector(canvas);
  canvas.addEventListener('submit', preventSubmit);
}

/** The drawer only exists below 48em, so pin these stories to a phone viewport. */
const mobile = { viewport: { value: 'mobile1', isRotated: false } };

const meta = {
  title: 'Components/Header',
  render: () => renderState('default'),
  // USWDS resolves the header in the document, so initialize once mounted.
  play: ({ canvasElement }) => initialize(canvasElement),
  // Close an open drawer before the next story renders in the same preview.
  beforeEach: () => () => {
    document
      .querySelectorAll<HTMLElement>('[data-cods-header]')
      .forEach(destroyHeader);
    document
      .querySelectorAll<HTMLElement>('[data-cods-language-selector]')
      .forEach(destroyLanguageSelector);
  },
  parameters: {
    componentMetadata: metadata,
    controls: { disable: true },
    actions: { disable: true },
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

/** Wide viewports show the logo above a horizontal primary navigation. */
export const Default: Story = {};

/** Below 48em the navigation collapses behind the Menu button. */
export const MobileCollapsed: Story = { globals: mobile };

/** The Menu button opens the USWDS drawer and moves focus to Close. */
export const Expanded: Story = {
  globals: mobile,
  play: ({ canvasElement }) => {
    initialize(canvasElement);
    canvasElement
      .querySelector<HTMLButtonElement>('.cods-header__menu-button')
      ?.click();
  },
};

/**
 * Search, a language control, a dropdown, a multi-column mega menu, and a
 * categorized mega menu. Search and language changes are not performed.
 */
export const Full: Story = { render: () => renderState('full') };

/** Each submenu button opens its dropdown or mega menu. */
export const SubmenuExpanded: Story = {
  render: () => renderState('full'),
  play: ({ canvasElement }) => {
    initialize(canvasElement);
    canvasElement
      .querySelector<HTMLButtonElement>('.cods-header__toggle')
      ?.click();
  },
};

/** The mega menu spans the navigation. */
export const MegaMenuExpanded: Story = {
  render: () => renderState('full'),
  play: ({ canvasElement }) => {
    initialize(canvasElement);
    canvasElement
      .querySelector<HTMLButtonElement>(
        '[aria-controls="cods-header-agencies"]',
      )
      ?.click();
  },
};

/** In the drawer, submenus open as accordions. */
export const FullMobileExpanded: Story = {
  render: () => renderState('full'),
  globals: mobile,
  play: ({ canvasElement }) => {
    initialize(canvasElement);
    canvasElement
      .querySelector<HTMLButtonElement>('.cods-header__menu-button')
      ?.click();
    canvasElement
      .querySelector<HTMLButtonElement>('.cods-header__toggle')
      ?.click();
  },
};

/** Without the controller every navigation link stays in the page flow. */
export const WithoutJavaScript: Story = { play: () => {} };
