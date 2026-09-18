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
    onSuccess: verdict => {
      setRunVerdict(verdict);
    },
  });

  const runCustomInput = useMutation({
    mutationFn: (input: CustomRunRequestInput) => runCustom(input),
    onSuccess: result => {
      setCustomResult(result);
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
