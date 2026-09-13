'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

import { useRoundQuestions } from './hooks';
import { getRoundConfig } from './round-config';
import type { RoundId } from './types';

/**
 * SHARED QUESTION LIST
 *
 * Round menu grid. `GET /question/round` may not carry per-user solved/bought
 * flags (L4) — badges render only when those flags are present, never guessed.
 */
export interface QuestionListProps {
  roundId: RoundId;
}

export function QuestionList({ roundId }: QuestionListProps) {
  const { data: questions, isLoading, isError, refetch } = useRoundQuestions(roundId);
  const hasBuyIn = getRoundConfig(roundId).hasBuyIn;
  const boughtLabel = hasBuyIn ? 'Bet placed' : 'Unlocked';

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading questions"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-sm text-muted-foreground">Couldn&rsquo;t load the problem list.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <p className="p-10 text-center text-sm text-muted-foreground">No problems available yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
      {questions.map((question, index) => (
        <Link
          key={question.id}
          href={`/round/${roundId}/${question.id}`}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-card-foreground transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Problem {index + 1}</span>
            <span className="rounded-full bg-chip px-2 py-0.5 text-xs font-medium">
              {question.points} pts
            </span>
          </div>
          <h3 className="font-display text-lg text-brand">{question.title}</h3>
          {question.bountyActive && (
            <span className="w-fit rounded-full bg-coin/20 px-2 py-0.5 text-xs font-medium text-coin">
              <span aria-hidden="true">🎯</span> Bounty
            </span>
          )}
          {question.solved !== undefined || question.bought !== undefined ? (
            <span
              className={cn(
                'w-fit rounded-full px-2 py-0.5 text-xs font-medium',
                question.solved
                  ? 'bg-primary/20 text-primary'
                  : question.bought
                    ? 'bg-coin/20 text-coin'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {question.solved ? 'Solved' : question.bought ? boughtLabel : 'Locked'}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
