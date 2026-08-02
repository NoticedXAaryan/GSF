import {
  ABOUT_DESCRIPTION,
  FESTIVAL_ORGANIZERS,
  FESTIVAL_STATISTICS,
} from "@/lib/landing/content";

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-canvas section-padding">
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-primary">
            Our purpose
          </p>
          <h2 id="about-title" className="font-bold">About the Festival</h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-primary/40" />
          <p className="mt-6 text-lg text-ink-muted">{ABOUT_DESCRIPTION}</p>
        </header>

        {/* Organizers — numbered so the three-way partnership reads clearly */}
        <div className="mt-12 grid grid-cols-1 gap-6 desktop:grid-cols-3">
          {FESTIVAL_ORGANIZERS.map((organizer, index) => (
            <article
              key={organizer.name}
              className="relative overflow-hidden rounded-md border border-surface-alt bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-2 bg-primary"
              />
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary/10 text-sm font-extrabold text-primary"
                >
                  {index + 1}
                </span>
                <h3 className="font-bold">{organizer.name}</h3>
              </div>
              <p className="mt-4 text-ink-muted">{organizer.description}</p>
            </article>
          ))}
        </div>

        {/* Track record */}
        <div className="mt-12 overflow-hidden rounded-md bg-ink shadow-lg">
          <div className="px-6 py-8 tablet:px-12">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-surface/60">
              PIERC track record
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-8 desktop:grid-cols-4">
              {FESTIVAL_STATISTICS.map((statistic) => (
                <div key={statistic.label} className="text-center">
                  <dd className="text-3xl font-extrabold leading-none text-accent tablet:text-4xl">
                    {statistic.value}
                  </dd>
                  <dt className="mt-3 text-xs font-semibold uppercase tracking-widest text-surface/70">
                    {statistic.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
