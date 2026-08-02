import Image from "next/image";

import { prepareSponsorTiers, type Sponsor, type SponsorTier } from "@/lib/landing/content";

interface SponsorsSectionProps { tiers: readonly SponsorTier[] }

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const logo = (
    <Image src={sponsor.logo.src} width={sponsor.logo.width} height={sponsor.logo.height} alt={sponsor.logo.alt} loading="lazy" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="h-12 w-auto max-w-full object-contain" />
  );
  return sponsor.href ? <a href={sponsor.href} aria-label={`Visit ${sponsor.name}`}>{logo}</a> : logo;
}

export function SponsorsSection({ tiers }: SponsorsSectionProps) {
  const populatedTiers = prepareSponsorTiers(tiers);
  return (
    <section aria-labelledby="sponsors-title" className="bg-surface-alt section-padding">
      <div className="site-container">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-secondary">Our ecosystem</p>
          <h2 id="sponsors-title" className="font-bold">Sponsors and Partners</h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-secondary/40" />
          <p className="mt-6 text-lg text-ink-muted">Supported by organizations committed to entrepreneurship, innovation, and opportunity.</p>
        </header>
        <div className="mt-12 space-y-12">
          {populatedTiers.map((tier) => (
            <section key={tier.name} aria-labelledby={`sponsor-tier-${tier.name.replaceAll(" ", "-").toLowerCase()}`}>
              <h3 id={`sponsor-tier-${tier.name.replaceAll(" ", "-").toLowerCase()}`} className="font-bold">{tier.name}</h3>
              <ul className="mt-6 grid grid-cols-2 gap-4 tablet:grid-cols-3 tablet:gap-6 desktop:grid-cols-4">
                {tier.sponsors.map((sponsor) => (
                  <li key={sponsor.id} className="flex min-h-24 items-center justify-center rounded-md border border-surface-alt bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                    <SponsorLogo sponsor={sponsor} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
