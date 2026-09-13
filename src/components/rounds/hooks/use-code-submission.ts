'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getSubmissionResult,
  isApiError,
  isTerminalStatus,
  questionKeys,
  sessionKeys,
  submissionKeys,
  submitCode,
} from '@/api';
import type { SubmissionRequestInput } from '@/api';

const POLL_INTERVAL_MS = 1_200;
const MAX_POLLS = 60;

/**
 * Owns the submit -> poll -> verdict lifecycle. `submissionId` lives in
 * component state only (never persisted) — replaying a stale poll after a
 * refresh could show a verdict for a buffer the user has since edited.
 */
export function useCodeSubmission(roundId: number) {
  const queryClient = useQueryClient();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [notPurchased, setNotPurchased] = useState(false);
  const invalidatedFor = useRef<string | null>(null);

  const submit = useMutation({
    mutationFn: (input: SubmissionRequestInput) => submitCode(input),
    onMutate: () => {
      setNotPurchased(false);
      setPollCount(0);
    },
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
    enabled: submissionId !== null && pollCount < MAX_POLLS,
    staleTime: 0,
    refetchInterval: query =>
      isTerminalStatus(query.state.data?.statusId) ? false : POLL_INTERVAL_MS,
  });

  const terminal = isTerminalStatus(result.data?.statusId);

  useEffect(() => {
    if (!submissionId || terminal) return;
    const timer = setTimeout(() => setPollCount(count => count + 1), POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [submissionId, terminal, result.dataUpdatedAt]);

  useEffect(() => {
    if (!result.data || !terminal || !submissionId) return;
    if (invalidatedFor.current === submissionId) return;
    const allPassed = result.data.testcasesFailed === 0 && result.data.testcasesPassed > 0;
    if (allPassed && !result.data.alreadyAnswered) {
      invalidatedFor.current = submissionId;
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all() });
      void queryClient.invalidateQueries({ queryKey: questionKeys.list({ round: roundId }) });
    }
  }, [result.data, terminal, submissionId, roundId, queryClient]);

  return {
    submit,
    result,
    submissionId,
    notPurchased,
    pollCapExceeded: pollCount >= MAX_POLLS && !terminal,
    retryPolling: () => setPollCount(0),
    reset: () => {
      setSubmissionId(null);
      setPollCount(0);
      setNotPurchased(false);
      invalidatedFor.current = null;
    },
  };
}
