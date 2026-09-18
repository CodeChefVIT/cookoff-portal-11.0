import * as z from 'zod';

/**
 * Wire-casing seam. The backend's DTOs are snake_case throughout
 * (`cookoff-11.0-be/internal/dto/*.go`); the portal works in camelCase.
 * `normalizeWire` is the one place that translation happens.
 */

export type WireRecord = Record<string, unknown>;

function toSnakeCase(camel: string) {
  return camel.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/** Builds a camelCase object from the snake_case wire record, keeping only `fields`. */
export function normalizeWire<F extends readonly string[]>(
  record: WireRecord,
  fields: F
): Record<F[number], unknown> {
  const result = {} as Record<F[number], unknown>;
  for (const field of fields) {
    result[field as F[number]] = record[toSnakeCase(field)];
  }
  return result;
}

export interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export function isSuccessEnvelope(value: unknown): value is SuccessEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    (value as WireRecord).success !== false
  );
}

/** Unwraps `dto.SuccessResponse{success,message,data}` when present, else passes the payload through. */
export function unwrapEnvelope(value: unknown): unknown {
  if (isSuccessEnvelope(value)) return value.data;
  return value;
}

/**
 * Wraps a "shape" schema (validating the domain payload) so it also accepts
 * the live backend's `dto.SuccessResponse{success,message,data}` envelope,
 * unwrapping `data` first. Every real GET/POST response is wrapped this way
 * (`internal/dto/common.go`); unit tests pass the domain shape directly, so
 * this is applied at the call site (each `getX()`/`postX()` function), not
 * inside the shape schemas themselves.
 */
export function envelope<T extends z.ZodType>(inner: T) {
  return z
    .unknown()
    .transform(raw => unwrapEnvelope(raw))
    .pipe(inner);
}
