import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { output as ZodOutput, ZodType } from 'zod';

import { api } from './client';
import { toApiError } from './errors';

export async function request<S extends ZodType>(
  config: AxiosRequestConfig & { schema: S; client?: AxiosInstance }
): Promise<ZodOutput<S>>;
export async function request<T = unknown>(
  config: AxiosRequestConfig & { client?: AxiosInstance }
): Promise<T>;
export async function request(
  config: AxiosRequestConfig & { schema?: ZodType; client?: AxiosInstance }
): Promise<unknown> {
  const { schema, client = api, ...axiosConfig } = config;
  const response = await client.request(axiosConfig);
  if (schema) {
    // A `.parse()` thrown *inside* a `.transform()` escapes `safeParse` — the
    // shape schemas nest one (see `submissionResultSchema` in
    // `submissions.ts`), so without this catch a raw ZodError reaches callers
    // and every `isApiError()` check downstream silently fails.
    let result: ReturnType<typeof schema.safeParse>;
    try {
      result = schema.safeParse(response.data);
    } catch (error) {
      throw toApiError(error);
    }
    if (!result.success) throw toApiError(result.error);
    return result.data;
  }
  return response.data;
}
