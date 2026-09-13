import type { ReactNode } from 'react';

import { SessionGuard } from '@/components/providers';

// PROTECTED GROUP - requires a valid session.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <main className="protected">
      <SessionGuard>{children}</SessionGuard>
    </main>
  );
}
