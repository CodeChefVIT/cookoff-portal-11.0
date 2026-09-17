import type { StoreApi, UseBoundStore } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from './create-selectors';

/**
 * Judge0's C++ id, matching `DEFAULT_LANGUAGE` in
 * `components/rounds/round-2-3/languages.ts`. Duplicated rather than imported
 * to keep the store layer free of component imports; `round-store.test.ts`
 * asserts the two stay in step.
 */
export const DEFAULT_LANGUAGE_ID = 54;

interface QuestionDraft {
  sourceCode: string;
  languageId: number;
  customInput: string;
  /** Boilerplate the draft was seeded with — lets a language swap tell a pristine buffer from a dirty one. */
  boilerplateSourceCode: string;
}

interface RoundState {
  drafts: Record<string, QuestionDraft>;
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
}

const useRoundStoreBase = create<RoundState>()(
  persist(
    (set, get) => ({
      drafts: {},
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
    }),
    { name: 'round-store' }
  )
) as unknown as UseBoundStore<StoreApi<RoundState>>;

/**
 * `languageId: 0` used to be the placeholder here, but `0` is not a Judge0
 * language and `??` does not catch it — a draft created by an edit that landed
 * before `resetDraft` showed C++ in the selector while submitting `0`, which
 * `submissionRequestSchema` then rejected with an unexplainable error.
 */
function requireDraft(state: RoundState, questionId: string): QuestionDraft {
  return (
    state.drafts[questionId] ?? {
      sourceCode: '',
      languageId: DEFAULT_LANGUAGE_ID,
      customInput: '',
      boilerplateSourceCode: '',
    }
  );
}

export const useRoundStore = createSelectors(useRoundStoreBase);
