import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/in-page-alert.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/in-page-alert.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/in-page-alert.html?raw';

function renderState(name: string): string {
  const example = examples.examples.find((example) => example.state === name);
  if (!example) throw new globalThis.Error(`Missing canonical state: ${name}`);
  return example.html;
}

const meta = {
  title: 'Components/In-Page Alert',
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
export const Default: Story = { render: () => renderState('default') };
export const Info: Story = { render: () => renderState('info') };
export const Success: Story = { render: () => renderState('success') };
export const Warning: Story = { render: () => renderState('warning') };
export const Error: Story = { render: () => renderState('error') };
export const WithoutHeading: Story = {
  render: () => renderState('without-heading'),
};
export const HeadingOnly: Story = { render: () => renderState('heading-only') };
export const LongContent: Story = { render: () => renderState('long-content') };
export const Spanish: Story = { render: () => renderState('localization') };
export const ArabicRtl: Story = { render: () => renderState('rtl') };
export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLAnchorElement>('.cods-in-page-alert__link')
      ?.focus();
  },
};
function dynamicStory(state: 'dynamic-status' | 'dynamic-alert'): Story {
  return {
    render: () => {
      const host = document.createElement('div');
      host.innerHTML = renderState(state);
      const body = host.querySelector<HTMLElement>(
        '.cods-in-page-alert__body',
      )!;
      body.replaceChildren();
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Show contextual message';
      button.addEventListener('click', () => {
        const template = document.createElement('template');
        template.innerHTML = renderState(state);
        body.innerHTML = template.content.querySelector(
          '.cods-in-page-alert__body',
        )!.innerHTML;
      });
      host.prepend(button);
      return host;
    },
  };
}
export const DynamicStatus: Story = dynamicStory('dynamic-status');
export const DynamicAlert: Story = dynamicStory('dynamic-alert');
