'use client';

import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { Question } from '@/types';

/** Routing + arrow/Home/End handling shared by every question tab strip. */
export function useQuestionTabNav(roundId: number, questions: Question[]) {
  const router = useRouter();

  function go(index: number) {
    const question = questions[index];
    if (question) router.push(`/round/${roundId}/${question.id}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    if (event.key === 'ArrowRight') go((index + 1) % questions.length);
    else if (event.key === 'ArrowLeft') go((index - 1 + questions.length) % questions.length);
    else if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(questions.length - 1);
  }

  return { go, onKeyDown };
}
