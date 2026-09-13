'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getPublicTestcases, testcaseKeys } from '@/api';
import { useCodeSubmission, useRoundTimer } from '@/components/rounds/hooks';
import { useRoundStore } from '@/stores';

import { ProblemPanel } from '../ProblemPanel';
import { ResultModal } from '../ResultModal';
import type { Question } from '../types';
import { ConsoleOutput } from './code-editor/ConsoleOutput';
import { EditorActions } from './code-editor/EditorActions';
import { EditorToolbar } from './code-editor/EditorToolbar';
import { MonacoWrapper } from './code-editor/MonacoWrapper';
import { ConfirmSubmitDialog } from './ConfirmSubmitDialog';
import { JudgeStatus } from './JudgeStatus';
import { DEFAULT_LANGUAGE, getLanguageById } from './languages';
import { TestcasePanel } from './TestcasePanel';
import { WorkspaceLayout } from './WorkspaceLayout';

/**
 * ROUND 2/3 ENGINE - Entry point for the "Code" rounds.
 *
 * Orchestrates ProblemPanel + MonacoWrapper/EditorToolbar + TestcasePanel +
 * JudgeStatus, and owns the `POST /submit` -> `GET /result/:id` lifecycle
 * via `useCodeSubmission`. The parent `RoundShell`/`BuyInGate` handle
 * chrome and the buy-in gate respectively — this component assumes the
 * editor is already unlocked.
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

  return (
    <>
      <WorkspaceLayout
        problem={<ProblemPanel question={question} index={index} />}
        editor={
          <div className="flex h-full min-h-0 flex-col gap-2">
            <EditorToolbar
              languageId={languageId}
              onLanguageChange={id => setLanguage(question.id, id, getLanguageById(id).boilerplate)}
              onReset={() => resetDraft(question.id, languageId, language.boilerplate)}
              disabled={isSubmitDisabled}
            />
            <div className="min-h-0 flex-1">
              <MonacoWrapper
                value={sourceCode}
                onChange={code => setSourceCode(question.id, code)}
                language={language.monacoId}
                readOnly={isExpired}
              />
            </div>
            <EditorActions
              onSubmit={requestSubmit}
              isSubmitting={submission.submit.isPending}
              disabled={isSubmitDisabled}
              customInputEnabled={customInputEnabled}
              onToggleCustomInput={() => setCustomInputEnabled(value => !value)}
            />
            {customInputEnabled && (
              <textarea
                aria-label="Custom input"
                value={draft?.customInput ?? ''}
                onChange={event => setCustomInput(question.id, event.target.value)}
                placeholder="Custom stdin for Run Code…"
                className="h-24 rounded-lg border border-border bg-secondary p-2 font-mono text-xs text-secondary-foreground"
              />
            )}
            <JudgeStatus
              description={verdict?.description}
              isPolling={submission.result.isFetching}
              timedOut={submission.timedOut}
              onRetry={submission.retryResult}
            />
            {submission.notPurchased && (
              <p role="alert" className="text-sm text-destructive">
                This question hasn&rsquo;t been purchased. Reload the page and place a bet again.
              </p>
            )}
            {submission.submit.isError && !submission.notPurchased && (
              <p role="alert" className="text-sm text-destructive">
                Couldn&rsquo;t submit — your code is still here. Try again.
              </p>
            )}
            <ConsoleOutput
              output={
                submission.result.isError && !submission.timedOut
                  ? "Couldn't fetch your submission result. Try Check again."
                  : ''
              }
              variant="stderr"
            />
          </div>
        }
        results={
          <TestcasePanel
            testcases={testcases.data ?? []}
            verdict={verdict}
            isPolling={submission.result.isFetching}
          />
        }
      />
      <ConfirmSubmitDialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        onConfirm={confirmSubmit}
        isSubmitting={submission.submit.isPending}
      />
      {verdict && allPassed && (
        <ResultModal
          open={resultOpen}
          onClose={() => {
            setDismissedSubmissionId(verdict.submissionId);
            setWasAlreadySolved(true);
          }}
          question={question}
          // dto.ResultResponse carries no payout or "already answered" flag.
          pointsAwarded={question.points}
          alreadyAnswered={wasAlreadySolved}
        />
      )}
    </>
  );
}
