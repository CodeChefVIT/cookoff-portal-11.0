'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getSubmissionResult,
  isApiError,
  isNotPurchasedError,
  questionKeys,
  sessionKeys,
  submissionKeys,
  submitCode,
} from '@/api';
import type { SubmissionRequestInput } from '@/api';

/**
 * Owns the submit -> result lifecycle. `GET /result/:id` long-polls
 * server-side for up to 90 seconds and returns the final, terminal verdict
 * directly (see AGENTS.md) — there is no client-side interval polling loop.
 * A `408` means it genuinely wasn't ready after 90 seconds; the query surfaces
 * a manual "Check again" rather than spending another 90 seconds on an
 * automatic retry.
 * `submissionId` lives in component state only (never persisted) — a page
 * refresh should not replay a verdict for a buffer the user has since
 * edited.
 */
/**
 * In-flight submission per question, held outside React so a question-tab
 * switch (which remounts `CodeEngine`) doesn't orphan a verdict the server is
 * still judging. Deliberately module state and not `persist`ed storage: a page
 * *reload* must still forget it, so a refresh never replays a verdict against
 * a buffer the contestant has since edited.
 */
const activeSubmissions = new Map<string, string>();

/**
 * Verdict popups the contestant already closed. Module state for the same
 * reason as `activeSubmissions`: component state died with the remount on a
 * question-tab switch, so coming back re-opened the popup for a submission
 * the contestant had already acknowledged.
 */
const dismissedVerdicts = new Set<string>();

export function useCodeSubmission(roundId: number, questionId: string) {
  const queryClient = useQueryClient();
  const [submissionId, setSubmissionIdState] = useState<string | null>(
    () => activeSubmissions.get(questionId) ?? null
  );
  const [notPurchased, setNotPurchased] = useState(false);
  const invalidatedFor = useRef<string | null>(null);

  const setSubmissionId = useCallback(
    (id: string | null) => {
      if (id === null) activeSubmissions.delete(questionId);
      else activeSubmissions.set(questionId, id);
      setSubmissionIdState(id);
    },
    [questionId]
  );

  // Covers a question change that does *not* remount this hook. React's
  // "adjusting state when a prop changes" pattern — done during render rather
  // than in an effect so there is no extra pass with the wrong question's id.
  const [trackedQuestionId, setTrackedQuestionId] = useState(questionId);
  if (trackedQuestionId !== questionId) {
    setTrackedQuestionId(questionId);
    setSubmissionIdState(activeSubmissions.get(questionId) ?? null);
  }

  const submit = useMutation({
    mutationFn: (input: SubmissionRequestInput) => submitCode(input),
    onMutate: () => setNotPurchased(false),
    onSuccess: response => setSubmissionId(response.submissionId),
    onError: error => {
      if (isNotPurchasedError(error)) setNotPurchased(true);
    },
  });

  const result = useQuery({
    queryKey: submissionId ? submissionKeys.detail(submissionId) : submissionKeys.detail('none'),
    // React Query's signal aborts the 130s request when the query is no longer
    // observed, so a tab switch can't leave connections pinned open.
    queryFn: ({ signal }) => getSubmissionResult(submissionId ?? '', signal),
    enabled: submissionId !== null,
    staleTime: 0,
    // `/result/:id` already long-polls for 90s server-side, so the global
    // `retry: 1` would silently spend another 90s before the 408 ever reached
    // the UI. Surface "Check again" after the first timeout instead.
    retry: 0,
  });

  const verdictId = result.data?.submissionId;
  const [, rerender] = useState(0);
  const verdictDismissed = verdictId !== undefined && dismissedVerdicts.has(verdictId);
  const dismissVerdict = useCallback(() => {
    if (verdictId === undefined) return;
    dismissedVerdicts.add(verdictId);
    rerender(n => n + 1);
  }, [verdictId]);

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
    verdictDismissed,
    dismissVerdict,
    retryResult: () => void result.refetch(),
    reset: () => {
      setSubmissionId(null);
      setNotPurchased(false);
      invalidatedFor.current = null;
    },
  };
}
