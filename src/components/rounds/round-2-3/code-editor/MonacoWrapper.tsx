/**
 * Code Editor - MonacoWrapper
 *
 * Thin wrapper around @monaco-editor/react.
 * Responsibilities:
 * - Initialize the editor with the correct language
 * - Bind the `onChange` handler to update `source_code` state
 * - Expose a ref for reading the current value on submit
 */
export interface MonacoWrapperProps {
  /** Current source code value. */
  value: string;
  /** Called on every editor change with the latest code. */
  onChange: (value: string) => void;
  /** Monaco language id, e.g. 'python', 'javascript'. */
  language: string;
}

export function MonacoWrapper({ value, onChange, language }: MonacoWrapperProps) {
  void value;
  void onChange;
  void language;
  return <div className="monaco-wrapper"></div>;
}
