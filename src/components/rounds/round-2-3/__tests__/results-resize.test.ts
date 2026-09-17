import { describe, expect, it } from 'vitest';

import { MIN_EDITOR_SLOT_PX, MIN_RESULTS_PX, resizeResults } from '../results-resize';

describe('resizeResults', () => {
  it('grows the results panel when the divider is dragged up', () => {
    expect(resizeResults(500, 355, -45)).toBe(400);
  });

  it('shrinks the results panel when the divider is dragged down', () => {
    expect(resizeResults(500, 355, 55)).toBe(300);
  });

  it('never shrinks the results panel below its minimum', () => {
    expect(resizeResults(500, 355, 1000)).toBe(MIN_RESULTS_PX);
  });

  it('never squeezes the editor slot below its minimum', () => {
    expect(resizeResults(500, 355, -1000)).toBe(855 - MIN_EDITOR_SLOT_PX);
  });

  it('leaves the height unchanged when there is no room for both minimums', () => {
    expect(resizeResults(200, 150, -50)).toBe(150);
  });
});
