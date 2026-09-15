'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { logout } from '@/api';
import { CurrencyBox } from '@/components/ui/currency-box';

import { getRoundConfig } from './round-config';
import type { RoundId } from './types';

export interface RoundHeaderProps {
  roundId: RoundId;
  balance?: number;
  /** R1's Submit button — only rendered when `config.headerSubmit` is true. */
  headerAction?: ReactNode;
}

/**
 * Header chrome from Figma `Desktop - 15/14` (312:1101, 312:1216), placed at
 * the frame's exact pixels from `lg`: logo, Cinzel wordmark, currency block
 * (`hasCurrency` — Round 2 only) and the avatar, which doubles as log out.
 * Below `lg` it collapses to one compact row so it never scrolls at 320px.
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
    <header className="relative flex h-16 shrink-0 items-center justify-between gap-2 border-b-2 border-scratch-rule px-3 lg:block lg:h-[123px] lg:px-0">
      <div className="flex min-w-0 items-center gap-2">
        <Image
          src="/code-round/logo.png"
          alt="CodeChef-VIT"
          width={75}
          height={75}
          unoptimized
          priority
          className="size-11 shrink-0 object-cover lg:absolute lg:top-[24px] lg:left-[24px] lg:size-[75px]"
        />
        <span className="hidden font-wordmark text-[28px] leading-none font-black whitespace-nowrap text-code-brand sm:inline lg:absolute lg:top-[61px] lg:left-[119.5px] lg:-translate-y-1/2 lg:text-[length:min(90px,6.25vw)] lg:leading-[25.075px]">
          COOK OFF <span className="text-brand-accent">11.0</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {config.hasCurrency && balance !== undefined && (
          <CurrencyBox balance={balance} className="lg:absolute lg:top-[36px] lg:right-[125px]" />
        )}
        {config.headerSubmit && headerAction}
        <button
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="size-10 shrink-0 cursor-pointer rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-wait lg:absolute lg:top-[30px] lg:right-[32px] lg:size-[68px]"
        >
          <Image
            src="/code-round/avatar.svg"
            alt=""
            width={68}
            height={68}
            unoptimized
            className="size-full"
          />
        </button>
      </div>
    </header>
  );
}
