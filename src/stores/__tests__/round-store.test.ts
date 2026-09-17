import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_LANGUAGE } from '@/components/rounds/round-2-3/languages';

import { DEFAULT_LANGUAGE_ID, useRoundStore } from '../round-store';

function reset() {
  useRoundStore.setState({ drafts: {} });
}

describe('useRoundStore', () => {
  beforeEach(reset);

  it('keeps drafts isolated per question id', () => {
    useRoundStore.getState().setSourceCode('q1', 'code for q1');
    useRoundStore.getState().setSourceCode('q2', 'code for q2');

    expect(useRoundStore.getState().getDraft('q1')?.sourceCode).toBe('code for q1');
    expect(useRoundStore.getState().getDraft('q2')?.sourceCode).toBe('code for q2');
  });

  it('replaces a pristine buffer with the new boilerplate on a language change', () => {
    useRoundStore.getState().resetDraft('q1', 54, 'cpp boilerplate');
    useRoundStore.getState().setLanguage('q1', 71, 'python boilerplate');

    expect(useRoundStore.getState().getDraft('q1')).toMatchObject({
      sourceCode: 'python boilerplate',
      languageId: 71,
    });
  });

  it('never discards a dirty buffer on a language change', () => {
    useRoundStore.getState().resetDraft('q1', 54, 'cpp boilerplate');
    useRoundStore.getState().setSourceCode('q1', 'my hand-written solution');
    useRoundStore.getState().setLanguage('q1', 71, 'python boilerplate');

    expect(useRoundStore.getState().getDraft('q1')?.sourceCode).toBe('my hand-written solution');
    expect(useRoundStore.getState().getDraft('q1')?.languageId).toBe(71);
  });

  it('persists custom input independently of source code', () => {
    useRoundStore.getState().setSourceCode('q1', 'code');
    useRoundStore.getState().setCustomInput('q1', '5\n10');

    expect(useRoundStore.getState().getDraft('q1')).toMatchObject({
      sourceCode: 'code',
      customInput: '5\n10',
    });
  });
});

describe('DEFAULT_LANGUAGE_ID', () => {
  // The store can't import from the component layer, so the constant is
  // duplicated. `0` is not a Judge0 language and `??` doesn't catch it, which
  // is how a draft could show C++ while submitting an invalid id.
  it('matches the editor default and is a real Judge0 id', () => {
    expect(DEFAULT_LANGUAGE_ID).toBe(DEFAULT_LANGUAGE.id);
    expect(DEFAULT_LANGUAGE_ID).toBeGreaterThan(0);
  });

  it('seeds a draft created by an edit before resetDraft with a valid language', () => {
    useRoundStore.getState().setSourceCode('q-unseeded', 'int main() {}');
    expect(useRoundStore.getState().drafts['q-unseeded'].languageId).toBe(DEFAULT_LANGUAGE_ID);
  });
});
