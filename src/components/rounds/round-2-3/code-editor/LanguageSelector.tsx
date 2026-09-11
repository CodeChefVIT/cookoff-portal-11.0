/**
 * Code Editor - LanguageSelector
 *
 * Dropdown for choosing the language of the submission.
 * Maps to the `language_id` in the backend `SubmissionRequest`.
 */
export interface LanguageSelectorProps {
  /** Current language id (Judge0 language_id number). */
  value: number;
  /** Called when the user selects a different language. */
  onChange: (languageId: number) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  void value;
  void onChange;
  return <div className="language-selector"></div>;
}
