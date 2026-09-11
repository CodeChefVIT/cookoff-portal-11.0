import type { VisualBlock } from '../types';

/**
 * ROUND 1 - Block Palette
 *
 * Renders the list of available blocks for the question.
 * Data source: `GET /question/:id/blocks` -> `VisualBlockResponse[]`
 * Each block is draggable and must serialize its `id` (UUID) into the final submission.
 */
export interface BlockPaletteProps {
  /** The full list of blocks the user can drag from. */
  blocks: VisualBlock[];
}

export function BlockPalette({ blocks }: BlockPaletteProps) {
  void blocks;
  // Render the visual_blocks palette
  return <div className="block-palette"></div>;
}
