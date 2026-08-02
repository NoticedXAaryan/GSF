import { FESTIVAL_HIGHLIGHTS } from "@/lib/landing/content";

export function HighlightsSection() {
  return (
    <section
      id="highlights"
      aria-labelledby="highlights-title"
      className="bg-[#0d0d0f] bg-noise section-padding"
    >
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-accent">
            Festival experiences
          </p>
          <h2 id="highlights-title" className="font-bold text-white">
            Festival Highlights
          </h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-accent/40" />
          <p className="mt-6 text-lg text-white/60">
            Learn, compete, showcase your work, and meet the people building
            tomorrow&apos;s enterprises.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {FESTIVAL_HIGHLIGHTS.map((highlight, index) => {
            const Icon = highlight.icon;

            return (
              <article
                key={highlight.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-accent/30 hover:bg-white/8"
              >
                <span className="inline-flex rounded-xl bg-accent/10 p-3 text-accent">
                  <Icon
                    role="img"
                    aria-label={highlight.accessibleLabel}
                    size={28}
                  />
                </span>
                <h3 className="mt-6 font-bold text-white">{highlight.title}</h3>
                <p className="mt-3 text-white/60 leading-relaxed">{highlight.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
