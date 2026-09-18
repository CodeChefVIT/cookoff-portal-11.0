import { createElement } from 'react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

// Monaco does not render under jsdom (AGENTS.md §16) — every test gets a
// controlled <textarea> stand-in so MonacoWrapper/CodeEngine stay testable
// without a real editor instance.
// The bundled Monaco is a browser-only import; the editor stand-in below needs none of it.
vi.mock('@/components/rounds/round-2-3/code-editor/monaco-loader', () => ({
  useMonacoReady: () => true,
}));

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
    onMount?.(
      {
        updateOptions: vi.fn(),
        onDidChangeCursorPosition: vi.fn(),
        // Paste guard hooks (MonacoWrapper); inert in the stand-in.
        getContainerDomNode: () => document.createElement('div'),
        onDidDispose: vi.fn(),
        onKeyDown: vi.fn(),
        onDidPaste: vi.fn(),
      },
      { editor: {}, KeyCode: { KeyC: 33, KeyX: 54 } }
    );
    return createElement('textarea', {
      'aria-label': 'Code editor',
      value,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value),
    });
  },
}));
