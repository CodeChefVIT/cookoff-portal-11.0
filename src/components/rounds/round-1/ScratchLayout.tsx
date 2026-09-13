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
 * ROUND 1 counterpart of `WorkspaceLayout` (round-2-3): a `question |
 * scratch interface | scratch blocks` split at >=1024px matching
 * `scratch.png`; below that, a `Question | Chain | Blocks` tab strip, since
 * three columns don't fit a phone (AGENTS.md).
 */
export function ScratchLayout({ question, chain, palette }: ScratchLayoutProps) {
  const [panel, setPanel] = useQueryState(
    'panel',
    parseAsStringEnum<Panel>([...PANELS]).withDefault('question')
  );

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-0 flex-col gap-3 p-3 lg:h-[calc(100dvh-10rem)] lg:flex-row">
      <div className="flex gap-1 lg:hidden" role="tablist" aria-label="Workspace panel">
        {PANELS.map(name => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={panel === name}
            onClick={() => void setPanel(name)}
            className={cn(
              'flex-1 rounded-full border px-3 py-1.5 text-sm font-medium',
              panel === name
                ? 'border-primary bg-primary/10'
                : 'border-border text-muted-foreground'
            )}
          >
            {PANEL_LABELS[name]}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 lg:block lg:w-1/4',
          panel === 'question' ? 'block' : 'hidden lg:block'
        )}
      >
        {question}
      </div>
      <div
        className={cn(
          'min-h-0 flex-[2] lg:block lg:w-1/2',
          panel === 'chain' ? 'block' : 'hidden lg:block'
        )}
      >
        {chain}
      </div>
      <div
        className={cn(
          'min-h-0 flex-1 lg:block lg:w-1/4',
          panel === 'blocks' ? 'block' : 'hidden lg:block'
        )}
      >
        {palette}
      </div>
    </div>
  );
}
