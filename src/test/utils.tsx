import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { MotionProvider } from '@/components/motion';
import { useChainStore, useRoundStore } from '@/stores';

/**
 * Every round test needs the same provider stack. A fresh `QueryClient` per
 * render (with `retry: false`) avoids cross-test cache bleed and flaky
 * retries on the deliberately-erroring test fixtures.
 */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MotionProvider>{children}</MotionProvider>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper }) };
}

/** Clears persisted draft/bounty state between tests so one test never leaks into the next. */
export function resetRoundStore() {
  useRoundStore.setState({ drafts: {}, bountyResolved: {} });
}

/** Clears persisted chain state between tests so one test's chain never leaks into the next. */
export function resetChainStore() {
  useChainStore.setState({ chains: {} });
}
