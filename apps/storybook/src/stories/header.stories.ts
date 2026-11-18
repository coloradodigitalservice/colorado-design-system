import type { Meta, StoryObj } from '@storybook/html-vite';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/header.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/header.html?raw';
import logoUrl from '@coloradodigitalservice/colorado-design-system/logos/cods-logo.svg?url';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import {
  destroyHeader,
  initAllHeaders,
} from '@coloradodigitalservice/colorado-design-system';

function renderMarkup(markup: string): string {
  return markup
    .replaceAll('/icons/sprite.svg', spriteUrl)
    .replaceAll('/logos/cods-logo.svg', logoUrl);
}

const mobile = { viewport: { defaultViewport: 'mobile1' } };

const meta = {
  title: 'Components/Header',
  render: () => renderMarkup(fixture),
  // USWDS resolves the header in the document, so initialize once mounted.
  play: ({ canvasElement }) => initAllHeaders(canvasElement),
  // Close an open drawer before the next story renders in the same preview.
  beforeEach: () => () =>
    document
      .querySelectorAll<HTMLElement>('[data-cods-header]')
      .forEach(destroyHeader),
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

/** Below 64em the navigation collapses behind the Menu button. */
export const MobileCollapsed: Story = { parameters: mobile };

/** The Menu button opens the USWDS drawer and moves focus to Close. */
export const Expanded: Story = {
  parameters: mobile,
  play: ({ canvasElement }) => {
    initAllHeaders(canvasElement);
    canvasElement
      .querySelector<HTMLButtonElement>('.cods-header__menu-button')
      ?.click();
  },
};

/** Without the controller every navigation link stays in the page flow. */
export const WithoutJavaScript: Story = { play: () => {} };
