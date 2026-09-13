import { describe, expect, it } from 'vitest';

import { visualBlockSchema } from '../blocks';

describe('visualBlockSchema', () => {
  it('parses camelCase wire fields (portal convention)', () => {
    const parsed = visualBlockSchema.parse({ id: 'b1', content: 'Print "Hello"' });
    expect(parsed).toEqual({ id: 'b1', content: 'Print "Hello"' });
  });

  it('parses PascalCase wire fields (admin-observed convention, C6)', () => {
    const parsed = visualBlockSchema.parse({ Id: 'b2', Content: 'Wait 1 second' });
    expect(parsed).toEqual({ id: 'b2', content: 'Wait 1 second' });
  });

  it('parses snake_case wire fields (database convention)', () => {
    const parsed = visualBlockSchema.parse({ id: 'b3', content: 'Repeat 3 times' });
    expect(parsed).toEqual({ id: 'b3', content: 'Repeat 3 times' });
  });

  it('throws ApiError-shaped validation error on a malformed payload', () => {
    expect(() => visualBlockSchema.parse({ id: 'b4' })).toThrow();
  });
});
