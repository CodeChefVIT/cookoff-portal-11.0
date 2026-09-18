import * as z from 'zod';

import { createQueryKeys } from '@/lib/query';
import { uuidSchema } from '@/schemas';
import type { VisualSubmissionResult } from '@/types';

import { request } from './request';
import { normalizeWire, unwrapEnvelope } from './wire';

/**
 * A block can only sit in one slot of the chain (Round 1 blocks are used
 * once, not cloned), so a repeated id is always a client bug — reject it
 * before it reaches the network.
 */
export const visualSubmissionRequestSchema = z.object({
  questionId: uuidSchema,
  blocks: z
    .array(uuidSchema)
    .min(1, 'Add at least one block to your chain before submitting.')
    .refine(
      ids => new Set(ids).size === ids.length,
      'Each block can only appear once in the chain.'
    ),
});

export type VisualSubmissionRequestInput = z.infer<typeof visualSubmissionRequestSchema>;

const VISUAL_RESULT_FIELDS = ['pointsAwarded', 'correct', 'alreadyAnswered'] as const;

const visualSubmissionResultShape = z.object({
  pointsAwarded: z.coerce.number().default(0),
  correct: z.boolean().optional(),
  alreadyAnswered: z.boolean().default(false),
});

export const visualSubmissionResultSchema = z
  .looseObject({})
  .transform(raw => visualSubmissionResultShape.parse(normalizeWire(raw, VISUAL_RESULT_FIELDS)))
  .transform((result): VisualSubmissionResult => ({
    ...result,
    // `dto.SubmitVisualSolutionResponse` now sends `correct` and
    // `already_answered` explicitly. The `pointsAwarded > 0` fallback is kept
    // only for an older backend: it is wrong for a resubmission on a settled
    // attempt, which scores zero even though the chain is right.
    correct: result.correct ?? result.pointsAwarded > 0,
  }));

export const visualSubmissionKeys = createQueryKeys('visual-submissions');

/**
 * `POST /submit/visual` — SPEC-ONLY (LLD, dto/round1.go). Synchronous, no
 * polling: the backend scores the chain against `visual_solutions` inline
 * and returns the verdict in the same response. Never auto-retried
 * (mutations default to `retry: 0`, see `lib/query.ts`).
 */
export async function submitVisual(
  input: VisualSubmissionRequestInput
): Promise<VisualSubmissionResult> {
  const payload = visualSubmissionRequestSchema.parse(input);
  const raw = await request<unknown>({
    url: '/submit/visual',
    method: 'POST',
    data: { question_id: payload.questionId, blocks: payload.blocks },
  });
  return visualSubmissionResultSchema.parse(unwrapEnvelope(raw));
}
