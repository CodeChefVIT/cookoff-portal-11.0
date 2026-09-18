import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { VisualBlock } from '../../types';
import { BlockPalette } from '../BlockPalette';

const BLOCKS: VisualBlock[] = [
  { id: 'b1', content: 'Print "Hello"' },
  { id: 'b2', content: 'Print "World"' },
];

// Matches ScratchEngine's real sensor config: a pointer-only sensor with a
// distance threshold. Without it, dnd-kit's *default* sensors (an
// undebounced PointerSensor plus a KeyboardSensor) swallow a plain click
// and hijack Enter/Space before our own tap-to-add handler ever runs.
function useTestSensors() {
  return useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
}

function renderPalette(blocks: VisualBlock[], onAdd = vi.fn()) {
  function Wrapper() {
    const sensors = useTestSensors();
    return (
      <DndContext sensors={sensors} onDragEnd={() => {}}>
        <BlockPalette blocks={blocks} onAdd={onAdd} />
      </DndContext>
    );
  }

  return { onAdd, ...render(<Wrapper />) };
}

describe('BlockPalette', () => {
  it('lists every available block as an activatable tile', () => {
    renderPalette(BLOCKS);
    expect(screen.getByRole('button', { name: 'Print "Hello"' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print "World"' })).toBeInTheDocument();
  });

  // The tray emptying does not mean the chain is correct — questions ship with
  // decoy blocks and the grader matches the solution exactly, length included.
  it('says the tray is empty without implying the chain is complete', () => {
    renderPalette([]);
    expect(screen.getByText(/No blocks left to place/)).toBeInTheDocument();
    expect(screen.getByText(/Not every block belongs in the answer/)).toBeInTheDocument();
    expect(screen.queryByText('Every block is in your chain.')).not.toBeInTheDocument();
  });

  it('is labelled for assistive tech', () => {
    renderPalette(BLOCKS);
    expect(screen.getByRole('region', { name: 'Available blocks' })).toBeInTheDocument();
  });

  it('calls onAdd with the tapped block id — the primary mobile/keyboard path', async () => {
    const user = userEvent.setup();
    const { onAdd } = renderPalette(BLOCKS);

    await user.click(screen.getByRole('button', { name: 'Print "Hello"' }));

    expect(onAdd).toHaveBeenCalledWith('b1');
  });

  it('appends on Enter as well as a click', async () => {
    const user = userEvent.setup();
    const { onAdd } = renderPalette(BLOCKS);

    screen.getByRole('button', { name: 'Print "World"' }).focus();
    await user.keyboard('{Enter}');

    expect(onAdd).toHaveBeenCalledWith('b2');
  });
});
