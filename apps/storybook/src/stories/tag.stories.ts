import type { Meta, StoryObj } from '@storybook/html-vite';

// The story renders the canonical contract-sample fixture and style
// directly, rather than re-authoring markup, so this example and the
// component contract's fixture can never drift apart. See
// docs/governance/component-contract.md section 2.
import '../../../../docs/governance/component-contract-samples/static/tag/tag.scss';
import tagFixtureHtml from '../../../../docs/governance/component-contract-samples/static/tag/tag.fixture.html?raw';

const meta = {
  title: 'Contract samples/Tag',
  render: () => tagFixtureHtml,
} satisfies Meta;

export default meta;

type Story = StoryObj;

/**
 * Every documented `cods-tag` state (default, informational modifier,
 * long-content) rendered together, matching the component contract's
 * fixture file exactly.
 */
export const AllStates: Story = {};
