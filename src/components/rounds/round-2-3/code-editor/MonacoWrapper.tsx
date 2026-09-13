'use client';

import { useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

/**
 * Code Editor - MonacoWrapper
 *
 * Thin wrapper around @monaco-editor/react. Keyboard users must be able to
 * `Tab` out of the editor to reach the toolbar/submit button — Monaco traps
 * Tab by default, so `tabFocusMode` is enabled on mount (see AGENTS.md a11y
 * risk: "the single biggest a11y risk in the feature").
 */
export interface MonacoWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

export function MonacoWrapper({ value, onChange, language, readOnly }: MonacoWrapperProps) {
  const [position, setPosition] = useState({ line: 1, column: 1 });

  const handleMount: OnMount = (editor, monaco) => {
    editor.updateOptions({ tabFocusMode: true, accessibilitySupport: 'on' });
    editor.onDidChangeCursorPosition(event => {
      setPosition({ line: event.position.lineNumber, column: event.position.column });
    });
    void monaco;
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={next => onChange(next ?? '')}
          onMount={handleMount}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
            tabFocusMode: true,
          }}
        />
      </div>
      <div className="border-t border-border px-3 py-1 text-right font-mono text-xs text-muted-foreground">
        line: {position.line} column: {position.column}
      </div>
    </div>
  );
}
