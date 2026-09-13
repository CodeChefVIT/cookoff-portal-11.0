export { api, createApiClient } from './client';
export { ApiError, isApiError, toApiError } from './errors';
export { request } from './request';
export { envelope, normalizeWire, unwrapEnvelope } from './wire';

export { getSession, logout, sessionKeys, sessionSchema } from './session';
export type { Session, DashboardQuestionSummary } from './session';

export {
  getQuestionsByRound,
  getQuestionById,
  mergeAttemptStatus,
  questionKeys,
  questionSchema,
} from './questions';

export { getPublicTestcases, testcaseKeys, testcaseSchema } from './testcases';

export { createAttempt, attemptKeys } from './attempts';
export type { AttemptOutcome } from './attempts';

export {
  CAPABILITIES,
  PASSED_STATUS,
  isPassed,
  submissionKeys,
  submissionRequestSchema,
  submitCode,
  getSubmissionResult,
} from './submissions';
export type { SubmissionRequestInput, SubmissionVerdict, TestcaseResult } from './submissions';

export { computeClockOffset, getRoundTime, remainingMs, timerKeys } from './timer';
export type { RoundTime } from './timer';

export { readFixture } from './fixtures';
