'use client';

import type { ReactNode } from 'react';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import { cn } from '@/lib/utils';

import { ColumnResizer } from './ColumnResizer';
import { useColumnResize } from './use-column-resize';

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

const GUTTER_PX = 12;

/**
 * ROUND 1 counterpart of `WorkspaceLayout` (round-2-3). At >=1024px a
 * `question | chain | blocks` grid starting 148px from the top (header +
 * tabs), whose 12px gutters are drag handles for resizing the columns
 * (`useColumnResize`). Below that, a `Question | Chain | Blocks` tab strip,
 * since three columns don't fit a phone (AGENTS.md).
 */
export function ScratchLayout({ question, chain, palette }: ScratchLayoutProps) {
  const [panel, setPanel] = useQueryState(
    'panel',
    parseAsStringEnum<Panel>([...PANELS]).withDefault('question')
  );
  const { columns, onPointerDown, onKeyDown } = useColumnResize();

  const total = columns.reduce((sum, value) => sum + value, 0);
  const edge = (index: number) =>
    Math.round((columns.slice(0, index + 1).reduce((sum, value) => sum + value, 0) / total) * 100);
  const gridTemplateColumns = columns
    .map(fraction => `minmax(0, ${fraction}fr)`)
    .join(` ${GUTTER_PX}px `);

  return (
    <div
      style={{ gridTemplateColumns }}
      className="flex h-[75dvh] min-h-0 flex-col gap-3 px-4 pb-4 lg:grid lg:h-[calc(100dvh-148px)] lg:gap-0 lg:pr-[24px] lg:pb-[29px] lg:pl-[31px]"
    >
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
      <ColumnResizer
        label="Resize question and chain panels"
        position={edge(0)}
        onPointerDown={event => onPointerDown(0, event)}
        onKeyDown={event => onKeyDown(0, event)}
        className="lg:col-start-2"
      />
      <div
        className={cn(
          'min-h-0 flex-1 lg:col-start-3 lg:row-start-1 lg:block',
          panel === 'chain' ? 'block' : 'hidden'
        )}
      >
        {chain}
      </div>
      <ColumnResizer
        label="Resize chain and blocks panels"
        position={edge(1)}
        onPointerDown={event => onPointerDown(1, event)}
        onKeyDown={event => onKeyDown(1, event)}
        className="lg:col-start-4"
      />
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
