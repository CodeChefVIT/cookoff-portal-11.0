export interface ConsoleOutputProps {
  output: string;
  variant?: 'stdout' | 'stderr';
}

/** stdout/stderr/compile output, monospace, scrollable without widening the layout. */
export function ConsoleOutput({ output, variant = 'stdout' }: ConsoleOutputProps) {
  if (!output) return null;
  return (
    <pre
      className={`overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs break-words whitespace-pre-wrap ${
        variant === 'stderr' ? 'text-destructive' : 'text-secondary-foreground'
      }`}
    >
      {output}
    </pre>
  );
}
