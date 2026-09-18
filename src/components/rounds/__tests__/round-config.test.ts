import { describe, expect, it } from 'vitest';

import { getRoundConfig } from '../round-config';

describe('getRoundConfig', () => {
  it('R1 has no buy-in, no currency, and puts Submit in the header', () => {
    const config = getRoundConfig(1);
    expect(config.engine).toBe('visual');
    expect(config.hasBuyIn).toBe(false);
    expect(config.hasCurrency).toBe(false);
    expect(config.headerSubmit).toBe(true);
    expect(config.chrome).toBe('scratch');
    expect(config.isFinalRound).toBe(false);
  });

  it('R2 requires a buy-in and shows currency', () => {
    const config = getRoundConfig(2);
    expect(config.hasBuyIn).toBe(true);
    expect(config.hasCurrency).toBe(true);
    expect(config.chrome).toBe('code');
    expect(config.isFinalRound).toBe(false);
  });

  it('R3 has no buy-in, no currency, and is the final round', () => {
    const config = getRoundConfig(3);
    expect(config.engine).toBe('code');
    expect(config.hasBuyIn).toBe(false);
    expect(config.hasCurrency).toBe(false);
    expect(config.headerSubmit).toBe(false);
    expect(config.chrome).toBe('code');
    expect(config.isFinalRound).toBe(true);
  });
});
