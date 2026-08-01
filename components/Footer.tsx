import Link from "next/link";

const QUICK_LINKS = [
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Register", href: "/signup" },
  { label: "Login", href: "/login" },
];

export default function Footer() {
  return (
    <footer className="bg-[#070707] border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Column 1: Branding */}
          <div>
            <h3 className="font-display font-bold text-white text-lg tracking-tight">
              Goa Startup Festival 2026
            </h3>
            <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-xs">
              A two-day entrepreneurship and innovation festival bringing
              together students, mentors, and industry leaders at Parul
              University Goa Campus.
            </p>
            <p className="mt-4 text-xs text-white/40">
              Jointly organized by PIERC, Parul University &amp; PU Goa
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li>
                <a
                  href="mailto:ecell@goa.paruluniversity.ac.in"
                  className="hover:text-white transition-colors"
                >
                  ecell@goa.paruluniversity.ac.in
                </a>
              </li>
              <li>Parul University Goa</li>
              <li>Betul, South Goa</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © 2026 Goa Startup Festival. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built with <span aria-label="love">❤️</span> by the PIERC team
          </p>
        </div>
      </div>
    </footer>
  );
}
