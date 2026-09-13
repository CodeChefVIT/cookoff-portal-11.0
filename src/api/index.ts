export { api, createApiClient } from './client';
export { ApiError, isApiError, toApiError } from './errors';
export { request } from './request';

export { getSession, logout, sessionKeys, sessionSchema } from './session';
export type { Session } from './session';

export { getQuestionsByRound, questionKeys, questionSchema } from './questions';

export { getPublicTestcases, testcaseKeys, testcaseSchema } from './testcases';

export { blockKeys, getVisualBlocks, visualBlockSchema } from './blocks';

export { createAttempt, attemptKeys } from './attempts';
export type { AttemptOutcome } from './attempts';

export {
  submitVisual,
  visualSubmissionKeys,
  visualSubmissionRequestSchema,
} from './visual-submissions';
export type { VisualSubmissionRequestInput } from './visual-submissions';

export {
  CAPABILITIES,
  JUDGE0_LABELS,
  isTerminalStatus,
  submissionKeys,
  submissionRequestSchema,
  submitCode,
  getSubmissionResult,
} from './submissions';
export type { SubmissionRequestInput, SubmissionVerdict, TestcaseResult } from './submissions';

export { computeClockOffset, getRoundTime, remainingMs, timerKeys } from './timer';
export type { RoundTime } from './timer';

export { readFixture } from './fixtures';
