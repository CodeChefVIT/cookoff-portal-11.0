import type { StoreApi, UseBoundStore } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from './create-selectors';

interface QuestionDraft {
  sourceCode: string;
  languageId: number;
  customInput: string;
  /** Boilerplate the draft was seeded with — lets a language swap tell a pristine buffer from a dirty one. */
  boilerplateSourceCode: string;
}

interface RoundState {
  drafts: Record<string, QuestionDraft>;
  /** Questions whose bounty-unlock modal has already been resolved (entered or dismissed) this session. */
  bountyResolved: Record<string, boolean>;
  getDraft: (questionId: string) => QuestionDraft | undefined;
  setSourceCode: (questionId: string, sourceCode: string) => void;
  setCustomInput: (questionId: string, customInput: string) => void;
  /**
   * Language change: replaces the buffer with the new boilerplate only when
   * the current buffer is untouched (pristine) or empty; otherwise keeps the
   * user's code so a dirty buffer is never silently discarded.
   */
  setLanguage: (questionId: string, languageId: number, boilerplateSourceCode: string) => void;
  resetDraft: (questionId: string, languageId: number, boilerplateSourceCode: string) => void;
  resolveBounty: (questionId: string) => void;
}

const useRoundStoreBase = create<RoundState>()(
  persist(
    (set, get) => ({
      drafts: {},
      bountyResolved: {},
      getDraft: questionId => get().drafts[questionId],
      setSourceCode: (questionId, sourceCode) =>
        set(state => ({
          drafts: {
            ...state.drafts,
            [questionId]: { ...requireDraft(state, questionId), sourceCode },
          },
        })),
      setCustomInput: (questionId, customInput) =>
        set(state => ({
          drafts: {
            ...state.drafts,
            [questionId]: { ...requireDraft(state, questionId), customInput },
          },
        })),
      setLanguage: (questionId, languageId, boilerplateSourceCode) =>
        set(state => {
          const existing = state.drafts[questionId];
          const isPristine =
            !existing || existing.sourceCode.trim() === existing.boilerplateSourceCode.trim();
          return {
            drafts: {
              ...state.drafts,
              [questionId]: {
                sourceCode: isPristine ? boilerplateSourceCode : existing.sourceCode,
                languageId,
                customInput: existing?.customInput ?? '',
                boilerplateSourceCode,
              },
            },
          };
        }),
      resetDraft: (questionId, languageId, boilerplateSourceCode) =>
        set(state => ({
          drafts: {
            ...state.drafts,
            [questionId]: {
              sourceCode: boilerplateSourceCode,
              languageId,
              customInput: '',
              boilerplateSourceCode,
            },
          },
        })),
      resolveBounty: questionId =>
        set(state => ({ bountyResolved: { ...state.bountyResolved, [questionId]: true } })),
    }),
    { name: 'round-store' }
  )
) as unknown as UseBoundStore<StoreApi<RoundState>>;

function requireDraft(state: RoundState, questionId: string): QuestionDraft {
  return (
    state.drafts[questionId] ?? {
      sourceCode: '',
      languageId: 0,
      customInput: '',
      boilerplateSourceCode: '',
    }
  );
}

export const useRoundStore = createSelectors(useRoundStoreBase);

/** Non-reactive snapshot read, safe to call inside a `useState` lazy initializer. */
export function isBountyResolvedNow(questionId: string): boolean {
  return useRoundStoreBase.getState().bountyResolved[questionId] === true;
}
