import { LoadingScreen } from '@/components/ui';

// Next.js App Router route-segment fallback, shown while a protected
// segment's bundle/data is loading (e.g. navigating between round pages).
export default function ProtectedLoading() {
  return <LoadingScreen />;
}
