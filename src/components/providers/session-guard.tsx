'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useSession } from '@/components/rounds/hooks';

/**
 * `GET /dashboard` doubles as the session probe (L12 — no dedicated
 * `/session` endpoint exists). A 401 here means an expired/absent session;
 * the axios interceptor in `api/client.ts` already attempted one silent
 * `/refreshToken` before this renders an error.
 */
export function SessionGuard({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.isError) router.replace('/login');
  }, [session.isError, router]);

  if (session.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background" role="status">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (session.isError) return null;

  return <>{children}</>;
}
