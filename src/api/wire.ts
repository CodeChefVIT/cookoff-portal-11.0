import * as z from 'zod';

/**
 * Wire-casing seam (see AGENTS.md "Rounds architecture", conflict C6).
 *
 * The live backend (confirmed against `cookoff-11.0-be` after it wired real
 * routes) uses snake_case JSON tags throughout (`internal/dto/*.go`).
 * `pickField` still tries camelCase and PascalCase first for resilience —
 * cheap insurance against a future DTO rename — before falling back to
 * snake_case, so a casing change stays a one-line fix here.
 */

export type WireRecord = Record<string, unknown>;

function toPascalCase(camel: string) {
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(camel: string) {
  return camel.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/** Reads `field` off `record` trying camelCase, PascalCase, then snake_case keys. */
export function pickField(record: WireRecord, camelField: string): unknown {
  if (camelField in record) return record[camelField];
  const pascal = toPascalCase(camelField);
  if (pascal in record) return record[pascal];
  const snake = toSnakeCase(camelField);
  if (snake in record) return record[snake];
  return undefined;
}

/** Builds a plain camelCase object from `fields`, tolerant of all three casings. */
export function normalizeWire<F extends readonly string[]>(
  record: WireRecord,
  fields: F
): Record<F[number], unknown> {
  const result = {} as Record<F[number], unknown>;
  for (const field of fields) {
    result[field as F[number]] = pickField(record, field);
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
 * (`internal/dto/common.go`); fixtures and unit tests pass the domain shape
 * directly, so this is applied at the call site (each `getX()`/`postX()`
 * function), not inside the shape schemas themselves.
 */
export function envelope<T extends z.ZodType>(inner: T) {
  return z
    .unknown()
    .transform(raw => unwrapEnvelope(raw))
    .pipe(inner);
}
