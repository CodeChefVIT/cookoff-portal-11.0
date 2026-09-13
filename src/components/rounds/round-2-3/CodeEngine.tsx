'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getPublicTestcases, testcaseKeys } from '@/api';
import { useCodeSubmission, useRoundTimer } from '@/components/rounds/hooks';
import { useRoundStore } from '@/stores';

import { ResultModal } from '../ResultModal';
import type { Question } from '../types';
import { ConsoleOutput } from './code-editor/ConsoleOutput';
import { EditorToolbar } from './code-editor/EditorToolbar';
import { MonacoWrapper } from './code-editor/MonacoWrapper';
import { JudgeStatus } from './JudgeStatus';
import { DEFAULT_LANGUAGE, getLanguageById } from './languages';
import { ProblemPanel } from './ProblemPanel';
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

  const submission = useCodeSubmission(roundId);
  const { isExpired } = useRoundTimer();

  useEffect(() => {
    if (submission.notPurchased) onNotPurchased?.();
  }, [submission.notPurchased, onNotPurchased]);

  const verdict = submission.result.data;
  const allPassed =
    verdict !== undefined && verdict.testcasesFailed === 0 && verdict.testcasesPassed > 0;
  const resultOpen = allPassed && verdict.submissionId !== dismissedSubmissionId;

  function handleSubmit() {
    if (!sourceCode.trim()) {
      toast.error('Write some code before submitting.');
      return;
    }
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
              onSubmit={handleSubmit}
              onReset={() => resetDraft(question.id, languageId, language.boilerplate)}
              isSubmitting={submission.submit.isPending}
              disabled={isSubmitDisabled}
              customInputEnabled={customInputEnabled}
              onToggleCustomInput={() => setCustomInputEnabled(value => !value)}
            />
            <div className="min-h-0 flex-1">
              <MonacoWrapper
                value={sourceCode}
                onChange={code => setSourceCode(question.id, code)}
                language={language.monacoId}
                readOnly={isExpired}
              />
            </div>
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
              statusId={submission.result.data?.statusId}
              isPolling={submission.result.isFetching}
              pollCapExceeded={submission.pollCapExceeded}
              onRetry={submission.retryPolling}
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
            <ConsoleOutput output={submission.result.data?.stderr ?? ''} variant="stderr" />
          </div>
        }
        results={
          <TestcasePanel
            testcases={testcases.data ?? []}
            verdict={submission.result.data}
            isPolling={submission.result.isFetching}
          />
        }
      />
      {verdict && (
        <ResultModal
          open={resultOpen}
          onClose={() => setDismissedSubmissionId(verdict.submissionId)}
          result={verdict}
          question={question}
        />
      )}
    </>
  );
}
