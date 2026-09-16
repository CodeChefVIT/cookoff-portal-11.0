'use client';

import type { ReactNode } from 'react';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import { cn } from '@/lib/utils';

export interface WorkspaceLayoutProps {
  problem: ReactNode;
  editor: ReactNode;
  results: ReactNode;
}

const PANELS = ['problem', 'code', 'tests'] as const;
type Panel = (typeof PANELS)[number];

/** Figma `Desktop - 15/14` columns at 1440px: 27px | 643 | 23 | 715 | 32px. */
export const WORKSPACE_GRID =
  'lg:grid lg:grid-cols-[minmax(0,643fr)_minmax(0,715fr)] lg:gap-x-[23px] lg:pr-[32px] lg:pl-[27px]';

/** The band above the problem panel that `QuestionWorkspace` overlays the question tabs into (16 + 44 + 8). */
export const TABS_BAND = 'lg:pt-[68px]';

/**
 * Sole owner of the split-vs-tabbed responsive layout (AGENTS.md §15). From
 * `lg`, Figma `Desktop - 15/14` to the pixel: the problem panel under the
 * question-tab band on the left; on the right the editor column above a
 * 355px results panel, both 34px off the bottom. Below `lg`, a
 * `Problem | Code | Tests` tab strip, since a split editor is unusable on a
 * phone.
 */
export function WorkspaceLayout({ problem, editor, results }: WorkspaceLayoutProps) {
  const [panel, setPanel] = useQueryState(
    'panel',
    parseAsStringEnum<Panel>([...PANELS]).withDefault('problem')
  );

  return (
    <div
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
          'min-h-0 flex-1 lg:block lg:pb-[34px]',
          TABS_BAND,
          panel === 'problem' ? 'block' : 'hidden'
        )}
      >
        {problem}
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 flex-col lg:flex lg:pt-[19px] lg:pb-[34px]',
          panel === 'problem' ? 'hidden' : 'flex'
        )}
      >
        <div
          className={cn('min-h-0 flex-1 flex-col lg:flex', panel === 'code' ? 'flex' : 'hidden')}
        >
          {editor}
        </div>
        <div
          className={cn(
            'h-[355px] shrink-0 lg:mt-[15.2px] lg:ml-[6px] lg:block',
            panel === 'tests' ? 'block' : 'hidden'
          )}
        >
          {results}
        </div>
      </div>
    </div>
  );
}
