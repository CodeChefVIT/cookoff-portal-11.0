/**
 * ROUND 2/3 ENGINE - Entry point for the "Code" rounds.
 *
 * THIS FOLDER IS OWNED BY THE ROUND 2/3 TEAM.
 *
 * Responsibilities:
 * - Orchestrates <CodeEditor> + <TestcasePanel> + <JudgeStatus>
 * - Handles submission via `POST /submit`
 *   Request: { source_code: string, language_id: number, question_id: string }
 * - The parent <RoundShell> conditionally hides <CurrencyBox> for roundId === 3.
 */
export interface CodeEngineProps {
  /** Question id used to fetch testcases and submit. */
  questionId: string;
}

export function CodeEngine({ questionId }: CodeEngineProps) {
  void questionId;
  // Render <CodeEditor>, <TestcasePanel>, <JudgeStatus>
  return <div className="code-engine"></div>;
}
