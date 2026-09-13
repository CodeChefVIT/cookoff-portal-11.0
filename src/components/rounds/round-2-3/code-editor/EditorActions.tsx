import { CAPABILITIES } from '@/api';
import { Button } from '@/components/ui/button';

/**
 * Code Editor - EditorActions
 *
 * Custom-input toggle + Run (feature-flagged, L8) + Submit, sitting directly
 * below the editor surface — matching the action row in
 * `design/Desktop - 14.svg` (below the Monaco panel, above the results
 * panel), not above it. `EditorToolbar` (language + Reset) stays above the
 * editor since the design's language dropdown lives in the round/tab row,
 * closer to that vertical position than to this action row.
 */
export interface EditorActionsProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  customInputEnabled: boolean;
  onToggleCustomInput: () => void;
}

export function EditorActions({
  onSubmit,
  isSubmitting,
  disabled,
  customInputEnabled,
  onToggleCustomInput,
}: EditorActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
      <Button
        variant="outline"
        size="sm"
        aria-pressed={customInputEnabled}
        onClick={onToggleCustomInput}
      >
        <span className="sm:hidden">Custom Input</span>
        <span className="hidden sm:inline">Provide Custom Input</span>
      </Button>
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
