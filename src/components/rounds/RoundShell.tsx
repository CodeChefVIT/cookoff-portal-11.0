'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { useRoundQuestions, useSession } from './hooks';
import { QuestionTabs } from './QuestionTabs';
import { ScratchHeader, ScratchQuestionTabs } from './round-1';
import { getRoundConfig } from './round-config';
import { RoundHeader } from './RoundHeader';
import type { RoundId } from './types';

/**
 * SHARED SHELL COMPONENT
 *
 * The "Master Layout" for all three rounds. Renders the header and question
 * tab strip for the round's `chrome` (R1's Figma `scratch` look, or the
 * R2/R3 IDE look), then the round Engine as `children`.
 */
export interface RoundShellProps {
  children: ReactNode;
  roundId: RoundId;
  /** Highlights the active tab when viewing a single question. */
  activeQuestionId?: string;
  /** Rendered in the header next to the timer when `config.headerSubmit` is true (R1's Submit button). */
  headerAction?: ReactNode;
}

export function RoundShell({ children, roundId, activeQuestionId, headerAction }: RoundShellProps) {
  const config = getRoundConfig(roundId);
  const session = useSession();
  const { data: questions } = useRoundQuestions(roundId);
  const isScratch = config.chrome === 'scratch';
  const showTabs = !config.minimalHud && questions && questions.length > 0;

  return (
    <div className={cn('flex min-h-dvh flex-col', isScratch ? 'bg-scratch-bg' : 'bg-background')}>
      {isScratch ? (
        <ScratchHeader headerAction={config.headerSubmit ? headerAction : undefined} />
      ) : (
        <RoundHeader
          roundId={roundId}
          balance={config.hasCurrency ? session.data?.balance : undefined}
          headerAction={headerAction}
        />
      )}
      {showTabs &&
        (isScratch ? (
          <ScratchQuestionTabs
            roundId={roundId}
            questions={questions}
            activeId={activeQuestionId}
          />
        ) : (
          <QuestionTabs roundId={roundId} questions={questions} activeId={activeQuestionId} />
        ))}
      <main className="flex-1">{children}</main>
    </div>
  );
}
