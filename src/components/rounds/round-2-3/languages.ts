export interface LanguageOption {
  /** Judge0 CE `language_id`. VERIFY BEFORE CONTEST against the deployed Judge0 instance (L10) — a mismatch is a contest-day outage. */
  id: number;
  monacoId: string;
  label: string;
  boilerplate: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    id: 54,
    monacoId: 'cpp',
    label: 'C++',
    boilerplate: '#include <iostream>\n\nint main() {\n    \n    return 0;\n}\n',
  },
  {
    id: 50,
    monacoId: 'c',
    label: 'C',
    boilerplate: '#include <stdio.h>\n\nint main(void) {\n    \n    return 0;\n}\n',
  },
  {
    id: 62,
    monacoId: 'java',
    label: 'Java',
    boilerplate:
      'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n',
  },
  {
    id: 71,
    monacoId: 'python',
    label: 'Python',
    boilerplate: '\n',
  },
  {
    id: 63,
    monacoId: 'javascript',
    label: 'JavaScript',
    boilerplate: '\n',
  },
];

const LANGUAGE_BY_ID: Record<number, LanguageOption> = Object.fromEntries(
  LANGUAGES.map(language => [language.id, language])
);

export function getLanguageById(id: number): LanguageOption {
  return LANGUAGE_BY_ID[id] ?? LANGUAGES[0];
}

export const DEFAULT_LANGUAGE = LANGUAGES[0];
