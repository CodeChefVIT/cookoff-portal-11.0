'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { UserRound } from 'lucide-react';
import { toast } from 'sonner';

import { logout } from '@/api';
import { CurrencyBox } from '@/components/ui/currency-box';

import { getRoundConfig } from './round-config';
import { RoundTimer } from './RoundTimer';
import type { RoundId } from './types';

export interface RoundHeaderProps {
  roundId: RoundId;
  balance?: number;
  /** R1's Submit button — only rendered when `config.headerSubmit` is true. */
  headerAction?: ReactNode;
}

/**
 * Header chrome from `design/Desktop - 14.svg` through `- 22.svg`: hexagon
 * wordmark lockup, a joined `Round N | 00:11:52` pill, currency (config-
 * gated), and an avatar that doubles as the sign-out control (the design has
 * no separate logout affordance — an icon-only avatar button matches it
 * without dropping the feature). Every piece shrinks or hides its label
 * below 640px so the header never causes horizontal scroll at 320px
 * (AGENTS.md §15).
 */
export function RoundHeader({ roundId, balance, headerAction }: RoundHeaderProps) {
  const config = getRoundConfig(roundId);
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push('/login');
    },
    onError: () => {
      toast.error('Could not log out — please try again.');
      router.push('/login');
    },
  });

  return (
    <header className="flex items-center justify-between gap-1.5 overflow-hidden border-b border-hairline bg-background px-2 py-2 sm:gap-4 sm:px-6 sm:py-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Image
          src="/cc%203.svg"
          alt="CodeChef-VIT"
          width={36}
          height={36}
          unoptimized
          className="size-7 shrink-0 sm:size-9"
        />
        <span className="shrink-0 font-display text-lg tracking-wide text-brand sm:text-3xl">
          <span className="sm:hidden">CO</span>
          <span className="hidden sm:inline">COOK OFF 11.0</span>
        </span>
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
        <div className="flex items-center overflow-hidden rounded-full">
          <span className="bg-primary px-2 py-1 text-xs font-bold text-primary-foreground sm:px-3 sm:text-sm">
            {config.label}
          </span>
          <RoundTimer variant="joined" className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm" />
        </div>
        {config.hasCurrency && balance !== undefined && (
          <CurrencyBox balance={balance} buyIn={0} reward={0} />
        )}
        {config.headerSubmit && headerAction}
        <button
          type="button"
          aria-label="Log out"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary transition-opacity hover:opacity-80 disabled:opacity-50 sm:size-10"
        >
          <UserRound aria-hidden="true" className="size-4 sm:size-5" />
        </button>
      </div>
    </header>
  );
}
