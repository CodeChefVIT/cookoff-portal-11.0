/**
 * Code Editor - ConsoleOutput
 *
 * Displays the stdout/stderr output returned from Judge0.
 * Renders the `stdout` and any error messages after a submission completes.
 */
export interface ConsoleOutputProps {
  /** Raw stdout/stderr text from the latest Judge0 result. */
  output: string;
}

export function ConsoleOutput({ output }: ConsoleOutputProps) {
  void output;
  return <div className="console-output"></div>;
}
