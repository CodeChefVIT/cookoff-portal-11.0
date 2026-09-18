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
  /** The buffer for the selected language — what the editor shows and submits. */
  sourceCode: string;
  languageId: number;
  customInput: string;
  /** Last buffer per language id, so switching languages and back restores the code. */
  codeByLanguage: Record<number, string>;
}

interface RoundState {
  drafts: Record<string, QuestionDraft>;
  getDraft: (questionId: string) => QuestionDraft | undefined;
  setSourceCode: (questionId: string, sourceCode: string) => void;
  setCustomInput: (questionId: string, customInput: string) => void;
  /**
   * Language change: stashes the current buffer under the old language and
   * loads the new language's own buffer, or its boilerplate the first time.
   */
  setLanguage: (questionId: string, languageId: number, boilerplateSourceCode: string) => void;
  resetDraft: (questionId: string, languageId: number, boilerplateSourceCode: string) => void;
  /** Drops every question's draft — used when a different account signs in. */
  resetAll: () => void;
}

/**
 * v0 drafts kept one buffer for whichever language was selected; seed the
 * per-language map with it so nobody loses code on upgrade.
 */
export function migrateRoundStore(persisted: unknown, version: number): RoundState {
  const state = persisted as { drafts?: Record<string, Partial<QuestionDraft>> };
  if (version < 1 && state.drafts) {
    for (const draft of Object.values(state.drafts)) {
      draft.codeByLanguage ??=
        draft.languageId !== undefined && draft.sourceCode !== undefined
          ? { [draft.languageId]: draft.sourceCode }
          : {};
      delete (draft as { boilerplateSourceCode?: string }).boilerplateSourceCode;
    }
  }
  return state as RoundState;
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
            [questionId]: withSourceCode(requireDraft(state, questionId), sourceCode),
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
          if (existing?.languageId === languageId) return state;
          const codeByLanguage = existing
            ? { ...existing.codeByLanguage, [existing.languageId]: existing.sourceCode }
            : {};
          return {
            drafts: {
              ...state.drafts,
              [questionId]: {
                sourceCode: codeByLanguage[languageId] ?? boilerplateSourceCode,
                languageId,
                customInput: existing?.customInput ?? '',
                codeByLanguage,
              },
            },
          };
        }),
      resetAll: () => set({ drafts: {} }),
      resetDraft: (questionId, languageId, boilerplateSourceCode) =>
        set(state => ({
          drafts: {
            ...state.drafts,
            [questionId]: {
              sourceCode: boilerplateSourceCode,
              languageId,
              customInput: '',
              codeByLanguage: { [languageId]: boilerplateSourceCode },
            },
          },
        })),
    }),
    {
      name: 'round-store',
      version: 1,
      migrate: migrateRoundStore,
    }
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
      codeByLanguage: {},
    }
  );
}

function withSourceCode(draft: QuestionDraft, sourceCode: string): QuestionDraft {
  return {
    ...draft,
    sourceCode,
    codeByLanguage: { ...draft.codeByLanguage, [draft.languageId]: sourceCode },
  };
}

export const useRoundStore = createSelectors(useRoundStoreBase);
