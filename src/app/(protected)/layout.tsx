import type { ReactNode } from 'react';

// PROTECTED GROUP - requires a valid session.
// TODO: Verify the session. Redirect to /login if the user is not authenticated.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <main className="protected">{children}</main>;
}
