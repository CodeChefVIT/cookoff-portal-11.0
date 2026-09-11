import type { VisualBlock } from '../../types';

/**
 * ROUND 1 - Workspace Canvas
 *
 * The drop-zone where the user assembles their ordered solution.
 * Maintains the ordered list of `uuid[]` for the final submission.
 * On submit, sends the ordered array to `POST /submit/visual`.
 */
export interface WorkspaceCanvasProps {
  /** Currently assembled/sorted blocks in the workspace. */
  blocks: VisualBlock[];
  /** Called whenever the user reorders or drops a block into the canvas. */
  onReorder: (next: VisualBlock[]) => void;
}

export function WorkspaceCanvas({ blocks, onReorder }: WorkspaceCanvasProps) {
  void blocks;
  void onReorder;
  // Drag and drop assembly area
  return <div className="workspace-canvas"></div>;
}
