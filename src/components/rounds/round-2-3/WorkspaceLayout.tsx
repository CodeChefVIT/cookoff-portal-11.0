'use client';

import type { CSSProperties, ReactNode } from 'react';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import { cn } from '@/lib/utils';

import { BuyInLockSurface } from '../BuyInLock';
import { dividerPosition, workspaceGridTemplate } from './column-resize';
import { ColumnResizer } from './ColumnResizer';
import { RowResizer } from './RowResizer';
import { useColumnResize } from './use-column-resize';
import { useResultsResize } from './use-results-resize';

export interface WorkspaceLayoutProps {
  problem: ReactNode;
  editor: ReactNode;
  results: ReactNode;
}

const PANELS = ['problem', 'code', 'tests'] as const;
type Panel = (typeof PANELS)[number];

/**
 * Figma `Desktop - 15/14` columns at 1440px: 27px | 643 | 23 | 715 | 32px.
 * The three tracks themselves come from `workspaceGridTemplate` inline, since
 * the divider moves them; anything using this class must supply that style.
 */
export const WORKSPACE_GRID = 'lg:grid lg:pr-[32px] lg:pl-[27px]';

/** The band above the problem panel that `QuestionWorkspace` overlays the question tabs into (16 + 44 + 8). */
export const TABS_BAND = 'lg:pt-[68px]';

/**
 * Sole owner of the split-vs-tabbed responsive layout (AGENTS.md §15). From
 * `lg`, Figma `Desktop - 15/14` to the pixel: the problem panel under the
 * question-tab band on the left; on the right the editor column above the
 * results panel, both 34px off the bottom. The results panel starts at
 * Figma's 355px and is resizable against the editor via `RowResizer` in the
 * frame's 15.2px gap (the editor slot always keeps its minimum). That right
 * column is the `BuyInLockSurface` an unpaid R2 question blurs. The two
 * columns are resizable against each other the same way, via `ColumnResizer`
 * in the frame's 23px gutter. Below `lg`, a `Problem | Code | Tests` tab
 * strip, since a split editor is unusable on a phone.
 */
export function WorkspaceLayout({ problem, editor, results }: WorkspaceLayoutProps) {
  const [panel, setPanel] = useQueryState(
    'panel',
    parseAsStringEnum<Panel>([...PANELS]).withDefault('problem')
  );
  const { resultsHeight, onPointerDown, onKeyDown } = useResultsResize();
  const {
    columns,
    onPointerDown: onColumnPointerDown,
    onKeyDown: onColumnKeyDown,
  } = useColumnResize();

  return (
    <div
      style={{ gridTemplateColumns: workspaceGridTemplate(columns) }}
      className={cn(
        'flex h-[calc(100dvh-146px)] min-h-0 flex-col gap-3 p-3 lg:h-[calc(100dvh-95px)] lg:min-h-[720px] lg:gap-0 lg:p-0',
        WORKSPACE_GRID
      )}
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
              'flex-1 cursor-pointer rounded-[10px] px-3 py-1.5 font-sans text-sm font-bold capitalize',
              panel === name ? 'bg-brand-accent text-white' : 'bg-code-inset text-code-case-ink'
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 lg:col-start-1 lg:row-start-1 lg:block lg:pb-[34px]',
          TABS_BAND,
          panel === 'problem' ? 'block' : 'hidden'
        )}
      >
        {problem}
      </div>

      <ColumnResizer
        label="Resize problem and editor panels"
        position={dividerPosition(columns)}
        onPointerDown={onColumnPointerDown}
        onKeyDown={onColumnKeyDown}
        className="lg:col-start-2 lg:row-start-1"
      />

      <BuyInLockSurface
        className={cn(
          'min-h-0 flex-1 flex-col lg:col-start-3 lg:row-start-1 lg:flex lg:pt-[19px] lg:pb-[34px]',
          panel === 'problem' ? 'hidden' : 'flex'
        )}
      >
        <div
          className={cn('min-h-0 flex-1 flex-col lg:flex', panel === 'code' ? 'flex' : 'hidden')}
        >
          {editor}
        </div>
        <RowResizer
          label="Resize editor and results panels"
          value={resultsHeight}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
        />
        <div
          style={{ '--results-h': `${resultsHeight}px` } as CSSProperties}
          className={cn(
            // 275.2px = the editor slot's 260px minimum + the resizer's 15.2px gap.
            'h-[355px] shrink-0 lg:ml-[6px] lg:block lg:h-(--results-h) lg:max-h-[calc(100%-275.2px)]',
            panel === 'tests' ? 'block' : 'hidden'
          )}
        >
          {results}
        </div>
      </BuyInLockSurface>
    </div>
  );
}
