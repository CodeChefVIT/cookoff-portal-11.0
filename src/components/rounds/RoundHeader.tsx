'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { logout } from '@/api';
import { Button } from '@/components/ui/button';
import { CurrencyBox } from '@/components/ui/currency-box';

import { getRoundConfig } from './round-config';
import { RoundTimer } from './RoundTimer';

export interface RoundHeaderProps {
  roundId: 2 | 3;
  balance?: number;
}

/**
 * Header chrome from `src/figma/Desktop - 15.png`: wordmark, round badge +
 * timer, currency (config-gated), avatar/logout. R3's `minimalHud` drops the
 * currency pill per the product doc ("as minimal as possible"). Every piece
 * shrinks or hides its label below 640px so the header never causes
 * horizontal scroll at 320px (AGENTS.md §15).
 */
export function RoundHeader({ roundId, balance }: RoundHeaderProps) {
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
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <span className="shrink-0 font-display text-base tracking-wide text-brand sm:text-2xl">
          <span className="sm:hidden">CO</span>
          <span className="hidden sm:inline">COOK OFF 11.0</span>
        </span>
        <span className="hidden shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground sm:inline-block">
          {config.label}
        </span>
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
        <RoundTimer className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm" />
        {config.hasCurrency && balance !== undefined && (
          <CurrencyBox balance={balance} buyIn={0} reward={0} />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Log out"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </header>
  );
}
