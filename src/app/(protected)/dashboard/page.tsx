'use client';

import Link from 'next/link';

import { useSession } from '@/components/rounds/hooks';

const ROUNDS = [
  { id: 1, name: 'Round 1', href: '/round/1' },
  { id: 2, name: "Round 2 — Chef's Pantry", href: '/round/2' },
  { id: 3, name: 'Round 3 — the Crucible', href: '/round/3' },
] as const;

// Landing page after login. Cards link to every round the user has qualified
// for (users.round_qualified). Round unlock is still enforced server-side by
// each round's RoundGate — this page is presentation only.
export default function DashboardPage() {
  const session = useSession();

  if (session.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  const roundQualified = session.data?.roundQualified ?? 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="font-display text-3xl text-brand">COOK OFF 11.0</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Score: {session.data?.score ?? 0} · Balance: {session.data?.balance ?? 0} coins
        </p>
      </div>
      <div className="grid gap-3">
        {ROUNDS.map(round => {
          const qualified = roundQualified >= round.id;
          return qualified ? (
            <Link
              key={round.id}
              href={round.href}
              className="rounded-2xl border border-border bg-card p-4 text-card-foreground transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
            >
              {round.name}
            </Link>
          ) : (
            <div
              key={round.id}
              aria-disabled="true"
              className="rounded-2xl border border-border bg-card/40 p-4 text-muted-foreground"
            >
              {round.name} — not yet qualified
            </div>
          );
        })}
      </div>
    </div>
  );
}
