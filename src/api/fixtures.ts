/**
 * Deterministic fixtures for the endpoints not yet safe to hit for local/CI
 * development (`GET /getTime` doesn't exist on the backend at all — L2).
 * Selected when `NEXT_PUBLIC_USE_MOCK_API=true`; also reused directly by
 * component/integration tests so test data and demo data never drift apart.
 * Every resource module calls `readFixture` behind the exact same return
 * type as the real request, so flipping the env var off requires no
 * component changes.
 */
import type {
  Question,
  Testcase,
  VisualBlock,
  VisualSubmissionResult,
} from '@/components/rounds/types';

import type { AttemptOutcome } from './attempts';
import type { Session } from './session';
import type { SubmissionRequestInput, SubmissionVerdict } from './submissions';
import type { RoundTime } from './timer';
import type { VisualSubmissionRequestInput } from './visual-submissions';

export interface CustomRunResult {
  stdout: string | null;
  stderr: string | null;
  message: string | null;
  time?: string;
  memory?: number;
  status: { id: number; description: string };
  isPassed: boolean;
}

export interface CustomRunRequestInput {
  languageId: number;
  sourceCode: string;
  stdin?: string;
}

function delay<T>(value: T, ms = 150): Promise<T> {
  const { promise, resolve } = Promise.withResolvers<T>();
  setTimeout(() => resolve(value), ms);
  return promise;
}

function makeQuestion(
  overrides: Partial<Question> & Pick<Question, 'id' | 'title' | 'round' | 'points'>
): Question {
  // R1 and R3 have no buy-in (RoundConfig.hasBuyIn === false) — `bought: true`
  // simulates the "already open, nothing to purchase" state.
  const isFreeRound = overrides.round === 1 || overrides.round === 3;
  return {
    description: `Read the input and produce the expected output for "${overrides.title}".`,
    type: 'code',
    inputFormat: ['A single line containing the input value.'],
    buyIn: isFreeRound ? '0' : '20',
    reward: isFreeRound ? '0' : '50',
    constraints: ['1 <= n <= 10^5'],
    outputFormat: ['A single line containing the answer.'],
    sampleTestInput: ['Hello World !'],
    sampleTestOutput: ['Hello World !'],
    explanation: ['Echo the input back unchanged.'],
    solved: false,
    bought: isFreeRound,
    ...overrides,
  };
}

const R1_QUESTION_IDS = [
  '0a0a0a0a-1a1a-4a1a-8a1a-0a0a0a0a0a01',
  '0a0a0a0a-1a1a-4a1a-8a1a-0a0a0a0a0a02',
  '0a0a0a0a-1a1a-4a1a-8a1a-0a0a0a0a0a03',
  '0a0a0a0a-1a1a-4a1a-8a1a-0a0a0a0a0a04',
] as const;

const R2_QUESTION_IDS = [
  'd40d282d-459d-45ce-9082-10e4d50038de',
  'f73a45c7-9204-4340-a50d-bf061ffea054',
  '2db5092f-b4b7-4560-b8be-b0f922eb9f0a',
] as const;

const R3_QUESTION_IDS = [
  'b289c894-3995-467b-b0b3-f09dfd4a0a4c',
  '5fe45f94-e51c-43f5-bfbe-d4b68c34f3a7',
  '3a290947-f4e9-4e78-bebc-031e426db12c',
] as const;

export const R2_FIXTURE_QUESTIONS: Question[] = [
  makeQuestion({
    id: R2_QUESTION_IDS[0],
    title: 'Two Sum',
    round: 2,
    points: 10,
    buyIn: '20',
    reward: '50',
  }),
  makeQuestion({
    id: R2_QUESTION_IDS[1],
    title: 'Reverse String',
    round: 2,
    points: 15,
    buyIn: '25',
    reward: '60',
  }),
  makeQuestion({
    id: R2_QUESTION_IDS[2],
    title: 'Palindrome Check',
    round: 2,
    points: 20,
    buyIn: '30',
    reward: '70',
  }),
];

