import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

interface Props extends ComponentProps<'section'> {
  title: string;
  /** Figma gives each panel's gradient its own end stop, e.g. `to-[69.231%]`. */
  gradientStop: string;
  /** Profile and Statistics sit on a blurred glow layer; Details does not. */
  glow?: boolean;
}

// Panel chrome shared by Profile / Statistics / Details (Figma 323:1922, 323:1841, 323:1941).
export function DashboardPanel({
  title,
  gradientStop,
  glow,
  className,
  children,
  ...props
}: Props) {
  return (
    <section aria-label={title} className={cn('relative', className)} {...props}>
      {glow && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-[3.2px] rounded-[7px] border-2 border-scratch-border bg-dash-glow opacity-7 blur-[10px]"
        />
      )}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 rounded-[7px] border-2 border-scratch-border bg-linear-to-b from-code-page to-scratch-panel-end opacity-90',
          gradientStop
        )}
      />
      {children}
    </section>
  );
}

export function PanelHeading({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'font-login-display text-[40px] leading-normal tracking-[0.8px] text-dash-ink',
        className
      )}
      {...props}
    />
  );
}
