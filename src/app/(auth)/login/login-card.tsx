import Image from 'next/image';
import { Sparkle } from 'lucide-react';

import { env } from '@/env';

// Figma `Qc0hMJFVUSxi6jsnhx54Vk`, nodes 352:459 + 352:394 — the card composed
// on top of the 352:499 background. Only "Sign in with Google" is kept —
// the mock's account-chooser row and LOGIN button had no backing data or
// action (the backend's only auth path is this one redirect), so they were
// dropped rather than shipped as dead UI.
export function LoginCard() {
  return (
    <div className="relative w-full max-w-[41rem]">
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl border-2 border-scratch-rule bg-scratch-border/7 blur-[10px]"
      />
      <div className="relative flex flex-col items-center gap-5 rounded-2xl border-2 border-scratch-rule bg-gradient-to-b from-scratch-timer-from to-scratch-panel-end px-[10%] py-7 sm:py-8">
        <div className="flex h-[108px] w-[121px] items-center justify-center">
          <div className="-scale-y-100 rotate-[-165.8deg] skew-x-[-3.94deg]">
            <Image src="/login-logo.svg" width={96} height={89} alt="" />
          </div>
        </div>

        <h1 className="font-login-display text-4xl tracking-[0.02em] text-scratch-ink sm:text-[64px]">
          COOKOFF 11
        </h1>

        <div className="flex w-full items-center gap-4">
          <span className="h-px flex-1 bg-scratch-rule/70" />
          <Sparkle className="size-3 shrink-0 text-[#b7ab98]" fill="currentColor" />
          <span className="h-px flex-1 bg-scratch-rule/70" />
        </div>

        <a
          href={`${env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="flex h-[61px] w-full items-center justify-center gap-3 rounded-[20px] border border-[#dadce0] bg-white px-4 font-login-body text-lg font-medium text-[#3c4043] transition-opacity hover:opacity-90"
        >
          <Image src="/google-icon.svg" width={24} height={24} alt="" />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
