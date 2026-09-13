import { buttonVariants } from '@/components/ui/button';
import { env } from '@/env';

// The backend owns the whole OAuth dance: /auth/google → Google → its callback sets httpOnly cookies and redirects to FRONTEND_URL.
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-scratch-bg p-6">
      <h1 className="font-wordmark text-5xl font-black text-brand">
        COOK OFF <span className="text-brand-accent">11.0</span>
      </h1>
      <a href={`${env.NEXT_PUBLIC_API_URL}/auth/google`} className={buttonVariants({ size: 'lg' })}>
        Sign in with Google
      </a>
    </div>
  );
}
