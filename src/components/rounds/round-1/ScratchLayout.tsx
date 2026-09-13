'use client';

import type { ReactNode } from 'react';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import { cn } from '@/lib/utils';

export interface ScratchLayoutProps {
  question: ReactNode;
  chain: ReactNode;
  palette: ReactNode;
}

const PANELS = ['question', 'chain', 'blocks'] as const;
type Panel = (typeof PANELS)[number];

const PANEL_LABELS: Record<Panel, string> = {
  question: 'Question',
  chain: 'Chain',
  blocks: 'Blocks',
};

/**
 * ROUND 1 counterpart of `WorkspaceLayout` (round-2-3). At >=1024px the
 * Figma `scratch` grid: columns 314 : 559 : 465 with 28px / 19px gutters,
 * starting 178px from the top (header + tabs) and ending 29px above the
 * bottom. Below that, a `Question | Chain | Blocks` tab strip, since three
 * columns don't fit a phone (AGENTS.md).
 */
export function ScratchLayout({ question, chain, palette }: ScratchLayoutProps) {
  const [panel, setPanel] = useQueryState(
    'panel',
    parseAsStringEnum<Panel>([...PANELS]).withDefault('question')
  );

  return (
    <div className="flex h-[75dvh] min-h-0 flex-col gap-3 px-4 pb-4 lg:grid lg:h-[calc(100dvh-178px)] lg:grid-cols-[314fr_28px_559fr_19px_465fr] lg:gap-0 lg:pr-[24px] lg:pb-[29px] lg:pl-[31px]">
      <div className="flex gap-1 lg:hidden" role="tablist" aria-label="Workspace panel">
        {PANELS.map(name => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={panel === name}
            onClick={() => void setPanel(name)}
            className={cn(
              'flex-1 rounded-full border px-3 py-1.5 font-scratch-sans text-sm font-medium',
              panel === name
                ? 'border-scratch-border bg-scratch-border/15 text-scratch-ink'
                : 'border-scratch-border/40 text-scratch-ink/60'
            )}
          >
            {PANEL_LABELS[name]}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 lg:col-start-1 lg:row-start-1 lg:block',
          panel === 'question' ? 'block' : 'hidden'
        )}
      >
        {question}
      </div>
      <div
        className={cn(
          'min-h-0 flex-1 lg:col-start-3 lg:row-start-1 lg:block',
          panel === 'chain' ? 'block' : 'hidden'
        )}
      >
        {chain}
      </div>
      <div
        className={cn(
          'min-h-0 flex-1 lg:col-start-5 lg:row-start-1 lg:block',
          panel === 'blocks' ? 'block' : 'hidden'
        )}
      >
        {palette}
      </div>
    </div>
  );
}
