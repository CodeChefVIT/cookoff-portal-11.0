import { cn } from '@/lib/utils';

/**
 * Shared full-viewport loading state (issue: "Loading Page"). No Figma
 * design was reachable for this issue (linked frame 403s unauthenticated) —
 * built from the app's existing tokens (wordmark, brand spinner) rather
 * than a confirmed mockup. Used both as a standalone route fallback
 * (`app/(protected)/loading.tsx`, `app/(auth)/loading.tsx`) and inline at
 * async boundaries that want the same look (`RoundGate`, `SessionGuard`).
 */
export interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ message = 'Loading…', className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col items-center justify-center gap-4 bg-background',
        className
      )}
      role="status"
    >
      <span className="font-display text-2xl tracking-wide text-brand">COOK OFF 11.0</span>
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-muted border-t-brand motion-reduce:animate-none"
      />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
