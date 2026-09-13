import { CAPABILITIES } from '@/api';
import { Button } from '@/components/ui/button';

import { LanguageSelector } from './LanguageSelector';

/**
 * Code Editor - EditorToolbar
 *
 * Language + custom-input toggle + Reset + Run (feature-flagged, L8) +
 * Submit, matching the action bar in Desktop - 15.png. Both button groups
 * wrap independently so the toolbar never causes horizontal page scroll on
 * narrow viewports (AGENTS.md §15).
 */
export interface EditorToolbarProps {
  languageId: number;
  onLanguageChange: (languageId: number) => void;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  customInputEnabled: boolean;
  onToggleCustomInput: () => void;
}

export function EditorToolbar({
  languageId,
  onLanguageChange,
  onSubmit,
  onReset,
  isSubmitting,
  disabled,
  customInputEnabled,
  onToggleCustomInput,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <LanguageSelector value={languageId} onChange={onLanguageChange} />
        <Button variant="ghost" size="sm" onClick={onReset} disabled={disabled}>
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={customInputEnabled}
          onClick={onToggleCustomInput}
        >
          <span className="sm:hidden">Custom Input</span>
          <span className="hidden sm:inline">Provide Custom Input</span>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!CAPABILITIES.runCode}
          title={
            CAPABILITIES.runCode
              ? undefined
              : 'Run Code is not available yet — the /runcode contract is undefined (see AGENTS.md L8).'
          }
        >
          Run Code
        </Button>
        <Button onClick={onSubmit} disabled={disabled || isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit Code'}
        </Button>
      </div>
    </div>
  );
}