export const R3_FIXTURE_QUESTIONS: Question[] = [
  makeQuestion({
    id: R3_QUESTION_IDS[0],
    title: 'Longest Palindrome',
    round: 3,
    points: 25,
    buyIn: '0',
    reward: '0',
  }),
  makeQuestion({
    id: R3_QUESTION_IDS[1],
    title: 'Median of Two Arrays',
    round: 3,
    points: 35,
    buyIn: '0',
    reward: '0',
  }),
  makeQuestion({
    id: R3_QUESTION_IDS[2],
    title: 'Graph Cycle Detection',
    round: 3,
    points: 40,
    buyIn: '0',
    reward: '0',
  }),
];

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

const makeBlock = (prefix: string) => {
  let counter = 0;
  return (content: string): VisualBlock => ({
    id: `${prefix}-block-${++counter}`,
    content,
  });
};

const block = makeBlock('b');

const helloBlocks = [
  block('Print "Hello"'),
  block('Print "World"'),
  block('Print "Goodbye"'),
  block('Set x to 0'),
];

const sumBlocks = [
  block('Set sum to 0'),
  block('Add a to sum'),
  block('Add b to sum'),
  block('Print sum'),
  block('Set sum to 100'),
  block('Subtract b from sum'),
];

const countBlocks = [
  block('Set count to 1'),
  block('Repeat 5 times'),
  block('Increase count by 1'),
  block('Print count'),
  block('Decrease count by 1'),
  block('Set count to 10'),
  block('Stop'),
];

const evenOddBlocks = [
  block('Set n to input'),
  block('If n mod 2 equals 0'),
  block('Print "Even"'),
  block('Else'),
  block('Print "Odd"'),
  block('Set n to 0'),
  block('Print n'),
];

/** Question id -> the palette blocks it offers and the one correct ordered chain. */
const R1_PUZZLES: Record<string, { blocks: VisualBlock[]; solution: string[] }> = {
  [R1_QUESTION_IDS[0]]: { blocks: helloBlocks, solution: [helloBlocks[0].id, helloBlocks[1].id] },
  [R1_QUESTION_IDS[1]]: {
    blocks: sumBlocks,
    solution: [sumBlocks[0].id, sumBlocks[1].id, sumBlocks[2].id, sumBlocks[3].id],
  },
  [R1_QUESTION_IDS[2]]: {
    blocks: countBlocks,
    solution: [countBlocks[0].id, countBlocks[1].id, countBlocks[2].id, countBlocks[3].id],
  },
  [R1_QUESTION_IDS[3]]: {
    blocks: evenOddBlocks,
    solution: [
      evenOddBlocks[0].id,
      evenOddBlocks[1].id,
      evenOddBlocks[2].id,
      evenOddBlocks[3].id,
      evenOddBlocks[4].id,
    ],
  },
};

const R1_FIXTURE_QUESTIONS: Question[] = [
  makeQuestion({
    id: R1_QUESTION_IDS[0],
    title: 'Assemble: Hello World',
    description: 'Arrange the blocks into a chain that prints "Hello" followed by "World".',
    round: 1,
    points: 10,
    type: 'visual',
    inputFormat: [],
    outputFormat: [],
    sampleTestInput: [],
    sampleTestOutput: [],
    explanation: [],
    constraints: [],
  }),
  makeQuestion({
    id: R1_QUESTION_IDS[1],
    title: 'Assemble: Sum Two Numbers',
    description: 'Arrange the blocks into a chain that sums two numbers and prints the result.',
    round: 1,
    points: 15,
    type: 'visual',
    inputFormat: [],
    outputFormat: [],
    sampleTestInput: [],
    sampleTestOutput: [],
    explanation: [],
    constraints: [],
  }),
  makeQuestion({
    id: R1_QUESTION_IDS[2],
    title: 'Assemble: Count to Five',
    description: 'Arrange the blocks into a chain that counts from 1 to 5 and prints each value.',
    round: 1,
    points: 20,
    type: 'visual',
    inputFormat: [],
    outputFormat: [],
    sampleTestInput: [],
    sampleTestOutput: [],
    explanation: [],
    constraints: [],
  }),
  makeQuestion({
    id: R1_QUESTION_IDS[3],
    title: 'Assemble: Even or Odd',
    description: 'Arrange the blocks into a chain that prints whether a number is even or odd.',
    round: 1,
    points: 25,
    type: 'visual',
    inputFormat: [],
    outputFormat: [],
    sampleTestInput: [],
    sampleTestOutput: [],
    explanation: [],
    constraints: [],
  }),
];

