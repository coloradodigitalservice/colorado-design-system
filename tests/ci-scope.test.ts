import { describe, expect, it } from 'vitest';
// @ts-expect-error The scope selector is also executable without a TS build.
import { selectScope } from '../scripts/ci-scope.mjs';

describe('CI job selection', () => {
  it.each([
    ['docs/BUILD.md', [false, false, false]],
    ['apps/web/src/content/docs/getting-started.md', [false, true, false]],
    ['apps/storybook/src/stories/tag.stories.ts', [false, false, true]],
    [
      'packages/colorado-design-tokens/src/color.tokens.json',
      [true, true, true],
    ],
    ['packages/colorado-design-system/src/index.ts', [true, true, true]],
    [
      'docs/governance/component-contract-samples/static/tag/tag.scss',
      [true, true, true],
    ],
    ['pnpm-lock.yaml', [true, true, true]],
    ['new-workspace/index.ts', [true, true, true]],
  ])('selects downstream validation for %s', (path, expected) => {
    expect(Object.values(selectScope([path]))).toEqual(expected);
  });
  it('combines independent app changes', () => {
    expect(
      selectScope(['apps/web/package.json', 'apps/storybook/package.json']),
    ).toEqual({ code: false, web: true, storybook: true });
  });
});
