import { describe, expect, it } from 'vitest';

import { isInternalPaste, rememberInternalCopy } from '../code-editor/MonacoWrapper';

// One sequence: the last-copy record is module state shared by every editor.
describe('editor paste guard', () => {
  it('refuses any paste before something was copied from the editor', () => {
    expect(isInternalPaste('print("from chatgpt")')).toBe(false);
  });

  it('lets an empty paste through', () => {
    expect(isInternalPaste('')).toBe(true);
    expect(isInternalPaste('  \n')).toBe(true);
  });

  it('accepts text copied from the editor, even re-indented or with CRLF', () => {
    rememberInternalCopy('int main() {\n    return 0;\n}');

    expect(isInternalPaste('int main() {\n    return 0;\n}')).toBe(true);
    expect(isInternalPaste('int main() {\r\n        return 0;\r\n}')).toBe(true);
  });

  it('refuses text that differs from the last editor copy', () => {
    expect(isInternalPaste('int main() { return 1; }')).toBe(false);
  });

  it('only remembers the latest copy', () => {
    rememberInternalCopy('long sum = 0;');

    expect(isInternalPaste('long sum = 0;')).toBe(true);
    expect(isInternalPaste('int main() {\n    return 0;\n}')).toBe(false);
  });
});
