'use client';

import type { ReactNode } from 'react';

import { useRoundQuestions, useSession } from './hooks';
import { QuestionTabs } from './QuestionTabs';
import { getRoundConfig } from './round-config';
import { RoundHeader } from './RoundHeader';
import type { RoundId } from './types';

/**
 * SHARED SHELL COMPONENT
 *
 * The "Master Layout" for all three rounds. Renders `RoundHeader` (with
 * `CurrencyBox`/`headerAction` config-gated) and the question tab strip,
 * then the round Engine as `children`.
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

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <RoundHeader
        roundId={roundId}
        balance={config.hasCurrency ? session.data?.balance : undefined}
        headerAction={headerAction}
      />
      {!config.minimalHud && questions && questions.length > 0 && (
        <QuestionTabs roundId={roundId} questions={questions} activeId={activeQuestionId} />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
