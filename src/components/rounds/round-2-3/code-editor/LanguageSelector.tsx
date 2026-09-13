import { LANGUAGES } from '../languages';

/**
 * Code Editor - LanguageSelector
 *
 * Dropdown for choosing the language of the submission.
 * Maps to the `language_id` in the backend `SubmissionRequest`.
 */
export interface LanguageSelectorProps {
  value: number;
  onChange: (languageId: number) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-selector" className="sr-only">
        Language
      </label>
      <select
        id="language-selector"
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
      >
        {LANGUAGES.map(language => (
          <option key={language.id} value={language.id}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
}
