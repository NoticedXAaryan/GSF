import { Check } from "lucide-react";

import { FESTIVAL_AUDIENCES } from "@/lib/landing/content";

/**
 * "Who it's for" grid. Alternates the logo's scarlet and badge blue across
 * cards so the brand pair carries the rhythm of the section.
 */
export function AudienceSection() {
  return (
    <section
      id="audience"
      aria-labelledby="audience-title"
      className="bg-canvas section-padding"
    >
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-primary">
            Who it&apos;s for
          </p>
          <h2 id="audience-title" className="font-bold">
            Built for Everyone Backing Ideas
          </h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-primary/40" />
          <p className="mt-6 text-lg text-ink-muted">
            Whether you are sketching your first idea or writing cheques, the
            festival is organized around what you came to get done.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          {FESTIVAL_AUDIENCES.map((audience, index) => {
            const Icon = audience.icon;
            const isBlue = index % 2 === 1;

            return (
              <article
                key={audience.id}
                className="flex flex-col rounded-md border border-surface-alt bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span
                  className={`inline-flex w-fit rounded-pill p-3 ${
                    isBlue
                      ? "bg-secondary/10 text-secondary"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon
                    role="img"
                    aria-label={audience.accessibleLabel}
                    size={24}
                  />
                </span>

                <h3 className="mt-6 font-bold">{audience.title}</h3>
                <p className="mt-3 text-ink-muted">{audience.description}</p>

                <ul className="mt-6 space-y-2 border-t border-surface-alt pt-4">
                  {audience.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2 text-sm font-semibold text-ink"
                    >
                      <Check
                        aria-hidden="true"
                        size={16}
                        className={`mt-1 shrink-0 ${
                          isBlue ? "text-secondary" : "text-primary"
                        }`}
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
