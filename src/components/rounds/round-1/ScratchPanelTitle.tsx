import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ScratchPanelTitleProps {
  children: ReactNode;
  className?: string;
}

/** "question" / "scratch interface" / "scratch blocks" — DM Serif Display 45px, flush with the panel top. */
export function ScratchPanelTitle({ children, className }: ScratchPanelTitleProps) {
  return (
    <h2
      className={cn(
        'shrink-0 text-center font-scratch-display text-[32px] leading-normal tracking-[0.9px] text-scratch-ink lowercase lg:text-[45px]',
        className
      )}
    >
      {children}
    </h2>
  );
}
