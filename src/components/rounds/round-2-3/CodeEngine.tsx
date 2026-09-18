'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getPublicTestcases,
  isNotPurchasedError,
  isNotQualifiedError,
  isRoundNotRunningError,
  testcaseKeys,
} from '@/api';
import { useRoundStore } from '@/stores';

import { useCodeRun, useCodeSubmission, useRoundExpired } from '../hooks';
import { ProblemPanel } from '../ProblemPanel';
import { getRoundConfig } from '../round-config';
import type { Question } from '../types';
import { VerdictBox } from '../VerdictBox';
import { EditorToolbar, LanguageSelector, MonacoWrapper } from './code-editor';
import { CustomInputPanel } from './CustomInputPanel';
import { DEFAULT_LANGUAGE, getLanguageById } from './languages';
import { ResultsPlaceholder } from './ResultsPlaceholder';
import { RoundStatusPill } from './RoundStatusPill';
import { SubmissionErrorCard } from './SubmissionErrorCard';
import { TestcasePanel } from './TestcasePanel';
import { WorkspaceLayout } from './WorkspaceLayout';

export interface CodeEngineProps {
  question: Question;
  roundId: 2 | 3;
  onNotPurchased?: () => void;
  onPurchased?: () => void;
}

export function CodeEngine({ question, roundId, onNotPurchased, onPurchased }: CodeEngineProps) {
  const testcases = useQuery({
    queryKey: testcaseKeys.detail(question.id),
    queryFn: () => getPublicTestcases(question.id),
    staleTime: Infinity,
  });

  const draft = useRoundStore(state => state.drafts[question.id]);
  const setSourceCode = useRoundStore.use.setSourceCode();
  const setLanguage = useRoundStore.use.setLanguage();
  const setCustomInput = useRoundStore.use.setCustomInput();
  const resetDraft = useRoundStore.use.resetDraft();

  const languageId = draft?.languageId ?? DEFAULT_LANGUAGE.id;
  const language = getLanguageById(languageId);
  const sourceCode = draft?.sourceCode ?? language.boilerplate;

  useEffect(() => {
    if (!draft) resetDraft(question.id, DEFAULT_LANGUAGE.id, DEFAULT_LANGUAGE.boilerplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [dismissedSubmissionId, setDismissedSubmissionId] = useState<string | null>(null);
  const [wasAlreadySolved, setWasAlreadySolved] = useState(question.solved === true);

  const submission = useCodeSubmission(roundId, question.id);
  const codeRun = useCodeRun();
  const isExpired = useRoundExpired();

  useEffect(() => {
    if (submission.notPurchased) onNotPurchased?.();
  }, [submission.notPurchased, onNotPurchased]);

  const verdict = submission.result.data ?? codeRun.runVerdict ?? undefined;
  const isFinalSubmission = submission.result.data !== undefined;
  const allPassed =
    isFinalSubmission &&
    submission.result.data !== undefined &&
    submission.result.data.failed === 0 &&
    submission.result.data.passed > 0;
  const resultOpen = allPassed && submission.result.data?.submissionId !== dismissedSubmissionId;

  function handleRun() {
    if (!sourceCode.trim()) {
      toast.error('Write some code before running.');
      return;
    }
    if (customInputEnabled) {
      codeRun.runCustomInput.mutate(
        {
          languageId,
          sourceCode,
          stdin: draft?.customInput ?? '',
        },
        {
          onError: (error: unknown) => {
            toast.error(
              error instanceof Error ? error.message : 'Failed to run code with custom input'
            );
          },
        }
      );
    } else {
      // The newest action owns the results panel: an earlier submission's
      // verdict would otherwise outrank this run's (see `verdict` above).
      submission.reset();
      codeRun.runPublic.mutate(
        {
          input: { questionId: question.id, languageId, sourceCode },
          publicTestcases: testcases.data ?? [],
        },
        {
          onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : 'Failed to run code');
          },
        }
      );
    }
  }

  const [submitFailed, setSubmitFailed] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [dismissedErrorAt, setDismissedErrorAt] = useState<number | null>(null);
  const resultFailed =
    submission.result.isError &&
    !submission.timedOut &&
    submission.result.errorUpdatedAt !== dismissedErrorAt;

  // Submits straight away — no confirmation step, since participants may
  // resubmit as many times as they like.
  function handleSubmit() {
    if (!sourceCode.trim()) {
      toast.error('Write some code before submitting.');
      return;
    }
    setSubmitFailed(false);
    setSubmitError(undefined);
    if (isExpired) {
      toast.error('The round has ended, so this submission was not sent.');
      return;
    }
    codeRun.clearRun();
    submission.submit.mutate(
      { questionId: question.id, languageId, sourceCode },
      {
        onSuccess: () => onPurchased?.(),
        onError: error => {
          if (isRoundNotRunningError(error)) {
            setSubmitFailed(true);
            setSubmitError(
              'This round is not running right now, so your submission was not judged.'
            );
            return;
          }
          if (isNotPurchasedError(error) && getRoundConfig(roundId).hasBuyIn) return;
          setSubmitFailed(true);
          if (isNotQualifiedError(error)) {
            setSubmitError('This round is no longer open for your account.');
          } else if (isNotPurchasedError(error)) {
            setSubmitError('This question is not unlocked yet. Reopen it and try again.');
          }
        },
      }
    );
  }

  const isSubmitDisabled =
    isExpired ||
    !sourceCode.trim() ||
    submission.submit.isPending ||
    submission.result.isFetching ||
    codeRun.isRunning;

  const placeholder = submission.timedOut
    ? 'Taking longer than expected.'
    : submission.submit.isPending || submission.result.isFetching
      ? 'Judging your submission…'
      : codeRun.runPublic.isPending
        ? 'Running your code against sample testcases…'
        : submission.result.isError
          ? 'Couldn’t fetch your verdict.'
          : 'You must run your code first';

  return (
    <>
      <WorkspaceLayout
        problem={
          <ProblemPanel
            variant="code"
            question={question}
            showReward={getRoundConfig(roundId).hasCurrency}
          />
        }
        editor={
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 lg:relative lg:block lg:h-[29.766px]">
              <RoundStatusPill label={getRoundConfig(roundId).label} />
              <LanguageSelector
                value={languageId}
                onChange={id => setLanguage(question.id, id, getLanguageById(id).boilerplate)}
                className="lg:absolute lg:top-[2.65px] lg:right-[2px]"
              />
            </div>
            <MonacoWrapper
              value={sourceCode}
              onChange={code => setSourceCode(question.id, code)}
              language={language.monacoId}
              readOnly={isExpired}
              className="mt-3 min-h-0 flex-1 lg:mt-[19.2px] lg:ml-[6px]"
            />
            <EditorToolbar
              onRun={handleRun}
              isRunning={codeRun.isRunning}
              onSubmit={handleSubmit}
              isSubmitting={submission.submit.isPending}
              disabled={isSubmitDisabled}
              customInputEnabled={customInputEnabled}
              onToggleCustomInput={() => setCustomInputEnabled(value => !value)}
              className="lg:ml-[6px]"
            />
          </>
        }
        results={
          customInputEnabled ? (
            <CustomInputPanel
              value={draft?.customInput ?? ''}
              onChange={value => setCustomInput(question.id, value)}
              result={codeRun.customResult}
              isRunning={codeRun.runCustomInput.isPending}
            />
          ) : verdict ? (
            <TestcasePanel
              testcases={testcases.data ?? []}
              verdict={verdict}
              testcasesUnavailable={testcases.isError}
              onRetryTestcases={() => void testcases.refetch()}
            />
          ) : (
            <ResultsPlaceholder
              message={placeholder}
              onRetry={submission.result.isError ? submission.retryResult : undefined}
            />
          )
        }
      />
      <SubmissionErrorCard
        message={submitFailed ? submitError : undefined}
        open={submitFailed || resultFailed}
        onClose={() => {
          setSubmitFailed(false);
          setSubmitError(undefined);
          setDismissedErrorAt(submission.result.errorUpdatedAt);
        }}
      />
      {submission.result.data && allPassed && (
        <VerdictBox
          correct
          open={resultOpen}
          onClose={() => {
            if (submission.result.data) {
              setDismissedSubmissionId(submission.result.data.submissionId);
            }
            setWasAlreadySolved(true);
          }}
          question={question}
          pointsAwarded={question.points}
          alreadyAnswered={wasAlreadySolved}
          showReward={getRoundConfig(roundId).hasCurrency}
        />
      )}
    </>
  );
}
