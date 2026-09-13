import { Button } from '@/components/ui/button';

import { LanguageSelector } from './LanguageSelector';

/**
 * Code Editor - EditorToolbar
 *
 * Language selector + Reset, sitting above the editor surface. The
 * custom-input toggle and Run/Submit live in `EditorActions`, directly
 * below the editor — matching `design/Desktop - 14.svg`'s action row.
 */
export interface EditorToolbarProps {
  languageId: number;
  onLanguageChange: (languageId: number) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function EditorToolbar({
  languageId,
  onLanguageChange,
  onReset,
  disabled,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
      <LanguageSelector value={languageId} onChange={onLanguageChange} />
      <Button variant="ghost" size="sm" onClick={onReset} disabled={disabled}>
        Reset
      </Button>
    </div>
  );
}
