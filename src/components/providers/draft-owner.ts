'use client';

import { useChainStore, useRoundStore } from '@/stores';

/**
 * `round-store` (R2/R3 code drafts) and `chain-store` (R1 block chains) persist
 * to `localStorage` keyed by question id alone, with no account in the key and
 * no reset on sign-out. On a shared lab machine the next contestant to open the
 * same question would find the previous one's solution already in the editor.
 *
 * Recording whose drafts these are, and wiping them when a different account
 * appears, keeps the per-question keying (which is what makes drafts survive a
 * reload) without letting them cross accounts.
 */
const OWNER_KEY = 'portal-draft-owner';

/** Reads the recorded owner, tolerating storage being unavailable or blocked. */
function readOwner(): string | null {
  try {
    return window.localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}

function writeOwner(userId: string): void {
  try {
    window.localStorage.setItem(OWNER_KEY, userId);
  } catch {
    // Private window or blocked storage — the drafts won't persist either, so
    // there is nothing to leak.
  }
}

/**
 * Clears persisted drafts when `userId` differs from the last account seen on
 * this browser. Returns true when a wipe happened.
 */
export function claimDraftsFor(userId: string): boolean {
  if (typeof window === 'undefined' || !userId) return false;

  const previous = readOwner();
  if (previous === userId) return false;

  writeOwner(userId);
  // A first-ever sign-in has no previous owner and nothing worth clearing.
  if (previous === null) return false;

  useRoundStore.getState().resetAll();
  useChainStore.getState().resetAll();
  return true;
}
