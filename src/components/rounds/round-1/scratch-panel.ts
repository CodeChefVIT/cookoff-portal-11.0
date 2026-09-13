import { cva } from 'class-variance-authority';

/** The three Figma `scratch` panels: shared border + glow, per-panel gradient and corner radius. */
export const scratchPanelVariants = cva(
  'relative flex h-full min-h-0 flex-col border border-scratch-border bg-linear-to-b text-scratch-ink shadow-(--scratch-panel-shadow)',
  {
    variants: {
      tone: {
        question: 'rounded-none from-scratch-panel-q to-scratch-panel-end to-[69.712%]',
        chain: 'rounded-[20px] from-scratch-panel-chain to-scratch-panel-end to-[69.712%]',
        blocks: 'rounded-[20px] from-scratch-panel-blocks to-scratch-panel-end to-70%',
      },
    },
  }
);
