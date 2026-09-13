'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getSubmissionResult,
  isApiError,
  questionKeys,
  sessionKeys,
  submissionKeys,
  submitCode,
} from '@/api';
import type { SubmissionRequestInput } from '@/api';

/**
 * Owns the submit -> result lifecycle. `GET /result/:id` long-polls
 * server-side for up to 2 minutes and returns the final, terminal verdict
 * directly (see AGENTS.md) — there is no client-side interval polling loop.
 * A `408` means it genuinely wasn't ready after 2 minutes; the query
 * retries once automatically, then surfaces a manual "Check again".
 * `submissionId` lives in component state only (never persisted) — a page
 * refresh should not replay a verdict for a buffer the user has since
 * edited.
 */
export function useCodeSubmission(roundId: number) {
  const queryClient = useQueryClient();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [notPurchased, setNotPurchased] = useState(false);
  const invalidatedFor = useRef<string | null>(null);

  const submit = useMutation({
    mutationFn: (input: SubmissionRequestInput) => submitCode(input),
    onMutate: () => setNotPurchased(false),
    onSuccess: response => setSubmissionId(response.submissionId),
    onError: error => {
      if (isApiError(error) && (error.status === 402 || error.status === 403)) {
        setNotPurchased(true);
      }
    },
  });

  const result = useQuery({
    queryKey: submissionId ? submissionKeys.detail(submissionId) : submissionKeys.detail('none'),
    queryFn: () => getSubmissionResult(submissionId ?? ''),
    enabled: submissionId !== null,
    staleTime: 0,
    retry: 1,
  });

  const timedOut = result.isError && isApiError(result.error) && result.error.status === 408;

  useEffect(() => {
    if (!result.data || !submissionId) return;
    if (invalidatedFor.current === submissionId) return;
    if (result.data.failed === 0 && result.data.passed > 0) {
      invalidatedFor.current = submissionId;
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all() });
      void queryClient.invalidateQueries({ queryKey: questionKeys.list({ round: roundId }) });
    }
  }, [result.data, submissionId, roundId, queryClient]);

  return {
    submit,
    result,
    submissionId,
    notPurchased,
    timedOut,
    retryResult: () => void result.refetch(),
    reset: () => {
      setSubmissionId(null);
      setNotPurchased(false);
      invalidatedFor.current = null;
    },
  };
}
