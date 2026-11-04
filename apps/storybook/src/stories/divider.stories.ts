import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/divider.json';

// Renders the canonical fixture and styles from the component directory so the
// story cannot drift from the contract fixture (component-contract.md section 2).
import '../../../../packages/colorado-design-system/src/components/divider/divider.scss';
import fixtureHtml from '../../../../packages/colorado-design-system/src/components/divider/divider.fixture.html?raw';

const meta = {
  title: 'Components/Divider',
  render: () => fixtureHtml,
} satisfies Meta;

export default meta;

type Story = StoryObj;

/** Every documented `cods-divider` state, rendered from the canonical fixture. */
export const AllStates: Story = {};

function renderState(state: string): string {
  const example = examples.examples.find((entry) => entry.state === state);
  if (!example) throw new Error(`Missing canonical state: ${state}`);
  return example.html;
}

export const Default: Story = { render: () => renderState('default') };
export const Item: Story = { render: () => renderState('item') };
