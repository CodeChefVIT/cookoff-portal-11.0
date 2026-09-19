import { render, screen } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it } from 'vitest';

import type { SubmissionVerdict } from '@/api';
import type { Testcase } from '@/types';

import { TestcasePanel } from '../TestcasePanel';

// `GET /question/:id/testcases/public` only ever returns visible cases —
// TestcasePanel receives exactly that list.
const visibleCase: Testcase = {
  id: 'tc1',
  questionId: 'q1',
  input: 'super-secret-visible-input',
  expectedOutput: 'super-secret-visible-output',
  memory: 256,
  runtime: 0.01,
  hidden: false,
};

// `dto.ResultResponse.testcases` covers every testcase for the question
// (public + hidden — the submission runs against all of them via
// GetAllTestCasesByQuestion). "tc2" has no matching entry in the public
// list above, so TestcasePanel must treat it as hidden by exclusion.
const verdict: SubmissionVerdict = {
  submissionId: 'sub1',
  questionId: 'q1',
  passed: 1,
  failed: 1,
  description: '1/2 testcases passed (Wrong Answer)',
  testcases: [
    { testcaseId: 'tc1', status: 'Success', description: 'Success' },
    { testcaseId: 'tc2', status: 'Wrong Answer', description: 'super-secret-hidden-detail' },
  ],
};

function renderPanel(testcases: Testcase[], panelVerdict: SubmissionVerdict = verdict) {
  return render(<TestcasePanel testcases={testcases} verdict={panelVerdict} />, {
    wrapper: ({ children }) => <NuqsTestingAdapter>{children}</NuqsTestingAdapter>,
  });
}

describe('TestcasePanel — hidden testcase masking', () => {
  it('never renders a hidden case input, expected output, or actual verdict detail', () => {
    renderPanel([visibleCase]);

    expect(screen.queryByText('super-secret-hidden-input')).not.toBeInTheDocument();
    expect(screen.queryByText('super-secret-hidden-output')).not.toBeInTheDocument();
    expect(screen.queryByText(/super-secret-hidden-detail/)).not.toBeInTheDocument();
  });

  it('shows only the aggregate pass/fail count for hidden cases', () => {
    renderPanel([visibleCase]);

    expect(screen.getByText('Hidden Testcases')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
  });

  it('still shows visible case content', () => {
    renderPanel([visibleCase]);

    expect(screen.getByText('super-secret-visible-input')).toBeInTheDocument();
  });

  it('renders the verdict banner with pass/total counts', () => {
    renderPanel([visibleCase]);

    expect(screen.getByText(/1\/2 Test Cases Passed/)).toBeInTheDocument();
    expect(screen.getByText('Compilation Successful !!')).toBeInTheDocument();
  });

  it('shows the compile-failure state when no testcase ran', () => {
    renderPanel([visibleCase], { ...verdict, passed: 0, failed: 0, testcases: [] });

    expect(screen.getByText(/0\/1 Test Cases Passed !!/)).toBeInTheDocument();
    expect(screen.getByText('Compilation Failed !!')).toBeInTheDocument();
  });
});

describe('TestcasePanel — participant output', () => {
  function withResult(result: SubmissionVerdict['testcases'][number]): SubmissionVerdict {
    return { ...verdict, testcases: [result] };
  }

  it("shows the program's stdout in the Output column", () => {
    renderPanel(
      [visibleCase],
      withResult({
        testcaseId: 'tc1',
        status: 'Wrong Answer',
        description: 'Wrong Answer',
        stdout: '-1294967296\n',
      })
    );

    expect(screen.getByText('-1294967296')).toBeInTheDocument();
    expect(screen.queryByText('Wrong Answer')).not.toBeInTheDocument();
  });

  it('keeps a runtime error visible beneath the printed output', () => {
    renderPanel(
      [visibleCase],
      withResult({
        testcaseId: 'tc1',
        status: 'Runtime Error (NZEC)',
        description: 'Exception in thread "main"',
        stdout: 'partial\n',
      })
    );

    expect(screen.getByText(/partial/)).toHaveTextContent(
      'partial Runtime Error (NZEC): Exception in thread "main"'
    );
  });

  it('falls back to the verdict status when there is no stdout', () => {
    renderPanel(
      [visibleCase],
      withResult({
        testcaseId: 'tc1',
        status: 'Compilation Error',
        description: 'Compilation Error',
      })
    );

    expect(screen.getByText('Compilation Error')).toBeInTheDocument();
  });

  it('never renders stdout for a hidden case', () => {
    renderPanel([visibleCase], {
      ...verdict,
      testcases: [
        { testcaseId: 'tc1', status: 'Success', description: 'Success', stdout: 'visible-out' },
        {
          testcaseId: 'tc2',
          status: 'Wrong Answer',
          description: '',
          stdout: 'super-secret-hidden-stdout',
        },
      ],
    });

    expect(screen.getByText('visible-out')).toBeInTheDocument();
    expect(screen.queryByText(/super-secret-hidden-stdout/)).not.toBeInTheDocument();
  });
});
