import { createElement } from 'react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

// Monaco does not render under jsdom (AGENTS.md §16) — every test gets a
// controlled <textarea> stand-in so MonacoWrapper/CodeEngine stay testable
// without a real editor instance.
vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    onChange,
    onMount,
  }: {
    value: string;
    onChange: (value: string) => void;
    onMount?: (editor: unknown, monaco: unknown) => void;
  }) => {
    onMount?.({ updateOptions: vi.fn(), onDidChangeCursorPosition: vi.fn() }, { editor: {} });
    return createElement('textarea', {
      'aria-label': 'Code editor',
      value,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value),
    });
  },
}));
