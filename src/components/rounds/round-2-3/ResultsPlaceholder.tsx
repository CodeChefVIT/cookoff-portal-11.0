export interface ResultsPlaceholderProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Pre-verdict state from Figma `Desktop - 15/14` (312:1110, 312:1134): a
 * 2px-blurred #131414 panel starting 26.9px below the results slot, with a
 * centred Roboto 17px line. Also carries the judging/timeout/error copy.
 */
export function ResultsPlaceholder({ message, onRetry }: ResultsPlaceholderProps) {
  return (
    <div role="status" aria-live="polite" className="relative h-full">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[26.9px] bottom-0 rounded-[10px] bg-code-panel blur-[2px]"
      />
      <div className="absolute inset-x-0 top-[51.92%] flex flex-col items-center gap-2 px-4 text-center">
        <p className="font-chip text-[17px] leading-[normal] font-normal text-white">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer font-chip text-[15px] font-normal text-code-sand underline"
          >
            Check again
          </button>
        )}
      </div>
    </div>
  );
}
