import Image from 'next/image';

export interface SubmissionErrorCardProps {
  open: boolean;
  onClose: () => void;
  /** Replaces the generic copy when the server said something specific. */
  message?: string;
}

/**
 * Submit / result-fetch failure card from Figma `Desktop - 18` (323:1622):
 * a 446×111.36 `#7f1d1d` card with a 1px `#ef4444` border, pinned top-right
 * over the header while the current verdict stays visible underneath.
 * Offsets are the frame's, less the 1px border; the message is in normal
 * flow so the card can grow on narrow phones, and matches the frame from `sm`.
 */
export function SubmissionErrorCard({ open, onClose, message }: SubmissionErrorCardProps) {
  if (!open) return null;

  return (
    <div
      role="alert"
      className="fixed top-[35px] right-4 z-[60] min-h-[111.36px] w-[446px] max-w-[calc(100vw-2rem)] border border-code-error-border bg-code-error-bg text-white sm:right-[29px]"
    >
      <Image
        src="/code-round/error.png"
        alt=""
        width={100}
        height={100}
        unoptimized
        className="absolute top-[-2.58px] left-[-1px] size-[100px] max-w-none"
      />
      <p className="absolute top-[6.83px] left-[126.98px] font-sans text-[24px] leading-[25.075px] font-bold whitespace-nowrap">
        Submission Failed
      </p>
      <p className="mr-3 ml-[110px] pt-[46.42px] pb-3 font-sans text-[16px] leading-[25.075px] font-normal sm:mr-0 sm:w-[337px] sm:pb-0">
        {message ?? (
          <>
            An unexpected error occurred while running <br className="hidden sm:inline" />
            your code. Please try again later.
          </>
        )}
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute top-[-1px] right-[-1px] h-[30.21px] w-[31.86px] cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Image
          src="/code-round/multiply.png"
          alt=""
          fill
          unoptimized
          className="pointer-events-none object-contain"
        />
      </button>
    </div>
  );
}
