export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: [
    '**/dist/**',
    '**/generated/**',
    '**/node_modules/**',
    '**/storybook-static/**',
  ],
  rules: {
    // Allows the cods- BEM naming required by the component contract
    // (docs/governance/component-contract.md#3-css-conventions-and-cods--naming):
    // .cods-<name>, .cods-<name>__<element>, .cods-<name>--<modifier>.
    'selector-class-pattern': [
      '^cods-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { resolveNestedSelectors: true },
    ],
  },
  overrides: [
    {
      // Intentionally targets USWDS's own `.usa-*` vendor classes to override
      // their brand color/typography with Colorado tokens (see CODS-P1-015,
      // ADR-002).
      files: [
        '**/_cods-color-overrides.scss',
        '**/_cods-typography-overrides.scss',
      ],
      rules: {
        'selector-class-pattern': null,
      },
    },
  ],
};
