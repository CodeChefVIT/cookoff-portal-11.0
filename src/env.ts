import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
    // Fixture-backed mock API mode. Every R2/R3 backend endpoint is
    // unimplemented today (see AGENTS.md "Rounds architecture"); flip this
    // off the moment the real endpoints land — no component changes needed.
    NEXT_PUBLIC_USE_MOCK_API: z.stringbool().default(false),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
