'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingScreen } from '@/components/ui';
import type { RoundId } from '@/types';

import { useRoundQuestions } from './hooks';

export interface RoundEntryProps {
  roundId: RoundId;
}

/**
 * `/round/:id` has no question list: it loads the round's questions and
 * `replace`s straight into the first one (same order as the question tabs),
 * so Back never lands on this hop.
 */
export function RoundEntry({ roundId }: RoundEntryProps) {
  const router = useRouter();
  const { data: questions, isError, refetch } = useRoundQuestions(roundId);
  const firstId = questions?.[0]?.id;

  useEffect(() => {
    if (firstId) router.replace(`/round/${roundId}/${firstId}`);
  }, [firstId, roundId, router]);

  if (isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">Couldn&rsquo;t load this round.</p>
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

  if (questions && questions.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">No problems in this round yet.</p>
      </div>
    );
  }

  return <LoadingScreen message="Loading the first problem…" />;
}
