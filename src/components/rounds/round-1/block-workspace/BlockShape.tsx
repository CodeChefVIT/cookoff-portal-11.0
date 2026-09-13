'use client';

import { cn } from '@/lib/utils';

import { stackBlockPath } from './block-shape';
import { useElementSize } from './use-element-size';

export interface BlockShapeProps {
  /** Brightens the outline (the drag preview). */
  highlighted?: boolean;
}

/**
 * The Scratch stack-block outline, drawn behind a block's content and sized
 * to it. The parent must be `relative isolate` and carry the `group` class.
 */
export function BlockShape({ highlighted }: BlockShapeProps) {
  const [ref, size] = useElementSize<HTMLSpanElement>();

  return (
    <span ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {size && (
        <svg width={size.width} height={size.height} className="absolute inset-0 overflow-visible">
          <path
            d={stackBlockPath(size.width, size.height)}
            strokeWidth={1.4}
            className={cn(
              'fill-scratch-block stroke-scratch-block-stroke transition-colors group-hover:stroke-scratch-border',
              highlighted && 'stroke-scratch-border'
            )}
          />
        </svg>
      )}
    </span>
  );
}
