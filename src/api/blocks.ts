import * as z from 'zod';

import { createQueryKeys } from '@/lib/query';
import type { VisualBlock } from '@/types';

import { request } from './request';
import { envelope, normalizeWire } from './wire';

const BLOCK_FIELDS = ['id', 'content'] as const;

const visualBlockShape = z.object({
  id: z.string(),
  content: z.string(),
});

export const visualBlockSchema = z
  .looseObject({})
  .transform(raw =>
    visualBlockShape.parse(normalizeWire(raw, BLOCK_FIELDS))
  ) satisfies z.ZodType<VisualBlock>;

export const visualBlockListSchema = z
  .union([z.array(z.unknown()), z.null(), z.undefined()])
  .transform(value => value ?? [])
  .pipe(z.array(visualBlockSchema));

export const blockKeys = createQueryKeys('blocks');

/**
 * `GET /question/:id/blocks` — Round 1 only (LLD §2.2, `questions.go#ListBlocks`
 * 404s for a non-`round=1`/non-`visual` question). Response is a
 * `dto.SuccessResponse{data: VisualBlockResponse[]}` envelope.
 */
export async function getVisualBlocks(questionId: string): Promise<VisualBlock[]> {
  return request({
    url: `/question/${questionId}/blocks`,
    method: 'GET',
    schema: envelope(visualBlockListSchema),
  });
}
