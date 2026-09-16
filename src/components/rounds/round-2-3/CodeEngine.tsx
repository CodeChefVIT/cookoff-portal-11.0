'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getPublicTestcases, testcaseKeys } from '@/api';
import { useCodeSubmission, useRoundTimer } from '@/components/rounds/hooks';
import { useRoundStore } from '@/stores';

import { ProblemPanel } from '../ProblemPanel';
import { getRoundConfig } from '../round-config';
import { SolvedBox } from '../SolvedBox';
import type { Question } from '../types';
import { EditorToolbar } from './code-editor/EditorToolbar';
import { LanguageSelector } from './code-editor/LanguageSelector';
import { MonacoWrapper } from './code-editor/MonacoWrapper';
import { ConfirmSubmitDialog } from './ConfirmSubmitDialog';
import { CustomInputPanel } from './CustomInputPanel';
import { DEFAULT_LANGUAGE, getLanguageById } from './languages';
import { ResultsPlaceholder } from './ResultsPlaceholder';
import { RoundStatusPill } from './RoundStatusPill';
import { TestcasePanel } from './TestcasePanel';
import { WorkspaceLayout } from './WorkspaceLayout';

/**
 * ROUND 2/3 ENGINE - Entry point for the "Code" rounds.
 *
 * Orchestrates ProblemPanel + the editor column (round pill, language,
 * Monaco, action row) + the results slot, and owns the `POST /submit` ->
 * `GET /result/:id` lifecycle via `useCodeSubmission`. The parent
 * `RoundShell`/`BuyInGate` handle chrome and the buy-in gate respectively —
 * this component assumes the editor is already unlocked.
 */
export interface CodeEngineProps {
  question: Question;
  roundId: 2 | 3;
  index?: number;
  onNotPurchased?: () => void;
}

export function CodeEngine({ question, roundId, index, onNotPurchased }: CodeEngineProps) {
  const testcases = useQuery({
    queryKey: testcaseKeys.detail(question.id),
    queryFn: () => getPublicTestcases(question.id),
    staleTime: Infinity,
  });

  const draft = useRoundStore.use.getDraft()(question.id);
  const setSourceCode = useRoundStore.use.setSourceCode();
  const setLanguage = useRoundStore.use.setLanguage();
  const setCustomInput = useRoundStore.use.setCustomInput();
  const resetDraft = useRoundStore.use.resetDraft();

  const languageId = draft?.languageId ?? DEFAULT_LANGUAGE.id;
  const language = getLanguageById(languageId);
  const sourceCode = draft?.sourceCode ?? language.boilerplate;

  useEffect(() => {
    if (!draft) resetDraft(question.id, DEFAULT_LANGUAGE.id, DEFAULT_LANGUAGE.boilerplate);
    // Seed the draft once per question; further edits go through the store setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [dismissedSubmissionId, setDismissedSubmissionId] = useState<string | null>(null);
  // Captures whether the question was already solved *before* this mount's
  // submissions — dto.ResultResponse has no "already answered" flag, and
  // `question.solved` itself flips to true right after a passing verdict
  // invalidates the round question list.
  const [wasAlreadySolved, setWasAlreadySolved] = useState(question.solved === true);

  const submission = useCodeSubmission(roundId);
  const { isExpired } = useRoundTimer();

  useEffect(() => {
    if (submission.notPurchased) onNotPurchased?.();
  }, [submission.notPurchased, onNotPurchased]);

  const verdict = submission.result.data;
  const allPassed = verdict !== undefined && verdict.failed === 0 && verdict.passed > 0;
  const resultOpen = allPassed && verdict.submissionId !== dismissedSubmissionId;

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  function requestSubmit() {
    if (!sourceCode.trim()) {
      toast.error('Write some code before submitting.');
      return;
    }
    setConfirmSubmitOpen(true);
  }

  function confirmSubmit() {
    setConfirmSubmitOpen(false);
    submission.submit.mutate({ questionId: question.id, languageId, sourceCode });
  }

  const isSubmitDisabled = isExpired || !sourceCode.trim() || submission.submit.isPending;

  const placeholder = submission.timedOut
    ? 'Taking longer than expected.'
    : submission.submit.isPending || submission.result.isFetching
      ? 'Judging your submission…'
      : submission.result.isError
        ? "Couldn't fetch your submission result."
        : submission.submit.isError && !submission.notPurchased
          ? "Couldn't submit — your code is still here. Try again."
          : 'You must run your code first';

  return (
    <>
      <WorkspaceLayout
        problem={<ProblemPanel variant="code" question={question} index={index} />}
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
              onSubmit={requestSubmit}
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
            />
          ) : verdict ? (
            <TestcasePanel testcases={testcases.data ?? []} verdict={verdict} />
          ) : (
            <ResultsPlaceholder
              message={placeholder}
              onRetry={submission.timedOut ? submission.retryResult : undefined}
            />
          )
        }
      />
      <ConfirmSubmitDialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        onConfirm={confirmSubmit}
        isSubmitting={submission.submit.isPending}
      />
      {verdict && allPassed && (
        <SolvedBox
          open={resultOpen}
          onClose={() => {
            setDismissedSubmissionId(verdict.submissionId);
            setWasAlreadySolved(true);
          }}
          question={question}
          // dto.ResultResponse carries no payout or "already answered" flag.
          pointsAwarded={question.points}
          alreadyAnswered={wasAlreadySolved}
          showReward={getRoundConfig(roundId).hasCurrency}
        />
      )}
    </>
  );
}