const ALL_FIXTURE_QUESTIONS = [
  ...R1_FIXTURE_QUESTIONS,
  ...R2_FIXTURE_QUESTIONS,
  ...R3_FIXTURE_QUESTIONS,
];

const FIXTURE_TESTCASES: Record<string, Testcase[]> = {};
function testcasesFor(questionId: string): Testcase[] {
  FIXTURE_TESTCASES[questionId] ??= [1, 2, 3].map(index => ({
    id: `${questionId}-tc${index}`,
    questionId,
    input: `Hello World !`,
    expectedOutput: `Hello World !`,
    memory: 256,
    runtime: 0.02,
    hidden: index === 3,
  }));
  return FIXTURE_TESTCASES[questionId];
}

const FIXTURE_SUBMISSION_QUESTIONS = new Map<string, string>();

interface FixtureMap {
  session: [[], Session];
  questionsByRound: [[round: number], Question[]];
  questionById: [[questionId: string], Question];
  publicTestcases: [[questionId: string], Testcase[]];
  visualBlocks: [[questionId: string], VisualBlock[]];
  attempt: [[questionId: string], AttemptOutcome];
  submit: [[payload: SubmissionRequestInput], { submissionId: string }];
  submitVisual: [[payload: VisualSubmissionRequestInput], VisualSubmissionResult];
  result: [[submissionId: string], SubmissionVerdict];
  time: [[], RoundTime];
  runCode: [[payload: SubmissionRequestInput], SubmissionVerdict];
  runCustom: [[payload: CustomRunRequestInput], CustomRunResult];
}

