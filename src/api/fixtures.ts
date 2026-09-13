/**
 * Deterministic fixtures for every R2/R3 endpoint (L1 — `router.go` wires
 * only `/health` and `/docs`, so nothing below is real backend behaviour).
 * Selected when `NEXT_PUBLIC_USE_MOCK_API=true`; also reused directly by
 * component/integration tests so test data and demo data never drift apart.
 *
 * Flip the env var off the moment the backend ships these endpoints — no
 * component changes are required, since every resource module in `src/api`
 * calls `readFixture` behind the exact same return type as the real request.
 */
import type { Question, Testcase } from '@/components/rounds/types';

import type { AttemptOutcome } from './attempts';
import type { Session } from './session';
import type { SubmissionRequestInput, SubmissionVerdict } from './submissions';
import type { RoundTime } from './timer';

function delay<T>(value: T, ms = 150): Promise<T> {
  const { promise, resolve } = Promise.withResolvers<T>();
  setTimeout(() => resolve(value), ms);
  return promise;
}

function makeQuestion(
  overrides: Partial<Question> & Pick<Question, 'id' | 'title' | 'round' | 'points'>
): Question {
  return {
    description: `Read the input and produce the expected output for "${overrides.title}".`,
    type: 'code',
    inputFormat: ['A single line containing the input value.'],
    buyIn: overrides.round === 3 ? '0' : '20',
    reward: overrides.round === 3 ? '0' : '50',
    constraints: ['1 <= n <= 10^5'],
    outputFormat: ['A single line containing the answer.'],
    sampleTestInput: ['Hello World !'],
    sampleTestOutput: ['Hello World !'],
    explanation: ['Echo the input back unchanged.'],
    solved: false,
    bought: overrides.round === 3,
    ...overrides,
  };
}

const R2_QUESTION_IDS = [
  'd40d282d-459d-45ce-9082-10e4d50038de',
  'c100ca85-4beb-4e31-ac93-85ab50551cc9',
  '7372c099-2a36-4f74-97b4-4178d4edb87e',
  'b8b5e17d-e30c-4d1e-98ee-1001f407bf52',
  '6ae67c73-daa8-47b4-a409-437c6e43d525',
  'afaa632e-ca4b-49de-835f-97ce914fd966',
  '93002078-0c11-4980-b589-25a0319775a8',
  '3508b561-da43-4fb9-ab70-fd949abbee0f',
  'edb29c10-31c7-4081-8a3a-1c156671505c',
  'd6d62ee1-9c9d-4e5f-bda8-854a2c84d03d',
] as const;

const R3_QUESTION_IDS = [
  'd0283235-ad95-4213-a5d2-410156ce1745',
  '10ba6e98-4b9d-478a-9504-1d7b062bb765',
  'a2340dc4-3957-4565-81bd-a6d0b9e6c144',
  '3d477edb-49ba-4b0d-a355-e841f229d3bc',
] as const;

const R2_FIXTURE_QUESTIONS: Question[] = R2_QUESTION_IDS.map((id, index) =>
  makeQuestion({
    id,
    title: `Chef's Pantry Problem ${index + 1}`,
    round: 2,
    points: 10 + index * 5,
  })
);

const R3_FIXTURE_QUESTIONS: Question[] = R3_QUESTION_IDS.map((id, index) =>
  makeQuestion({
    id,
    title: `The Crucible Problem ${index + 1}`,
    round: 3,
    points: 25 + index * 25,
  })
);

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

interface FixtureMap {
  session: [[], Session];
  questionsByRound: [[round: number], Question[]];
  publicTestcases: [[questionId: string], Testcase[]];
  attempt: [[questionId: string], AttemptOutcome];
  submit: [[payload: SubmissionRequestInput], { submissionId: string }];
  result: [[submissionId: string], SubmissionVerdict];
  time: [[], RoundTime];
}

function buildFixture<K extends keyof FixtureMap>(
  key: K,
  args: FixtureMap[K][0]
): FixtureMap[K][1] {
  if (key === 'session') {
    const session: Session = {
      userId: 'fixture-user',
      email: 'fixture-user@vitstudent.ac.in',
      balance: 237,
      score: 40,
      roundQualified: 3,
      isBanned: false,
    };
    return session as FixtureMap[K][1];
  }
  if (key === 'questionsByRound') {
    const [round] = args as FixtureMap['questionsByRound'][0];
    const questions = round === 3 ? R3_FIXTURE_QUESTIONS : R2_FIXTURE_QUESTIONS;
    return questions as FixtureMap[K][1];
  }
  if (key === 'publicTestcases') {
    const [questionId] = args as FixtureMap['publicTestcases'][0];
    return testcasesFor(questionId) as FixtureMap[K][1];
  }
  if (key === 'attempt') {
    const outcome: AttemptOutcome = { unlocked: true, insufficientBalance: false };
    return outcome as FixtureMap[K][1];
  }
  if (key === 'submit') {
    return { submissionId: `fixture-submission-${Date.now()}` } as FixtureMap[K][1];
  }
  if (key === 'result') {
    const [submissionId] = args as FixtureMap['result'][0];
    const verdict: SubmissionVerdict = {
      submissionId,
      statusId: 3,
      statusDescription: 'Accepted',
      testcasesPassed: 3,
      testcasesFailed: 0,
      results: [1, 2, 3].map(index => ({
        testcaseId: `tc-${index}`,
        hidden: index === 3,
        passed: true,
        statusId: 3,
        statusDescription: 'Accepted',
        runtime: 0.02,
        memory: 256,
        stdout: index === 3 ? undefined : 'Hello World !',
      })),
      pointsAwarded: 10,
      alreadyAnswered: false,
    };
    return verdict as FixtureMap[K][1];
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
