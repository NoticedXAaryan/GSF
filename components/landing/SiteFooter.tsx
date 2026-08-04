import Link from "next/link";
import { Instagram, Twitter, Linkedin, Mail, MapPin } from "lucide-react";

const QUICK_LINKS = [
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Register", href: "/signup" },
  { label: "Login", href: "/login" },
] as const;

const SOCIALS = [
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-primary-strong bg-noise px-4 py-8 tablet:px-8 desktop:py-16">
      <div className="site-container">
        <div className="relative overflow-hidden rounded-md bg-canvas bg-noise shadow-lg">
          <div className="px-6 pt-12 pb-8 tablet:px-12 desktop:pt-16">
            {/* Three content columns */}
            <div className="grid grid-cols-1 gap-8 tablet:grid-cols-3 tablet:gap-12">
              {/* Brand */}
              <div className="flex flex-col items-start">
                <h2 className="sr-only">Goa Startup Festival 2026</h2>
                <Link href="/" className="inline-block" aria-label="Goa Startup Festival Home">
                  <img 
                    src="/logo.png" 
                    alt="Goa Startup Festival 2026 Logo" 
                    className="h-16 w-auto object-contain"
                  />
                </Link>
                <p className="mt-6 text-ink-muted">
                  A two-day entrepreneurship and innovation festival bringing
                  founders, investors, mentors, and students together in South
                  Goa.
                </p>
                <p className="mt-4 text-sm font-semibold text-ink">
                  Jointly organized by PIERC, Parul University &amp; PU Goa
                </p>
              </div>

              {/* Quick links */}
              <nav aria-label="Quick Links">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink">
                  Quick Links
                </h3>
                <ul className="mt-6 space-y-3 text-ink-muted">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink">
                  Get in Touch
                </h3>
                <ul className="mt-6 space-y-3 text-ink-muted">
                  <li>
                    <a
                      href="mailto:ecell@goa.paruluniversity.ac.in"
                      className="inline-flex items-start gap-2 transition-colors hover:text-primary"
                    >
                      <Mail aria-hidden="true" size={16} className="mt-1 shrink-0" />
                      <span className="break-all">
                        ecell@goa.paruluniversity.ac.in
                      </span>
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin aria-hidden="true" size={16} className="mt-1 shrink-0" />
                    <span>
                      <span className="block font-semibold text-ink">
                        Parul University Goa
                      </span>
                      <span className="block">Betul, South Goa</span>
                    </span>
                  </li>
                </ul>

                <ul className="mt-6 flex gap-3">
                  {SOCIALS.map((social) => {
                    const Icon = social.icon;
                    return (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          aria-label={social.label}
                          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-pill border border-surface-alt bg-surface text-primary shadow-sm transition-colors hover:bg-primary hover:text-surface"
                        >
                          <Icon aria-hidden="true" size={18} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Registration prompt */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-md border border-surface-alt bg-surface p-6 shadow-sm tablet:flex-row">
              <div>
                <p className="font-bold text-ink">Registration is open</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Secure your spot for the 2026 edition.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-flex min-h-touch min-w-touch w-full items-center justify-center rounded-md bg-primary px-8 py-3 font-bold text-surface transition-colors hover:bg-primary-strong tablet:w-auto"
              >
                Register Now
              </Link>
            </div>

            <div className="mt-12 h-px w-full bg-surface-alt" />

            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-ink-muted tablet:flex-row tablet:justify-between">
              <p>© 2026 Goa Startup Festival. All rights reserved.</p>
              <p>
                Built by the Epic Team &{" "}
                <a
                  href="https://www.linkedin.com/in/NoticedXAAryan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink hover:text-primary transition-colors"
                >
                  Aaryan Kumar Tiwari
                </a>{" "}
                for Goa&apos;s startup community.
              </p>
            </div>
          </div>

          {/* Goan skyline, blended with the card background */}
          <div 
            className="w-full pointer-events-none flex items-end mt-8"
            style={{
              maskImage: "linear-gradient(to bottom, transparent, black 25%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, black 25%)"
            }}
          >
            <img
              src="/footer_goa_buildings.jpg"
              alt="Goa Architecture"
              className="w-full h-auto object-cover object-bottom"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
