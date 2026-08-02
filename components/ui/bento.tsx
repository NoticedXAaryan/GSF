import { cn } from '@/lib/utils';

/**
 * Bento design system primitives.
 *
 * Visual language: near-black (or near-white) canvas, content lives in discrete
 * rounded blocks. The accent tones have been updated to match the official brand
 * logo (Primary Red and Secondary Blue), maintaining readability with text-surface.
 */

export type Tone = 'panel' | 'lime' | 'volt' | 'magenta' | 'azure' | 'inverse';

/** Background + foreground pairing for each tone. */
const toneSurface: Record<Tone, string> = {
  panel: 'bg-panel text-fg border border-line',
  lime: 'bg-primary text-surface', // Primary Brand (Red)
  volt: 'bg-secondary text-surface', // Secondary Brand (Blue)
  magenta: 'bg-primary-strong text-surface', // Darker Red
  azure: 'bg-secondary text-surface', // Blue
  inverse: 'bg-inverse text-on-inverse',
};

/** Muted/secondary text colour that stays legible on each tone. */
const toneMuted: Record<Tone, string> = {
  panel: 'text-fg-dim',
  lime: 'text-surface/70',
  volt: 'text-surface/70',
  magenta: 'text-surface/70',
  azure: 'text-surface/70',
  inverse: 'text-on-inverse/60',
};

/** Hairline colour that reads correctly on each tone. */
const toneHairline: Record<Tone, string> = {
  panel: 'bg-line',
  lime: 'bg-surface/20',
  volt: 'bg-surface/20',
  magenta: 'bg-surface/20',
  azure: 'bg-surface/20',
  inverse: 'bg-on-inverse/15',
};

export function toneTextMuted(tone: Tone) {
  return toneMuted[tone];
}

interface BentoCardProps {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  /** Stagger index for the entrance animation. */
  index?: number;
}

/** A single block in the bento grid. */
export function BentoCard({
  tone = 'panel',
  className,
  children,
  index = 0,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-bento p-5 animate-tile-in',
        toneSurface[tone],
        className
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      {children}
    </div>
  );
}

/** Tiny uppercase wide-tracked label — the workhorse of this design. */
export function Eyebrow({
  tone = 'panel',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'text-[10px] font-semibold uppercase tracking-[0.14em]',
        toneMuted[tone],
        className
      )}
    >
      {children}
    </p>
  );
}

/** Oversized bold numeral / short value. */
export function Metric({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn('text-3xl font-bold leading-none tracking-tight', className)}>
      {children}
    </p>
  );
}

/** Thin hairline divider tuned to the surrounding tone. */
export function Hairline({ tone = 'panel', className }: { tone?: Tone; className?: string }) {
  return <div className={cn('h-px w-full', toneHairline[tone], className)} />;
}

/** Progress bar. On accent tones the track is a translucent white wash. */
export function ProgressBar({
  value,
  tone = 'panel',
  className,
  label,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const isAccent = tone !== 'panel' && tone !== 'inverse';

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'h-2 w-full overflow-hidden rounded-full',
          isAccent ? 'bg-surface/20' : tone === 'inverse' ? 'bg-on-inverse/20' : 'bg-panel-alt'
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${pct} percent complete`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            isAccent ? 'bg-surface' : tone === 'inverse' ? 'bg-on-inverse' : 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Decorative sparkline built from a normalised series. */
export function Sparkline({
  data,
  tone = 'panel',
  className,
  height = 44,
}: {
  data: number[];
  tone?: Tone;
  className?: string;
  height?: number;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const width = 100;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / span) * (height - 6) - 3;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const isAccent = tone !== 'panel' && tone !== 'inverse';
  const stroke = isAccent ? 'currentColor' : undefined;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        className={isAccent ? 'text-surface/70' : 'stroke-primary'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Mini bar chart, used for the "results" style tiles. */
export function MiniBars({
  data,
  tone = 'panel',
  className,
}: {
  data: number[];
  tone?: Tone;
  className?: string;
}) {
  const max = Math.max(...data, 1);
  const isAccent = tone !== 'panel' && tone !== 'inverse';

  return (
    <div className={cn('flex h-12 items-end gap-1', className)} aria-hidden="true">
      {data.map((d, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 rounded-sm',
            isAccent ? 'bg-surface/70' : tone === 'inverse' ? 'bg-on-inverse/70' : 'bg-primary'
          )}
          style={{ height: `${Math.max(8, (d / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

/** Small circular icon chip that sits in a card corner. */
export function IconChip({
  tone = 'panel',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  const isAccent = tone !== 'panel' && tone !== 'inverse';
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        isAccent
          ? 'bg-surface/20 text-surface'
          : tone === 'inverse'
            ? 'bg-on-inverse/12 text-on-inverse'
            : 'bg-panel-alt text-fg',
        className
      )}
    >
      {children}
    </span>
  );
}

/** Pill-shaped status chip. */
export function Chip({
  tone = 'panel',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  const isAccent = tone !== 'panel' && tone !== 'inverse';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight',
        isAccent
          ? 'bg-surface/20 text-surface'
          : tone === 'inverse'
            ? 'bg-on-inverse/15 text-on-inverse'
            : 'bg-panel-alt text-fg-dim',
        className
      )}
    >
      {children}
    </span>
  );
}
