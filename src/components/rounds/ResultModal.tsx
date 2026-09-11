import type { SubmissionResult } from './types';

/**
 * SHARED RESULT MODAL
 *
 * Shows the outcome of a submission (Success/Wrong Answer).
 * Consumes the response from `POST /submit/visual` or `POST /submit`.
 */
export interface ResultModalProps {
  /** The backend verdict for the last submission. */
  result: SubmissionResult;
}

export function ResultModal({ result }: ResultModalProps) {
  void result;
  return <div className="result-modal"></div>;
}
