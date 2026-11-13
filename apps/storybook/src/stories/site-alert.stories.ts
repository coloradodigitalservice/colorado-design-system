import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/site-alert.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/site-alert.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/site-alert.html?raw';

function renderState(name: string): string {
  const example = examples.examples.find((example) => example.state === name);
  if (!example) throw new Error(`Missing canonical state: ${name}`);
  return example.html;
}

const meta = {
  title: 'Components/Site Alert',
  render: () => fixture,
  parameters: {
    componentMetadata: metadata,
    controls: { disable: true },
    actions: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Informational: Story = {
  render: () => renderState('informational'),
};
export const Emergency: Story = { render: () => renderState('emergency') };
export const LongContent: Story = { render: () => renderState('long-content') };
export const Spanish: Story = { render: () => renderState('localization') };
export const ArabicRtl: Story = { render: () => renderState('rtl') };

export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLAnchorElement>('.cods-site-alert__link')
      ?.focus();
  },
};

export const Default: Story = { render: () => renderState('default') };

export const PagePlacement: Story = {
  render: () => {
    const template = document.createElement('template');
    template.innerHTML = renderState('default');
    const notice =
      template.content.querySelector('.cods-site-alert')!.outerHTML;
    return `<a href="#site-alert-demo-main">Skip to main content</a>
      ${notice}
      <header><a href="#site-alert-demo-main">Example service home</a></header>
      <main id="site-alert-demo-main" tabindex="-1"><h1>Example service</h1><p>Page content follows the sitewide notice and header.</p></main>`;
  },
};

export const Warning: Story = { render: () => renderState('warning') };
