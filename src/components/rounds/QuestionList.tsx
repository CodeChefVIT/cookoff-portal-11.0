'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useRoundQuestions } from './hooks';
import { getRoundConfig } from './round-config';
import type { RoundId } from './types';

/**
 * SHARED QUESTION LIST
 *
 * Round menu grid, matching `design/Desktop - 22.svg`: a centred title, a
 * coin-styled buy-in pill, a description snippet, and a `Start` CTA that
 * always navigates into the question — `BuyInGate` on that page (not this
 * list) owns the actual pay-to-unlock flow, matching the product doc
 * ("click a button to place a bet ... the code editor window unlocks").
 * A question only renders the blurred/padlock "locked" treatment once the
 * API actually says so (`bought === false`); `GET /question/round` may not
 * carry per-user solved/bought flags at all (L4) — badges and the lock
 * overlay render only when those flags are present, never guessed.
 */
export interface QuestionListProps {
  roundId: RoundId;
}

export function QuestionList({ roundId }: QuestionListProps) {
  const { data: questions, isLoading, isError, refetch } = useRoundQuestions(roundId);
  const hasBuyIn = getRoundConfig(roundId).hasBuyIn;

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4"
        aria-busy="true"
        aria-label="Loading questions"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-card" />
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
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">
      {questions.map(question => {
        // Only known-false renders the lock treatment — `undefined` means the
        // API omitted per-user flags (L4), and we never guess a state. R1/R3
        // have no buy-in at all (RoundConfig.hasBuyIn), so they never lock.
        const isLocked = hasBuyIn && question.bought === false;

        return (
          <Link
            key={question.id}
            href={`/round/${roundId}/${question.id}`}
            className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 text-center text-card-foreground transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
          >
            {question.solved && (
              <span className="absolute top-3 right-3 z-10 w-fit rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                Solved
              </span>
            )}
            <div className={cn('flex flex-1 flex-col items-center gap-3', isLocked && 'blur-sm')}>
              <h3 className="font-display text-xl text-brand">{question.title}</h3>
              {hasBuyIn && (
                <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-coin">
                  <span aria-hidden="true">🪙</span> {question.buyIn}
                </span>
              )}
              <p className="line-clamp-4 text-sm text-muted-foreground">{question.description}</p>
            </div>
            {isLocked && (
              <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                <Lock className="size-12 text-primary drop-shadow-lg" strokeWidth={1.5} />
              </div>
            )}
            <span className="w-full shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Start
              {isLocked && <span className="sr-only"> (locked — place a bet to unlock)</span>}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
