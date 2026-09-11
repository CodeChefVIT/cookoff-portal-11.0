import type { NextRequest } from 'next/server';

/**
 * API Route - Visual (Round 1) submission proxy.
 *
 * Maps the portal request to the backend `POST /submit/visual`.
 * Backend request body: { question_id: uuid, blocks: uuid[] }
 * Backend response:    { points_awarded: number }
 *
 * TODO: Forward the (authed) user's session to the backend, handle 402
 * (insufficient balance) and 409 responses here.
 */
export async function POST(request: NextRequest) {
  void request;
  // Proxy to backend /submit/visual
  return Response.json({ ok: true });
}
