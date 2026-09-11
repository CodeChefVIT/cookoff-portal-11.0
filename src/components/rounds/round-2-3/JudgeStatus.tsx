/**
 * ROUND 2/3 - Judge Status
 *
 * Live status indicator for the submission.
 * Polls `GET /result/:submission_id` until the status is `success` or `wrong answer`.
 * Judge0 statuses: 3 -> success, 4 -> wrong answer, 5 -> TLE, 6 -> CE, etc.
 */
export interface JudgeStatusProps {
  /** Submission id returned by `POST /submit`; polled for the final verdict. */
  submissionId: string;
}

export function JudgeStatus({ submissionId }: JudgeStatusProps) {
  void submissionId;
  // Polling logic for submission status
  return <div className="judge-status"></div>;
}
