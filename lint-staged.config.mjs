export default {
  '*.{js,cjs,mjs,ts,tsx,astro}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss}': ['stylelint --fix'],
  '*.{md,json,yml,yaml}': ['prettier --write'],
};
