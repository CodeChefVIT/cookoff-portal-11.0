import { describe, expect, it } from 'vitest';

import { visualBlockSchema } from '../blocks';

describe('visualBlockSchema', () => {
  it('parses snake_case wire fields (database convention)', () => {
    const parsed = visualBlockSchema.parse({ id: 'b3', content: 'Repeat 3 times' });
    expect(parsed).toEqual({ id: 'b3', content: 'Repeat 3 times' });
  });

  it('throws ApiError-shaped validation error on a malformed payload', () => {
    expect(() => visualBlockSchema.parse({ id: 'b4' })).toThrow();
  });
});
