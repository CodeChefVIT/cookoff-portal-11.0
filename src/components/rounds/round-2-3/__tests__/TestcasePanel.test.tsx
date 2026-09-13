import { render, screen } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it } from 'vitest';

import type { SubmissionVerdict } from '@/api';

import type { Testcase } from '../../types';
import { TestcasePanel } from '../TestcasePanel';

const visibleCase: Testcase = {
  id: 'tc1',
  questionId: 'q1',
  input: 'super-secret-visible-input',
  expectedOutput: 'super-secret-visible-output',
  memory: 256,
  runtime: 0.01,
  hidden: false,
};

const hiddenCase: Testcase = {
  id: 'tc2',
  questionId: 'q1',
  input: 'super-secret-hidden-input',
  expectedOutput: 'super-secret-hidden-output',
  memory: 256,
  runtime: 0.01,
  hidden: true,
};

const verdict: SubmissionVerdict = {
  submissionId: 'sub1',
  statusId: 4,
  testcasesPassed: 1,
  testcasesFailed: 1,
  results: [
    { testcaseId: 'tc1', hidden: false, passed: true, stdout: 'super-secret-visible-output' },
    {
      testcaseId: 'tc2',
      hidden: true,
      passed: false,
      stdout: 'a-hidden-actual-output-that-must-never-leak',
    },
  ],
  pointsAwarded: 0,
  alreadyAnswered: false,
};

function renderPanel(testcases: Testcase[]) {
  return render(<TestcasePanel testcases={testcases} verdict={verdict} isPolling={false} />, {
    wrapper: ({ children }) => <NuqsTestingAdapter>{children}</NuqsTestingAdapter>,
  });
}

describe('TestcasePanel — hidden testcase masking', () => {
  it('never renders a hidden case input, expected output, or actual stdout', () => {
    renderPanel([visibleCase, hiddenCase]);

    expect(screen.queryByText('super-secret-hidden-input')).not.toBeInTheDocument();
    expect(screen.queryByText('super-secret-hidden-output')).not.toBeInTheDocument();
    expect(screen.queryByText(/a-hidden-actual-output/)).not.toBeInTheDocument();
  });

  it('shows only the aggregate pass/fail count for hidden cases', () => {
    renderPanel([visibleCase, hiddenCase]);

    expect(screen.getByText(/Hidden Testcases/)).toBeInTheDocument();
  });

  it('still shows visible case content', () => {
    renderPanel([visibleCase, hiddenCase]);

    expect(screen.getByText('super-secret-visible-input')).toBeInTheDocument();
  });

  it('renders the verdict banner with pass/total counts', () => {
    renderPanel([visibleCase, hiddenCase]);

    expect(screen.getByText(/1\/2 Test Cases Passed/)).toBeInTheDocument();
  });
});
