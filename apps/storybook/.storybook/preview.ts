// Shared tokens and styles load from the package boundary: the compiled
// package stylesheet, not this app reaching into the package's source.
import '@coloradodigitalservice/colorado-design-system/styles';

import type { Preview } from '@storybook/html-vite';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    a11y: {
      test: 'error',
    },
  },
};

export default preview;
