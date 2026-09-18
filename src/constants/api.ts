export const API_TIMEOUT_MS = 10_000;

/**
 * `GET /dashboard` is the session probe, and a timeout there used to sign the
 * contestant out. It costs three Postgres round-trips (ban check, user,
 * question list) and runs on every window focus, so under contest load its p99
 * can exceed the default. Give it more room than an ordinary read.
 */
export const SESSION_TIMEOUT_MS = 30_000;

export const QUERY_STALE_TIME_MS = 60_000;
export const QUERY_GC_TIME_MS = 5 * 60_000;
