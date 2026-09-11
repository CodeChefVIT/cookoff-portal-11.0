import type { Question } from '../rounds/types';

/**
 * SHARED UI - Question Header
 *
 * Displays the title, description, points, and constraints of a question.
 * Data source: `QuestionResponse` from `GET /question/round`.
 */
export interface QuestionHeaderProps {
  /** Full question payload used to render the header metadata. */
  question: Question;
}

export function QuestionHeader({ question }: QuestionHeaderProps) {
  void question;
  return <div className="question-header"></div>;
}
