'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import type {
  CustomRunRequestInput,
  CustomRunResult,
  SubmissionRequestInput,
  SubmissionVerdict,
} from '@/api';
import { runCode, runCustom } from '@/api';

export function useCodeRun() {
  const [runVerdict, setRunVerdict] = useState<SubmissionVerdict | null>(null);
  const [customResult, setCustomResult] = useState<CustomRunResult | null>(null);

  const runPublic = useMutation({
    mutationFn: ({
      input,
      publicTestcases,
    }: {
      input: SubmissionRequestInput;
      publicTestcases: { id: string }[];
    }) => runCode(input, publicTestcases),
    // Drop the previous verdict so a re-run never shows the last result as its
    // own — but put it back if the run never happened (rate limited, judge
    // busy, network), so a refused click doesn't wipe the panel.
    onMutate: () => {
      const previous = runVerdict;
      setRunVerdict(null);
      return { previous };
    },
    onSuccess: verdict => {
      setRunVerdict(verdict);
    },
    onError: (_error, _input, context) => {
      if (context?.previous) setRunVerdict(context.previous);
    },
  });

  const runCustomInput = useMutation({
    mutationFn: (input: CustomRunRequestInput) => runCustom(input),
    onMutate: () => {
      const previous = customResult;
      setCustomResult(null);
      return { previous };
    },
    onSuccess: result => {
      setCustomResult(result);
    },
    onError: (_error, _input, context) => {
      if (context?.previous) setCustomResult(context.previous);
    },
  });

  const isRunning = runPublic.isPending || runCustomInput.isPending;

  return {
    runPublic,
    runCustomInput,
    runVerdict,
    customResult,
    isRunning,
    clearRun: () => {
      setRunVerdict(null);
      setCustomResult(null);
    },
  };
}
