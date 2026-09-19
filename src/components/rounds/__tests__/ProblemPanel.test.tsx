import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Question } from '@/types';

import { ProblemPanel } from '../ProblemPanel';

const QUESTION: Question = {
  id: 'q1',
  title: 'Sum of an Array',
  description: 'Given N integers, print their sum.',
  type: 'code',
  inputFormat: [],
  buyIn: '20',
  reward: '40',
  points: 10,
  round: 2,
  constraints: [],
  outputFormat: [],
  sampleTestInput: [],
  sampleTestOutput: [],
  explanation: [],
};

describe('ProblemPanel — copy protection', () => {
  it.each([
    ['copy', createEvent.copy],
    ['cut', createEvent.cut],
    ['contextmenu', createEvent.contextMenu],
    ['dragstart', createEvent.dragStart],
  ] as const)('cancels %s on the statement', (_, create) => {
    render(<ProblemPanel question={QUESTION} variant="code" />);
    const text = screen.getByText('Given N integers, print their sum.');

    const event = create(text);
    fireEvent(text, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('makes the statement unselectable', () => {
    render(<ProblemPanel question={QUESTION} variant="code" />);

    expect(screen.getByRole('region', { name: /sum of an array/i })).toHaveClass('select-none');
  });
});
