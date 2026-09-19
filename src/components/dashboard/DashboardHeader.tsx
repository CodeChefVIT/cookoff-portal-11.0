interface Props {
  zoom: number | null;
}

// Wordmark + full-width rule, Figma 323:1997 / 323:2615. The wordmark hugs the
// right edge of the viewport (42px in, as in the frame) rather than the stage.
export function DashboardHeader({ zoom }: Props) {
  return (
    <header className="border-b-2 border-scratch-rule">
      <div
        className="flex h-[72px] items-center justify-end px-4 lg:h-[97px] lg:pr-[42px]"
        style={zoom === null ? undefined : { zoom }}
      >
        <h1 className="font-wordmark text-[36px] leading-[25.075px] font-black whitespace-nowrap text-code-brand sm:text-[56px] lg:mt-[17px] lg:text-[90px]">
          COOKOFF <span className="text-brand-accent">11</span>
        </h1>
      </div>
    </header>
  );
}
