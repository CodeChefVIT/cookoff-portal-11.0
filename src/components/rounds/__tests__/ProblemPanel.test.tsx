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

const MARKDOWN_QUESTION: Question = {
  id: 'q2',
  title: 'Markdown Problem',
  description: '## Compiler Question\n\nWrite a **program** to read `two integers`.',
  inputFormat: ['First line contains integer `total_items`.'],
  outputFormat: ['Print the `result_value`.'],
  buyIn: '0',
  reward: '10',
  points: 20,
  round: 2,
  type: 'code',
  constraints: ['`1 <= total_items <= 10^5`'],
  sampleTestInput: ['5\n1 2 3 4 5'],
  sampleTestOutput: ['15'],
  explanation: ['The **sum** of elements is `computed_sum`.'],
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

describe('ProblemPanel — markdown rendering', () => {
  it('renders markdown heading, bold text, and inline code in description', () => {
    render(<ProblemPanel question={MARKDOWN_QUESTION} variant="code" />);

    const heading = screen.getByRole('heading', { level: 2, name: /compiler question/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-brand');

    expect(screen.getByText('program')).toBeInTheDocument();
    expect(screen.getByText('two integers')).toHaveClass('font-mono');
  });

  it('renders markdown in input and output formats', () => {
    render(<ProblemPanel question={MARKDOWN_QUESTION} variant="code" />);

    expect(screen.getByText('total_items')).toHaveClass('font-mono');
    expect(screen.getByText('result_value')).toHaveClass('font-mono');
  });

  it('renders markdown in constraints and sample explanation', () => {
    render(<ProblemPanel question={MARKDOWN_QUESTION} variant="code" />);

    expect(screen.getByText('1 <= total_items <= 10^5')).toHaveClass('font-mono');
    expect(screen.getByText('computed_sum')).toHaveClass('font-mono');
  });
});
