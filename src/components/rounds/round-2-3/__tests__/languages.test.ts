import { describe, expect, it } from 'vitest';

import { DEFAULT_LANGUAGE, getLanguageById, LANGUAGES } from '../languages';

describe('LANGUAGES', () => {
  it('has a unique Judge0 id per entry', () => {
    const ids = LANGUAGES.map(language => language.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a unique monaco id per entry', () => {
    const monacoIds = LANGUAGES.map(language => language.monacoId);
    expect(new Set(monacoIds).size).toBe(monacoIds.length);
  });

  it('every entry has non-empty boilerplate', () => {
    for (const language of LANGUAGES) {
      expect(language.boilerplate.length).toBeGreaterThan(0);
    }
  });
});

describe('getLanguageById', () => {
  it('returns the matching language', () => {
    expect(getLanguageById(71).label).toBe('Python');
  });

  it('falls back to the default language for an unknown id', () => {
    expect(getLanguageById(999999)).toBe(DEFAULT_LANGUAGE);
  });
});
