import {
  ABOUT_DESCRIPTION,
  FESTIVAL_ORGANIZERS,
  FESTIVAL_STATISTICS,
} from "@/lib/landing/content";

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-[#0d0d0f] bg-noise section-padding">
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-primary">
            Our purpose
          </p>
          <h2 id="about-title" className="font-bold text-white">About the Festival</h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-primary/40" />
          <p className="mt-6 text-lg text-white/60">{ABOUT_DESCRIPTION}</p>
        </header>

        {/* Organizers */}
        <div className="mt-12 grid grid-cols-1 gap-4 desktop:grid-cols-3">
          {FESTIVAL_ORGANIZERS.map((organizer, index) => (
            <article
              key={organizer.name}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-primary/30"
            >
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary"
                >
                  {index + 1}
                </span>
                <h3 className="font-bold text-white">{organizer.name}</h3>
              </div>
              <p className="mt-4 text-white/60">{organizer.description}</p>
            </article>
          ))}
        </div>

        {/* Track record */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="px-6 py-8 tablet:px-12">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-white/50">
              PIERC track record
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-8 desktop:grid-cols-4">
              {FESTIVAL_STATISTICS.map((statistic) => (
                <div key={statistic.label} className="text-center">
                  <dd className="text-3xl font-extrabold leading-none text-accent tablet:text-4xl">
                    {statistic.value}
                  </dd>
                  <dt className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/60">
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
