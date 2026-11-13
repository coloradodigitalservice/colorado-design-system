import type { Meta, StoryObj } from '@storybook/html-vite';

// Renders the canonical fixture and styles from the component directory so the
// story cannot drift from the contract fixture (component-contract.md section 2).
import '../../../../packages/colorado-design-system/src/components/icon/icon.scss';
import fixtureHtml from '../../../../packages/colorado-design-system/src/components/icon/icon.fixture.html?raw';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';

const meta = {
  title: 'Components/Icon',
  render: () => fixtureHtml.replaceAll('/icons/sprite.svg', spriteUrl),
} satisfies Meta;

export default meta;

type Story = StoryObj;

/** Default state, rendered from the canonical fixture. */
export const Default: Story = {};
