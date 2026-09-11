import type { NextRequest } from 'next/server';

/**
 * API Route - Code (Round 2/3) submission proxy.
 *
 * Maps the portal request to the backend `POST /submit`.
 * Backend request body: { source_code: string, language_id: number, question_id: string }
 * Judge0 can also be polled via `GET /result/:submission_id`.
 *
 * TODO: Forward the (authed) user's session to the backend, handle 402
 * (insufficient balance) responses here.
 */
export async function POST(request: NextRequest) {
  void request;
  // Proxy to backend /submit
  return Response.json({ ok: true });
}
