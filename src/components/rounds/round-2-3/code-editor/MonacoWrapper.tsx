'use client';

import { useState } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';

import { cn } from '@/lib/utils';

/**
 * Code Editor - MonacoWrapper
 *
 * Thin wrapper around @monaco-editor/react: the #131414 editor panel from
 * Figma `Desktop - 15/14` plus its "line: 3   column: 1" readout just below.
 * Keyboard users must be able to `Tab` out of the editor to reach the
 * toolbar/submit button — Monaco traps Tab by default, so `tabFocusMode` is
 * enabled on mount (see AGENTS.md a11y risk: "the single biggest a11y risk
 * in the feature").
 */
export interface MonacoWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  className?: string;
}

const THEME = 'cookoff-code';

// Monaco needs literal hex: its stock vs-dark ground (#1e1e1e) would show inside the #131414 panel.
const defineTheme: BeforeMount = monaco => {
  monaco.editor.defineTheme(THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#131414',
      'editorGutter.background': '#131414',
      'editor.lineHighlightBorder': '#00000000',
    },
  });
};

export function MonacoWrapper({
  value,
  onChange,
  language,
  readOnly,
  className,
}: MonacoWrapperProps) {
  const [position, setPosition] = useState({ line: 1, column: 1 });

  const handleMount: OnMount = editor => {
    editor.updateOptions({ tabFocusMode: true, accessibilitySupport: 'on' });
    editor.onDidChangeCursorPosition(event => {
      setPosition({ line: event.position.lineNumber, column: event.position.column });
    });
  };

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[10px] bg-code-panel">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={next => onChange(next ?? '')}
          beforeMount={defineTheme}
          onMount={handleMount}
          theme={THEME}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
            tabFocusMode: true,
            padding: { top: 10 },
          }}
        />
      </div>
      <p className="relative -mt-[3.4px] h-[30px] shrink-0 text-right font-sans text-[16px] leading-[30px] whitespace-pre text-code-sand">
        {`line: ${position.line}   column: ${position.column}`}
      </p>
    </div>
  );
}
