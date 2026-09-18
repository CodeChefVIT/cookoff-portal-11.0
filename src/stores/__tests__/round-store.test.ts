import { beforeEach, describe, expect, it } from 'vitest';

import { useRoundStore } from '../round-store';

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
