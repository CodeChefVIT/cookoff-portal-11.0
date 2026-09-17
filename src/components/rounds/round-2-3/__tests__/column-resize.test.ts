import { describe, expect, it } from 'vitest';

import {
  dividerPosition,
  MIN_EDITOR_COLUMN_PX,
  MIN_PROBLEM_PX,
  resizeColumns,
  workspaceGridTemplate,
} from '../column-resize';

const COLUMNS = [643, 715];

describe('resizeColumns', () => {
  it('widens the problem column when the divider is dragged right', () => {
    const next = resizeColumns(COLUMNS, 643, 715, 100);
    expect(next[0]).toBeCloseTo(743);
    expect(next[1]).toBeCloseTo(615);
  });

  it('widens the editor column when the divider is dragged left', () => {
    const next = resizeColumns(COLUMNS, 643, 715, -143);
    expect(next[0]).toBeCloseTo(500);
    expect(next[1]).toBeCloseTo(858);
  });

  it('preserves the combined share of the two columns', () => {
    const next = resizeColumns(COLUMNS, 643, 715, -137);
    expect(next[0]! + next[1]!).toBeCloseTo(1358);
  });

  it('never shrinks the problem column below its minimum', () => {
    expect(resizeColumns(COLUMNS, 643, 715, -1000)[0]).toBeCloseTo(MIN_PROBLEM_PX);
  });

  it('never shrinks the editor column below its minimum', () => {
    expect(resizeColumns(COLUMNS, 643, 715, 1000)[1]).toBeCloseTo(MIN_EDITOR_COLUMN_PX);
  });

  it('leaves the columns unchanged when there is no room for both minimums', () => {
    expect(resizeColumns(COLUMNS, 300, 300, 50)).toEqual(COLUMNS);
  });
});

describe('workspaceGridTemplate', () => {
  it('puts the fixed gutter between the two panel tracks', () => {
    expect(workspaceGridTemplate(COLUMNS)).toBe('minmax(0, 643fr) 23px minmax(0, 715fr)');
  });
});

describe('dividerPosition', () => {
  it('reports the divider as a percentage across the workspace', () => {
    expect(dividerPosition([500, 500])).toBe(50);
    expect(dividerPosition(COLUMNS)).toBe(47);
  });

  it('is 0 when the columns have no width to share', () => {
    expect(dividerPosition([0, 0])).toBe(0);
  });
});
