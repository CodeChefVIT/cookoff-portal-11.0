import { describe, expect, it } from 'vitest';

import { MIN_PANEL_PX, resizePair } from '../column-resize';

const FRACTIONS = [300, 600, 450];

describe('resizePair', () => {
  it('moves share between the two neighbours and leaves the third column alone', () => {
    const next = resizePair(FRACTIONS, 0, 300, 600, 100);
    expect(next[0]).toBeCloseTo(400);
    expect(next[1]).toBeCloseTo(500);
    expect(next[2]).toBe(450);
  });

  it('preserves the combined share of the pair', () => {
    const next = resizePair(FRACTIONS, 1, 600, 450, -137);
    expect(next[1]! + next[2]!).toBeCloseTo(1050);
  });

  it('never shrinks either neighbour below the minimum width', () => {
    const shrinkLeft = resizePair(FRACTIONS, 0, 300, 600, -1000);
    expect((shrinkLeft[0]! / 900) * 900).toBeCloseTo(MIN_PANEL_PX);

    const shrinkRight = resizePair(FRACTIONS, 0, 300, 600, 1000);
    expect(shrinkRight[1]).toBeCloseTo(MIN_PANEL_PX);
  });

  it('returns the fractions unchanged when there is no room to resize', () => {
    expect(resizePair(FRACTIONS, 0, 200, 200, 50)).toEqual(FRACTIONS);
    expect(resizePair(FRACTIONS, 2, 450, 0, 50)).toEqual(FRACTIONS);
  });
});
