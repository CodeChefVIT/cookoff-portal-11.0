import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

// Motion showcase for development only; contestants never land here.
export default function MotionLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound();
  return children;
}
