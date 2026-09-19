'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { isApiError } from '@/api';
import { useSession } from '@/components/rounds/hooks';
import { Button, LoadingScreen } from '@/components/ui';

import { claimDraftsFor } from './draft-owner';

/**
 * `GET /dashboard` doubles as the session probe (L12 — no dedicated
 * `/session` endpoint exists). A 401 here means an expired/absent session;
 * the axios interceptor in `api/client.ts` already attempted one silent
 * `/refreshToken` before this renders an error.
 *
 * Only a 401 signs the contestant out. Every other failure — a 500, a schema
 * mismatch, or a timeout under contest load — used to redirect to `/login`
 * too, which logged out still-authenticated players and looped them straight
 * back here as soon as the backend got slow.
 */
export function SessionGuard({ children }: { children: ReactNode }) {
  const session = useSession({ sync: true });
  const router = useRouter();

  const unauthenticated =
    session.isError && isApiError(session.error) && session.error.status === 401;

  useEffect(() => {
    if (unauthenticated) router.replace('/login');
  }, [unauthenticated, router]);

  // Persisted drafts are keyed by question only, so a shared machine would hand
  // the next contestant the previous one's code. Claim them for whoever is
  // signed in now — during render, before any child that reads a draft mounts,
  // so the editor can never show (and re-save) the previous account's code.
  // `claimDraftsFor` is idempotent: a no-op once this account owns the drafts.
  const userId = session.data?.userId;
  if (userId) claimDraftsFor(userId);

  if (session.isLoading) {
    return <LoadingScreen />;
  }

  if (unauthenticated) return null;

  if (session.isError) {
    return (
      <div
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center"
      >
        <span className="font-display text-2xl tracking-wide text-brand">COOKOFF 11</span>
        <p className="text-sm text-muted-foreground">
          Couldn&rsquo;t reach the kitchen. You are still signed in, this one is on us.
        </p>
        <Button variant="outline" onClick={() => void session.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
