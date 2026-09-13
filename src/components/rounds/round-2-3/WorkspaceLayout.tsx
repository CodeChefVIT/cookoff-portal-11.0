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

/**
 * Sole owner of the split-vs-tabbed responsive layout (AGENTS.md §15): a
 * `problem | editor+results` split at >=1024px matching Desktop - 15.png;
 * below that, a `Problem | Code | Tests` tab strip, since a split editor is
 * unusable on a phone.
 */
export function WorkspaceLayout({ problem, editor, results }: WorkspaceLayoutProps) {
  const [panel, setPanel] = useQueryState(
    'panel',
    parseAsStringEnum<Panel>([...PANELS]).withDefault('problem')
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
              'flex-1 rounded-full border px-3 py-1.5 text-sm font-medium capitalize',
              panel === name
                ? 'border-primary bg-primary/10'
                : 'border-border text-muted-foreground'
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div
        className={cn('min-h-0 flex-1 lg:block lg:w-2/5', panel === 'problem' ? 'block' : 'hidden')}
      >
        {problem}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex lg:w-3/5">
        <div
          className={cn(
            'min-h-[45dvh] flex-1 lg:min-h-0 lg:flex-[2]',
            panel === 'code' ? 'block' : 'hidden lg:block'
          )}
        >
          {editor}
        </div>
        <div
          className={cn('min-h-0 flex-1 lg:block', panel === 'tests' ? 'block' : 'hidden lg:block')}
        >
          {results}
        </div>
      </div>
    </div>
  );
}
