export { api, createApiClient } from './client';
export {
  ApiError,
  ERROR_CODES,
  isApiError,
  isTryLaterError,
  isNotPurchasedError,
  isNotQualifiedError,
  isRoundNotRunningError,
  toApiError,
} from './errors';
export { request } from './request';
export { envelope, normalizeWire, unwrapEnvelope } from './wire';

export { getSession, sessionKeys, sessionSchema } from './session';
export type { Session, DashboardQuestionSummary } from './session';

export {
  getQuestionsByRound,
  getQuestionById,
  mergeAttemptStatus,
  questionKeys,
  questionSchema,
} from './questions';

export { getPublicTestcases, testcaseKeys, testcaseSchema } from './testcases';

export { blockKeys, getVisualBlocks, visualBlockSchema } from './blocks';

export {
  submitVisual,
  visualSubmissionKeys,
  visualSubmissionRequestSchema,
} from './visual-submissions';
export type { VisualSubmissionRequestInput } from './visual-submissions';

export { createAttempt, attemptKeys } from './attempts';
export type { AttemptOutcome } from './attempts';

export {
  CAPABILITIES,
  PASSED_STATUS,
  isPassed,
  submissionKeys,
  submissionRequestSchema,
  customRunRequestSchema,
  submitCode,
  getSubmissionResult,
  runCode,
  runCustom,
} from './submissions';
export type {
  SubmissionRequestInput,
  SubmissionVerdict,
  TestcaseResult,
  CustomRunRequestInput,
  CustomRunResult,
  Judge0CallbackPayload,
} from './submissions';

export { getRoundTime, remainingMs, timerKeys } from './timer';
export type { RoundTime } from './timer';
