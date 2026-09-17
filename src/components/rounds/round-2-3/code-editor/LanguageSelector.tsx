import Image from 'next/image';

import { cn } from '@/lib/utils';

import { LANGUAGES } from '../languages';

/**
 * Code Editor - LanguageSelector
 *
 * Dropdown for choosing the language of the submission. Maps to the
 * `language_id` in the backend `SubmissionRequest`. Figma `Desktop - 15/14`
 * picker: 159×27.12 white capsule, General Sans Medium 20px, mingcute chevron.
 */
export interface LanguageSelectorProps {
  value: number;
  onChange: (languageId: number) => void;
  className?: string;
}

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  return (
    <div className={cn('relative h-[27.12px] w-[159px] shrink-0', className)}>
      <label htmlFor="language-selector" className="sr-only">
        Language
      </label>
      <select
        id="language-selector"
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="size-full cursor-pointer appearance-none rounded-[10px] bg-white pl-[11px] font-general text-[20px] leading-[27.12px] font-medium text-black focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {LANGUAGES.map(language => (
          <option key={language.id} value={language.id}>
            {language.label}
          </option>
        ))}
      </select>
      <Image
        src="/code-round/chevron-down.svg"
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        unoptimized
        className="pointer-events-none absolute top-[4.68px] left-[126.41px] size-[20.004px]"
      />
    </div>
  );
}
