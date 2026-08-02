import { Check } from "lucide-react";

import { FESTIVAL_AUDIENCES } from "@/lib/landing/content";

/**
 * "Who it's for" grid — dark theme, matches footer aesthetic.
 */
export function AudienceSection() {
  return (
    <section
      id="audience"
      aria-labelledby="audience-title"
      className="bg-[#08080a] bg-noise section-padding"
    >
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-primary">
            Who it&apos;s for
          </p>
          <h2 id="audience-title" className="font-bold text-white">
            Built for Everyone Backing Ideas
          </h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-primary/40" />
          <p className="mt-6 text-lg text-white/60">
            Whether you are sketching your first idea or writing cheques, the
            festival is organized around what you came to get done.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {FESTIVAL_AUDIENCES.map((audience) => {
            const Icon = audience.icon;

            return (
              <article
                key={audience.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-primary/30"
              >
                <span className="inline-flex w-fit rounded-xl bg-primary/10 p-3 text-primary">
                  <Icon
                    role="img"
                    aria-label={audience.accessibleLabel}
                    size={24}
                  />
                </span>

                <h3 className="mt-6 font-bold text-white">{audience.title}</h3>
                <p className="mt-3 text-white/60">{audience.description}</p>

                <ul className="mt-6 space-y-2 border-t border-white/10 pt-4">
                  {audience.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2 text-sm font-semibold text-white/80"
                    >
                      <Check
                        aria-hidden="true"
                        size={16}
                        className="mt-1 shrink-0 text-accent"
                      />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
