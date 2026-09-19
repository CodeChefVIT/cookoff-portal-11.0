/**
 * Round domain types — the camelCase shape the API layer (`src/api`) parses
 * the backend's DTOs into, shared by the API layer and the round components.
 * Add fields here ONLY if they exist in the backend API responses.
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
  /** Merged in from `GET /dashboard`'s per-question `attempt_status`. */
  solved?: boolean;
  bought?: boolean;
}

export interface VisualBlock {
  id: string;
  content: string;
}

/** `dto.SubmitVisualSolutionResponse` (`POST /submit/visual`). */
export interface VisualSubmissionResult {
  pointsAwarded: number;
  correct: boolean;
  alreadyAnswered: boolean;
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
