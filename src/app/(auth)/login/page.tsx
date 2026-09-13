import Image from 'next/image';

import { LoginCard } from './login-card';

// The backend owns the whole OAuth dance: /auth/google → Google → its callback sets httpOnly cookies and redirects to FRONTEND_URL.
export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-login-bg p-6">
      <Image src="/login.svg" alt="" fill priority className="object-cover" sizes="100vw" />
      <LoginCard />
    </div>
  );
}
