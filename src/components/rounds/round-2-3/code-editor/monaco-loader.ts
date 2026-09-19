'use client';

import { useEffect, useState } from 'react';
import { loader } from '@monaco-editor/react';

/**
 * `@monaco-editor/react` fetches Monaco from the jsdelivr CDN by default, so a
 * campus network that blocks or throttles it leaves every contestant without
 * an editor. This bundles the installed `monaco-editor` (served from our own
 * origin) and hands it to the loader instead. It is imported lazily, on the
 * client only, because Monaco touches `window` at import time.
 */
let ready: Promise<void> | null = null;

function loadLocalMonaco(): Promise<void> {
  ready ??= import('monaco-editor').then(monaco => {
    self.MonacoEnvironment = {
      getWorker(_workerId: string, label: string) {
        if (label === 'typescript' || label === 'javascript') {
          return new Worker(
            new URL('monaco-editor/language/typescript/ts.worker.js', import.meta.url),
            { type: 'module' }
          );
        }
        return new Worker(new URL('monaco-editor/editor/editor.worker.js', import.meta.url), {
          type: 'module',
        });
      },
    };
    loader.config({ monaco });
  });
  return ready;
}

/** `true` once the bundled Monaco is registered with the loader; render the editor after that. */
export function useMonacoReady(): boolean {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let active = true;
    loadLocalMonaco()
      .catch(() => {
        // Fall back to the loader's default (CDN) rather than no editor at all.
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return isReady;
}
