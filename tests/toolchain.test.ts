import { describe, expect, it } from 'vitest';

describe('DOM test environment', () => {
  it('dispatches an interaction to a real DOM element', () => {
    const button = document.createElement('button');
    let activationCount = 0;
    button.addEventListener('click', () => activationCount++);

    button.click();

    expect(activationCount).toBe(1);
  });
});
