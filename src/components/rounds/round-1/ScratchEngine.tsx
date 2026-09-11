import type { VisualBlock } from '../types';

/**
 * ROUND 1 ENGINE - Entry point for the "Scratch" round.
 *
 * THIS FOLDER IS OWNED BY THE ROUND 1 TEAM.
 *
 * Responsibilities:
 * - Orchestrates <BlockPalette> + <BlockWorkspace>
 * - Handles submission via `POST /submit/visual`
 *   Request: { question_id, blocks: [uuid...] }
 *
 * It must be wrapped by <BuyInGate> and <RoundShell> (defined in the parent folder).
 */
export interface ScratchEngineProps {
  /** Question id used to fetch blocks via `GET /question/:id/blocks`. */
  questionId: string;
  /** Blocks returned by the backend for this question. */
  blocks: VisualBlock[];
}

export function ScratchEngine({ questionId, blocks }: ScratchEngineProps) {
  void questionId;
  void blocks;
  // Render <BlockPalette> and <BlockWorkspace>
  // Handle the submit flow
  return <div className="scratch-engine"></div>;
}
