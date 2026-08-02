import { FESTIVAL_HIGHLIGHTS } from "@/lib/landing/content";

export function HighlightsSection() {
  return (
    <section
      id="highlights"
      aria-labelledby="highlights-title"
      className="bg-surface-alt section-padding"
    >
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-secondary">
            Festival experiences
          </p>
          <h2 id="highlights-title" className="font-bold">Festival Highlights</h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-secondary/40" />
          <p className="mt-6 text-lg text-ink-muted">
            Learn, compete, showcase your work, and meet the people building
            tomorrow&apos;s enterprises.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {FESTIVAL_HIGHLIGHTS.map((highlight, index) => {
            const Icon = highlight.icon;
            // Cycle the logo's scarlet and badge blue across the grid.
            const isBlue = index % 2 === 1;

            return (
              <article
                key={highlight.id}
                className="group relative overflow-hidden rounded-md bg-surface p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-2 origin-top scale-y-0 transition-transform group-hover:scale-y-100 ${
                    isBlue ? "bg-secondary" : "bg-primary"
                  }`}
                />
                <span
                  className={`inline-flex rounded-pill p-3 ${
                    isBlue
                      ? "bg-secondary/10 text-secondary"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon
                    role="img"
                    aria-label={highlight.accessibleLabel}
                    size={28}
                  />
                </span>
                <h3 className="mt-6 font-bold">{highlight.title}</h3>
                <p className="mt-3 text-ink-muted">{highlight.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
