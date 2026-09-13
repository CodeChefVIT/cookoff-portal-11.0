import { describe, expect, it } from 'vitest';

import { stackBlockPath } from '../block-shape';

// Figma node 323:2374, "change x by" block (179 × 62.5 incl. tab).
const FIGMA_PATH =
  'M9.7 0.7H29.7C32.7 0.7 33.7 6.7 38.7 6.7H50.7C55.7 6.7 56.7 0.7 59.7 0.7H169.7C175.7 0.7 179.7 3.7 179.7 9.7V47.7C179.7 53.7 175.7 56.7 169.7 56.7H59.7C56.7 56.7 55.7 63.2 50.7 63.2H38.7C33.7 63.2 32.7 56.7 29.7 56.7H9.7C3.7 56.7 0.7 53.7 0.7 47.7V9.7C0.7 3.7 3.7 0.7 9.7 0.7Z';

describe('stackBlockPath', () => {
  it('reproduces the Figma outline at the Figma size', () => {
    expect(stackBlockPath(180.4, 57.4)).toBe(FIGMA_PATH);
  });

  it('keeps the notch and tab fixed while the right edge follows the width', () => {
    const path = stackBlockPath(300, 57.4);
    expect(path).toContain('C32.7 0.7 33.7 6.7 38.7 6.7');
    expect(path).toContain('H289.3C295.3 0.7 299.3 3.7 299.3 9.7');
  });
});
