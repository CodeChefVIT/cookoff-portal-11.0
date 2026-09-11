import type { VisualBlock } from '../../types';

/**
 * ROUND 1 - Draggable Block
 *
 * A single draggable visual block from the palette.
 * Contains the `content` and its UUID `id`.
 */
export interface DraggableBlockProps {
  /** Block data rendered inside the draggable tile. */
  block: VisualBlock;
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  void block;
  return <div className="draggable-block"></div>;
}
