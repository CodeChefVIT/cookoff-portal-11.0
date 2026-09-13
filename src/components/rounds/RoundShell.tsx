'use client';

import type { ReactNode } from 'react';

import { useRoundQuestions, useSession } from './hooks';
import { QuestionTabs } from './QuestionTabs';
import { getRoundConfig } from './round-config';
import { RoundHeader } from './RoundHeader';

/**
 * SHARED SHELL COMPONENT
 *
 * The "Master Layout" for Round 2 and Round 3 (Round 1 owns its own shell —
 * see AGENTS.md). Renders `RoundHeader` (with `CurrencyBox` config-gated)
 * and the question tab strip, then the round Engine as `children`.
 */
export interface RoundShellProps {
  children: ReactNode;
  roundId: 2 | 3;
  /** Highlights the active tab when viewing a single question. */
  activeQuestionId?: string;
}

export function RoundShell({ children, roundId, activeQuestionId }: RoundShellProps) {
  const config = getRoundConfig(roundId);
  const session = useSession();
  const { data: questions } = useRoundQuestions(roundId);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <RoundHeader
        roundId={roundId}
        balance={config.hasCurrency ? session.data?.balance : undefined}
      />
      {!config.minimalHud && questions && questions.length > 0 && (
        <QuestionTabs roundId={roundId} questions={questions} activeId={activeQuestionId} />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
