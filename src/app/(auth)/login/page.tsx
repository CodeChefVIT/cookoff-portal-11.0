import Image from 'next/image';

import { LoginCard } from './login-card';

// The backend owns the whole OAuth dance: /auth/google → Google → its callback sets httpOnly
// cookies and redirects to FRONTEND_URL, or back here with `?error=<reason>` when it fails
// (`controllers/auth.go#loginFailed`).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-login-bg p-6">
      <Image src="/login.svg" alt="" fill priority className="object-cover" sizes="100vw" />
      <LoginCard error={typeof error === 'string' ? error : undefined} />
    </div>
  );
}
