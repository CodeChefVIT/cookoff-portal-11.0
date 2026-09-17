'use client';

import { useSyncExternalStore } from 'react';

export const STAGE_WIDTH = 1440;
// Frame is 1024px tall: a 97px header row + 2px rule + the 925px stage. The
// rule is a real border and never zooms, so it's taken off before dividing.
const ZOOMED_HEIGHT = 1022;
const RULE_HEIGHT = 2;
const LG_QUERY = '(min-width: 1024px)';

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function getZoom() {
  if (!window.matchMedia(LG_QUERY).matches) return null;
  const { clientWidth, clientHeight } = document.documentElement;
  return Math.min(clientWidth / STAGE_WIDTH, (clientHeight - RULE_HEIGHT) / ZOOMED_HEIGHT);
}

/**
 * From `lg` the dashboard is the Figma frame scaled to fit the viewport in
 * both axes, so it never scrolls. `null` below `lg` (sections stack) and on
 * the server.
 */
export function useStageZoom(): number | null {
  return useSyncExternalStore(subscribe, getZoom, () => null);
}
