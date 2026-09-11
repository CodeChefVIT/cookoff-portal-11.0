import type { ReactNode } from 'react';

// AUTH GROUP - public, no auth required.
// Export a <Metadata> for the login page and share the centered auth layout here.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth">{children}</main>;
}
