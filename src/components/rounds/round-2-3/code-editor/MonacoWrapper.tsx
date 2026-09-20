'use client';

import { useState } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { useMonacoReady } from './monaco-loader';

/**
 * Code Editor - MonacoWrapper
 *
 * Thin wrapper around @monaco-editor/react: the #131414 editor panel from
 * Figma `Desktop - 15/14` plus its "line: 3   column: 1" readout just below.
 * Tab indents, as participants expect in a code editor. Keyboard users can
 * still leave the editor: Monaco's built-in Ctrl+M (Ctrl+Shift+M on macOS)
 * toggles Tab into focus-moving mode, which screen readers announce.
 *
 * Pasting only accepts text that was copied or cut from this editor: code
 * brought in from outside (an AI tool, another site) is refused. Two layers,
 * because Monaco can take a paste by more than one route: the DOM `paste`
 * event is cancelled before Monaco inserts anything, and `onDidPaste` undoes
 * any external paste that arrived another way (e.g. the clipboard API). The
 * context menu and external drops are off as further ways around it. Like the
 * copy block on the problem statement, this raises the bar rather than being
 * airtight.
 */
export interface MonacoWrapperProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  className?: string;
}

const THEME = 'cookoff-code';

// Last text the editor put on the clipboard. Module state so code copied in one
// question can be pasted into another; a reload forgets it.
let lastInternalCopy: string | null = null;

// Whitespace-insensitive, so Monaco re-indenting a paste or a line-ending
// difference doesn't turn the contestant's own code into an "external" paste.
const normalize = (text: string) => text.replace(/\s+/g, '');

/** Only text copied out of an editor is pasteable back in. */
export function isInternalPaste(text: string): boolean {
  const pasted = normalize(text);
  return pasted === '' || (lastInternalCopy !== null && pasted === lastInternalCopy);
}

export function rememberInternalCopy(text: string) {
  lastInternalCopy = normalize(text);
}

function warnExternalPaste() {
  toast.error('Pasting from outside the editor is disabled.', { id: 'external-paste' });
}

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
  const monacoReady = useMonacoReady();

  const handleMount: OnMount = (editor, monaco) => {
    editor.updateOptions({ accessibilitySupport: 'on' });

    const container = editor.getContainerDomNode();
    // Bubble phase: Monaco has already filled clipboardData (including the
    // whole-line copy it does for an empty selection).
    const recordCopy = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text/plain');
      if (text) rememberInternalCopy(text);
    };
    container.addEventListener('copy', recordCopy);
    container.addEventListener('cut', recordCopy);
    container.addEventListener('paste', guardPaste);
    editor.onDidDispose(() => {
      container.removeEventListener('copy', recordCopy);
      container.removeEventListener('cut', recordCopy);
      container.removeEventListener('paste', guardPaste);
    });

    // Keyboard copy/cut, recorded straight from the model in case the copy
    // event above is skipped (an empty selection copies the whole line).
    editor.onKeyDown(event => {
      const isCopy =
        (event.ctrlKey || event.metaKey) &&
        (event.keyCode === monaco.KeyCode.KeyC || event.keyCode === monaco.KeyCode.KeyX);
      const model = editor.getModel();
      if (!isCopy || !model) return;
      const selections = editor.getSelections() ?? [];
      const text = selections.every(selection => selection.isEmpty())
        ? selections.map(selection => model.getLineContent(selection.startLineNumber)).join('\n')
        : selections.map(selection => model.getValueInRange(selection)).join('\n');
      rememberInternalCopy(text);
    });

    editor.onDidPaste(event => {
      const model = editor.getModel();
      if (!model || isInternalPaste(model.getValueInRange(event.range))) return;
      editor.trigger('paste-guard', 'undo', null);
      warnExternalPaste();
    });

    editor.onDidChangeCursorPosition(event => {
      setPosition({ line: event.position.lineNumber, column: event.position.column });
    });
  };

  const guardPaste = (event: ClipboardEvent) => {
    if (isInternalPaste(event.clipboardData?.getData('text/plain') ?? '')) return;
    event.preventDefault();
    event.stopPropagation();
    warnExternalPaste();
  };

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[10px] bg-code-panel">
        {monacoReady && (
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
              // When a language swap replaces the buffer, Monaco trims the
              // cursor line's indentation and reports it as a user edit — which
              // lands the old language's code in the new language's draft.
              trimAutoWhitespace: false,
              // See the component comment: both would bypass the paste guard.
              contextmenu: false,
              dropIntoEditor: { enabled: false },
              // The native EditContext input path can skip the DOM paste event;
              // the classic textarea always raises it for the guard above.
              editContext: false,
              padding: { top: 10 },
            }}
          />
        )}
      </div>
      <p className="relative -mt-[3.4px] h-[30px] shrink-0 text-right font-sans text-[16px] leading-[30px] whitespace-pre text-code-sand">
        {`line: ${position.line}   column: ${position.column}`}
      </p>
    </div>
  );
}
