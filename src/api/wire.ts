/**
 * Wire-casing seam (see AGENTS.md "Rounds architecture", conflict C6).
 *
 * Three casings are attested across the sources for the same backend:
 * - `cookoff-portal-11.0/src/components/rounds/types.ts` (this repo, before
 *   this change) — camelCase.
 * - `cookoff-admin-11.0/src/api/*.ts` — PascalCase.
 * - `database/schema/*.sql` — snake_case.
 *
 * No R2/R3 endpoint is implemented (`router.go` wires only /health, /docs),
 * so none of the three is a confirmed wire format. `pickField` accepts all
 * three spellings of a field and normalises to camelCase before the domain
 * Zod schema runs, so a future casing correction is a one-line change here
 * instead of a call-site-by-call-site refactor.
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
