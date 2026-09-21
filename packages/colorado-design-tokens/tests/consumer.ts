import tokens from '@coloradodigitalservice/colorado-design-tokens/tokens.json' with { type: 'json' };
import type { TokenName } from '@coloradodigitalservice/colorado-design-tokens/types';

const name: TokenName = 'color-text-primary';
const color: string = tokens[name];
const weight: number = tokens['font-weight-medium'];
// @ts-expect-error An undocumented token must not be accepted.
const unknown: TokenName = 'color-surface-info';
// @ts-expect-error CSS dimensions are strings, not numeric pixel counts.
const size: number = tokens['space-sm'];
void [color, weight, unknown, size];
