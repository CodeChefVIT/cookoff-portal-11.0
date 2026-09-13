import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ScratchPanelTitleProps {
  children: ReactNode;
  className?: string;
}

/** "Question" / "Scratch Interface" / "Scratch Blocks" — DM Serif Display, flush with the panel top. */
export function ScratchPanelTitle({ children, className }: ScratchPanelTitleProps) {
  return (
    <h2
      className={cn(
        'shrink-0 text-center font-scratch-display text-[32px] leading-normal tracking-[0.9px] text-scratch-ink lg:text-[36px] xl:text-[45px]',
        className
      )}
    >
      {children}
    </h2>
  );
}
