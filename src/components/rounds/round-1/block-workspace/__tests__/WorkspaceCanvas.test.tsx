import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { VisualBlock } from '../../../types';
import { WorkspaceCanvas, type WorkspaceCanvasProps } from '../WorkspaceCanvas';

const BLOCKS: VisualBlock[] = [
  { id: 'b1', content: 'Print "Hello"' },
  { id: 'b2', content: 'Print "World"' },
];

// Matches ScratchEngine's real sensor config — see BlockPalette.test.tsx for why.
function useTestSensors() {
  return useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
}

function renderCanvas(blocks: VisualBlock[], overrides: Partial<WorkspaceCanvasProps> = {}) {
  const onRemove = overrides.onRemove ?? vi.fn();
  const onMove = overrides.onMove ?? vi.fn();
  const onClear = overrides.onClear ?? vi.fn();

  function Wrapper() {
    const sensors = useTestSensors();
    return (
      <DndContext sensors={sensors} onDragEnd={() => {}}>
        <WorkspaceCanvas
          blocks={blocks}
          onRemove={onRemove}
          onMove={onMove}
          onClear={onClear}
          disabled={overrides.disabled}
        />
      </DndContext>
    );
  }

  const utils = render(<Wrapper />);
  return { ...utils, onRemove, onMove, onClear };
}

describe('WorkspaceCanvas', () => {
  it('shows the Figma empty-state copy when the chain is empty', () => {
    renderCanvas([]);
    expect(screen.getByText('Start building your chain')).toBeInTheDocument();
    expect(screen.getByText('Drag blocks and drop here')).toBeInTheDocument();
    expect(screen.getByText('Only one chain is allowed')).toBeInTheDocument();
  });

  it('hides Clear chain when the chain is empty', () => {
    renderCanvas([]);
    expect(screen.queryByRole('button', { name: 'Clear chain' })).not.toBeInTheDocument();
  });

  it('is labelled for assistive tech', () => {
    renderCanvas(BLOCKS);
    expect(screen.getByRole('region', { name: 'Your chain' })).toBeInTheDocument();
  });

  it('disables the boundary move buttons at the ends of the chain', () => {
    renderCanvas(BLOCKS);
    expect(screen.getByRole('button', { name: 'Move "Print "Hello"" up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move "Print "World"" down' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move "Print "Hello"" down' })).toBeEnabled();
  });

  it('calls onMove with the from/to indices', async () => {
    const user = userEvent.setup();
    const { onMove } = renderCanvas(BLOCKS);

    await user.click(screen.getByRole('button', { name: 'Move "Print "World"" up' }));

    expect(onMove).toHaveBeenCalledWith(1, 0);
  });

  it('calls onRemove with the block id', async () => {
    const user = userEvent.setup();
    const { onRemove } = renderCanvas(BLOCKS);

    await user.click(screen.getByRole('button', { name: 'Remove "Print "Hello"" from the chain' }));

    expect(onRemove).toHaveBeenCalledWith('b1');
  });

  it('calls onClear when Clear chain is clicked', async () => {
    const user = userEvent.setup();
    const { onClear } = renderCanvas(BLOCKS);

    await user.click(screen.getByRole('button', { name: 'Clear chain' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('disables every control when disabled', () => {
    renderCanvas(BLOCKS, { disabled: true });
    expect(screen.getByRole('button', { name: 'Clear chain' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Remove "Print "Hello"" from the chain' })
    ).toBeDisabled();
  });
});
