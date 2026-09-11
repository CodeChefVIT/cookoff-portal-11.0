/**
 * Code Editor - EditorToolbar
 *
 * The top bar of the code editor.
 * Includes:
 * - Language Selector (Python/C/JS/etc)
 * - Run/Submit button
 * - Reset to default code
 */
export interface EditorToolbarProps {
  /** Selected language (monaco id). */
  language: string;
  /** Called when the user picks a different language. */
  onLanguageChange: (language: string) => void;
  /** Called when the user clicks the submit button. */
  onSubmit: () => void;
}

export function EditorToolbar({ language, onLanguageChange, onSubmit }: EditorToolbarProps) {
  void language;
  void onLanguageChange;
  void onSubmit;
  return <div className="editor-toolbar"></div>;
}
