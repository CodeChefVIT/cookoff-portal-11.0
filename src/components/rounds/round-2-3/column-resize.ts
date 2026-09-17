/** Figma `Desktop - 15/14` puts a 23px gutter between the problem and editor columns; it doubles as the drag handle. */
export const WORKSPACE_GUTTER_PX = 23;

/** The problem panel can't be dragged narrower than this and still read as prose. */
export const MIN_PROBLEM_PX = 320;

/** Nor the editor column — Monaco, the toolbar and the results panel below it still need room. */
export const MIN_EDITOR_COLUMN_PX = 420;

/**
 * Problem | editor fractions after dragging the divider between them by
 * `deltaPx`, given both columns' pixel widths when the drag started. Their
 * combined share is preserved and each keeps its minimum.
 */
export function resizeColumns(
  columns: readonly number[],
  problemPx: number,
  editorPx: number,
  deltaPx: number
): number[] {
  const problem = columns[0];
  const editor = columns[1];
  const totalPx = problemPx + editorPx;
  if (
    problem === undefined ||
    editor === undefined ||
    totalPx <= MIN_PROBLEM_PX + MIN_EDITOR_COLUMN_PX
  ) {
    return [...columns];
  }

  const nextProblemPx = Math.min(
    Math.max(problemPx + deltaPx, MIN_PROBLEM_PX),
    totalPx - MIN_EDITOR_COLUMN_PX
  );
  const pair = problem + editor;
  const nextProblem = (pair * nextProblemPx) / totalPx;
  return [nextProblem, pair - nextProblem];
}

/**
 * `grid-template-columns` for the workspace: the two panel tracks either side
 * of the fixed gutter the resizer sits in. Inline rather than a utility class
 * because `WorkspaceLayout` and the question tabs `QuestionWorkspace` overlays
 * on top of it have to stay on the same tracks while the divider moves.
 */
export function workspaceGridTemplate(columns: readonly number[]): string {
  return columns.map(fraction => `minmax(0, ${fraction}fr)`).join(` ${WORKSPACE_GUTTER_PX}px `);
}

/** Where the divider sits across the workspace, 0–100, for `aria-valuenow`. */
export function dividerPosition(columns: readonly number[]): number {
  const total = columns.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return 0;
  return Math.round(((columns[0] ?? 0) / total) * 100);
}
