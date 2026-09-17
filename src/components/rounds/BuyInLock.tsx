'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import { cn } from '@/lib/utils';

/**
 * What `BuyInGate` hands down while an R2 question may be locked. `prompt` is
 * the `BuyInConfirm` box.
 */
export interface BuyInLock {
  locked: boolean;
  prompt: ReactNode;
}

export const BuyInLockContext = createContext<BuyInLock | null>(null);

export interface BuyInLockSurfaceProps {
  children: ReactNode;
  className?: string;
}

/**
 * The part of the workspace a buy-in actually locks — the editor column and
 * results in R2 — so the problem statement stays readable before paying.
 * While locked its children stay mounted but inert under a 5px blur, with the
 * prompt centred on top. The wrapper is identical locked or unlocked so the
 * editor never remounts on unlock. Outside a `BuyInGate` it is a plain div.
 */
export function BuyInLockSurface({ children, className }: BuyInLockSurfaceProps) {
  const lock = useContext(BuyInLockContext);
  const locked = lock?.locked === true;

  return (
    <div className={cn('@container relative', className)}>
      <div className="contents" inert={locked} aria-hidden={locked ? true : undefined}>
        {children}
      </div>
      {locked && (
        <>
          <div aria-hidden="true" className="absolute inset-0 z-20 backdrop-blur-[5px]" />
          {lock.prompt}
        </>
      )}
    </div>
  );
}
