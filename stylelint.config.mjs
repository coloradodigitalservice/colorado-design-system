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
};