function buildFixture<K extends keyof FixtureMap>(
  key: K,
  args: FixtureMap[K][0]
): FixtureMap[K][1] {
  if (key === 'session') {
    const session: Session = {
      userId: 'fixture-user',
      name: 'Fixture User',
      email: 'fixture-user@vitstudent.ac.in',
      balance: 237,
      score: 40,
      roundQualified: 2,
      questions: [],
    };
    return session as FixtureMap[K][1];
  }
  if (key === 'questionsByRound') {
    const [round] = args as FixtureMap['questionsByRound'][0];
    const questions =
      round === 1
        ? R1_FIXTURE_QUESTIONS
        : round === 3
          ? R3_FIXTURE_QUESTIONS
          : R2_FIXTURE_QUESTIONS;
    return questions as FixtureMap[K][1];
  }
  if (key === 'questionById') {
    const [questionId] = args as FixtureMap['questionById'][0];
    const question = ALL_FIXTURE_QUESTIONS.find(candidate => candidate.id === questionId);
    if (!question) throw new Error(`No fixture question registered for "${questionId}"`);
    return question as FixtureMap[K][1];
  }
  if (key === 'publicTestcases') {
    const [questionId] = args as FixtureMap['publicTestcases'][0];
    return testcasesFor(questionId).filter(testcase => !testcase.hidden) as FixtureMap[K][1];
  }
  if (key === 'visualBlocks') {
    const [questionId] = args as FixtureMap['visualBlocks'][0];
    const puzzle = R1_PUZZLES[questionId];
    // Reversed, not the solution order — the palette should never hand the
    // chain back pre-solved.
    return (puzzle ? [...puzzle.blocks].reverse() : []) as FixtureMap[K][1];
  }
  if (key === 'attempt') {
    const outcome: AttemptOutcome = {
      unlocked: true,
      insufficientBalance: false,
      roundNotRunning: false,
    };
    return outcome as FixtureMap[K][1];
  }
  if (key === 'submit') {
    const [payload] = args as FixtureMap['submit'][0];
    const submissionId = `fixture-submission-${Date.now()}`;
    FIXTURE_SUBMISSION_QUESTIONS.set(submissionId, payload.questionId);
    return { submissionId } as FixtureMap[K][1];
  }
  if (key === 'submitVisual') {
    const [payload] = args as FixtureMap['submitVisual'][0];
    const puzzle = R1_PUZZLES[payload.questionId];
    const correct = puzzle !== undefined && arraysEqual(puzzle.solution, payload.blocks);
    const question = R1_FIXTURE_QUESTIONS.find(q => q.id === payload.questionId);
    const result: VisualSubmissionResult = {
      pointsAwarded: correct ? (question?.points ?? 0) : 0,
      correct,
      alreadyAnswered: false,
    };
    return result as FixtureMap[K][1];
  }
  if (key === 'result') {
    const [submissionId] = args as FixtureMap['result'][0];
    const questionId = FIXTURE_SUBMISSION_QUESTIONS.get(submissionId) ?? R2_QUESTION_IDS[0];
    const cases = testcasesFor(questionId);
    const verdict: SubmissionVerdict = {
      submissionId,
      questionId,
      passed: cases.length,
      failed: 0,
      runtime: 0.02,
      memory: 256,
      submissionTime: new Date().toISOString(),
      description: `All ${cases.length} testcases passed`,
      testcases: cases.map(testcase => ({
        testcaseId: testcase.id,
        runtime: 0.02,
        memory: 256,
        status: 'Success',
        description: 'Success',
      })),
    };
    return verdict as FixtureMap[K][1];
  }
  if (key === 'runCode') {
    const [payload] = args as FixtureMap['runCode'][0];
    const cases = testcasesFor(payload.questionId).filter(tc => !tc.hidden);
    const verdict: SubmissionVerdict = {
      submissionId: `fixture-run-${Date.now()}`,
      questionId: payload.questionId,
      passed: cases.length,
      failed: 0,
      runtime: 0.02,
      memory: 256,
      submissionTime: new Date().toISOString(),
      description: `All ${cases.length} testcases passed`,
      testcases: cases.map(testcase => ({
        testcaseId: testcase.id,
        runtime: 0.02,
        memory: 256,
        status: 'Success',
        description: 'Success',
      })),
    };
    return verdict as FixtureMap[K][1];
  }
  if (key === 'runCustom') {
    const result: CustomRunResult = {
      stdout: 'Custom Output: Hello World !',
      stderr: null,
      message: null,
      time: '0.020',
      memory: 256,
      status: { id: 3, description: 'Accepted' },
      isPassed: true,
    };
    return result as FixtureMap[K][1];
  }
  if (key === 'time') {
    const now = Date.now();
    const time: RoundTime = {
      serverTime: new Date(now),
      roundStartTime: new Date(now - 5 * 60_000),
      roundEndTime: new Date(now + 85 * 60_000),
    };
    return time as FixtureMap[K][1];
  }
  throw new Error(`No fixture registered for "${key}"`);
}

export function readFixture<K extends keyof FixtureMap>(
  key: K,
  ...args: FixtureMap[K][0]
): Promise<FixtureMap[K][1]> {
  return delay(buildFixture(key, args));
}

/** Test-only escape hatch: the one correct ordered chain for a Round 1 fixture question. */
export function getFixtureVisualSolution(questionId: string): string[] | undefined {
  return R1_PUZZLES[questionId]?.solution;
}
