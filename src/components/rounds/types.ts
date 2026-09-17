/**
 * Round domain types - mirror the backend Go DTOs (dto/questions.go,
 * dto/round1.go, dto/attempt.go, dto/submission.go).
 *
 * These are the shared "contract" between the shared Shell and each round's
 * Engine. Add fields here ONLY if they exist in the backend API responses.
 */

export type RoundId = 1 | 2 | 3;

export interface Question {
  id: string;
  description: string;
  title: string;
  type: 'visual' | 'code';
  inputFormat: string[];
  buyIn: string;
  reward: string;
  points: number;
  round: number;
  constraints: string[];
  outputFormat: string[];
  sampleTestInput: string[];
  sampleTestOutput: string[];
  explanation: string[];
  /** Present only when `GET /question/round` includes per-user flags (L4). */
  solved?: boolean;
  bought?: boolean;
}

export interface VisualBlock {
  id: string;
  content: string;
}

export interface VisualSubmissionResult {
  pointsAwarded: number;
  /**
   * `POST /submit/visual` (LLD, dto/round1.go) currently returns only
   * `points_awarded` — no `correct`/`already_answered` flag exists yet.
   * `submitVisual()` derives `correct` as `pointsAwarded > 0` when the
   * backend omits it; ask the backend to add both fields explicitly.
   */
  correct: boolean;
  alreadyAnswered: boolean;
}

export interface Attempt {
  id: string;
  questionId: string;
  userId: string;
  status: 'available' | 'bought' | 'answered';
  isBuyInPaid: boolean;
  newBalance: number;
  attemptedAt?: string;
  answeredAt?: string;
}

export interface Testcase {
  id: string;
  questionId: string;
  input: string;
  expectedOutput: string;
  memory: number;
  runtime: number;
  hidden: boolean;
}

export type Judge0Status =
  | { id: 3; description: 'success' }
  | { id: 4; description: 'wrong answer' }
  | { id: 5; description: 'time limit exceeded' }
  | { id: 6; description: 'compilation error' }
  | { id: 7 | 8 | 9 | 10 | 11 | 12; description: string }
  | { id: 13; description: 'internal error' }
  | { id: 14; description: 'exec format error' };

export interface SubmissionResult {
  submissionId: string;
  testcaseId: string;
  runtime: number;
  memory: number;
  pointsAwarded: number;
  status: Judge0Status;
  stdout?: string;
}

export interface SubmissionRequest {
  sourceCode: string;
  languageId: number;
  questionId: string;
}
