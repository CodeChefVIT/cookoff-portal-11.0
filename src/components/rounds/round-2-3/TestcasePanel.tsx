import type { Testcase } from '../types';

/**
 * ROUND 2/3 - Testcase Panel
 *
 * Displays the test cases for the current code question.
 * Data source: `GET /question/:id/testcases` -> `TestcaseResponse`
 * Shows the status of each test case after Judge0 has processed the submission.
 */
export interface TestcasePanelProps {
  /** Testcases for the current question. */
  testcases: Testcase[];
}

export function TestcasePanel({ testcases }: TestcasePanelProps) {
  void testcases;
  return <div className="testcase-panel"></div>;
}
