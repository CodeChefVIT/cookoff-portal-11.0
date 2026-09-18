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
import { useCodeSubmission, useRoundExpired } from '@/components/rounds/hooks';
import { useRoundStore } from '@/stores';

import { ProblemPanel } from '../ProblemPanel';
import { getRoundConfig } from '../round-config';
import type { Question } from '../types';
import { VerdictBox } from '../VerdictBox';
import { EditorToolbar } from './code-editor/EditorToolbar';
import { LanguageSelector } from './code-editor/LanguageSelector';
import { MonacoWrapper } from './code-editor/MonacoWrapper';
import { ConfirmSubmitDialog } from './ConfirmSubmitDialog';
import { CustomInputPanel } from './CustomInputPanel';
import { DEFAULT_LANGUAGE, getLanguageById } from './languages';
import { ResultsPlaceholder } from './ResultsPlaceholder';
import { RoundStatusPill } from './RoundStatusPill';
import { SubmissionErrorCard } from './SubmissionErrorCard';
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
  onNotPurchased?: () => void;
  /** A submission the server accepted — any forced re-lock can be cleared. */
  onPurchased?: () => void;
}

export function CodeEngine({ question, roundId, onNotPurchased, onPurchased }: CodeEngineProps) {
  const testcases = useQuery({
    queryKey: testcaseKeys.detail(question.id),
    queryFn: () => getPublicTestcases(question.id),
    staleTime: Infinity,
    // Without a retry, one failed fetch stuck for the whole session: an empty
    // public set makes `TestcasePanel` classify every result as hidden, so the
    // contestant loses the input/expected/output columns with nothing to click.
    retry: 3,
  });

  // Subscribe to this question's draft: `use.getDraft` only subscribes to the
  // (stable) accessor, so language swaps and seeding never re-rendered.
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

  const submission = useCodeSubmission(roundId, question.id);
  const isExpired = useRoundExpired();

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

  // A failed submit or result fetch shows Figma `Desktop - 18`'s card over whatever verdict is on screen.
  const [submitFailed, setSubmitFailed] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  // Keyed on *when* the error happened, not on the submission: dismissing once
  // must not silence a later failure of the same submission's "Check again".
  const [dismissedErrorAt, setDismissedErrorAt] = useState<number | null>(null);
  const resultFailed =
    submission.result.isError &&
    !submission.timedOut &&
    submission.result.errorUpdatedAt !== dismissedErrorAt;

  function confirmSubmit() {
    setConfirmSubmitOpen(false);
    setSubmitFailed(false);
    setSubmitError(undefined);
    // The round can close while this dialog sits open, so re-check here rather
    // than trusting the button's disabled state from when it was pressed.
    if (isExpired) {
      toast.error('The round has ended — this submission wasn’t sent.');
      return;
    }
    submission.submit.mutate(
      { questionId: question.id, languageId, sourceCode },
      {
        onSuccess: () => onPurchased?.(),
        onError: error => {
          // In R2 a "not purchased" 402/403 re-locks the question instead
          // (BuyInGate). Every other round has no gate to fall back on, so the
          // card is the only thing that tells the player anything.
          // A 423 must not re-lock the question — the buy-in is still valid,
          // the round just isn't open.
          if (isRoundNotRunningError(error)) {
            setSubmitFailed(true);
            setSubmitError('This round isn’t running right now — your submission wasn’t judged.');
            return;
          }
          if (isNotPurchasedError(error) && getRoundConfig(roundId).hasBuyIn) return;
          setSubmitFailed(true);
          if (isNotQualifiedError(error)) {
            setSubmitError('This round is no longer open for your account.');
          } else if (isNotPurchasedError(error)) {
            setSubmitError('This question isn’t unlocked yet — reopen it and try again.');
          }
        },
      }
    );
  }

  // Also blocked while the verdict is still being fetched: each result request
  // holds a 120s server-side long poll, so re-submitting would stack them and
  // exhaust the browser's per-host connection budget.
  const isSubmitDisabled =
    isExpired || !sourceCode.trim() || submission.submit.isPending || submission.result.isFetching;

  const placeholder = submission.timedOut
    ? 'Taking longer than expected.'
    : submission.submit.isPending || submission.result.isFetching
      ? 'Judging your submission…'
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
            <TestcasePanel
              testcases={testcases.data ?? []}
              verdict={verdict}
              // Distinguishes "this question has no public cases" from "we
              // couldn't load them", which otherwise both render as a panel
              // claiming every result is hidden.
              testcasesUnavailable={testcases.isError}
              onRetryTestcases={() => void testcases.refetch()}
            />
          ) : (
            <ResultsPlaceholder
              message={placeholder}
              // Any result failure is recoverable by asking again — a 500 or a
              // dropped connection stranded the player on "You must run your
              // code first" with no way back to their verdict.
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
      <ConfirmSubmitDialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        onConfirm={confirmSubmit}
        isSubmitting={submission.submit.isPending}
      />
      {verdict && allPassed && (
        <VerdictBox
          correct
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
