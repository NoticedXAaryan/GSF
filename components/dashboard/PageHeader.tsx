/**
 * Shared dashboard page header.
 * Tiny wide-tracked eyebrow over an oversized tight-tracked title — the
 * typographic pairing used throughout the dashboard.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-1 pt-1">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-dim">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-4xl font-bold leading-none tracking-tighter lg:text-5xl text-fg">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-fg-dim">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
