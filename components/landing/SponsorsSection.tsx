import { Award } from "lucide-react";

/**
 * Partners section — displays the three organizing institutions.
 * Styled as a clean, focused section on a light surface.
 */
export function SponsorsSection() {
  return (
    <section
      aria-labelledby="partners-title"
      className="bg-surface section-padding border-y border-surface-alt"
    >
      <div className="site-container">
        <header className="text-center max-w-2xl mx-auto">
          <p className="mb-2 font-semibold uppercase tracking-widest text-primary">
            Organized by
          </p>
          <h2 id="partners-title" className="font-bold text-ink">
            Our Partners
          </h2>
          <div aria-hidden="true" className="brand-rule mx-auto mt-6 w-20 text-accent/40" />
          <p className="mt-6 text-lg text-ink-muted">
            Jointly organized by three institutions committed to entrepreneurship
            and innovation in Goa.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 tablet:grid-cols-3 max-w-5xl mx-auto">
          {/* Parul University Goa */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-alt bg-white p-8 tablet:p-10 text-center transition-all hover:border-accent hover:shadow-lg">
            <img
              src="/logo.png"
              alt="Parul University Goa"
              className="h-16 w-auto object-contain"
            />
            <p className="mt-6 text-sm font-bold text-ink">
              Parul University Goa
            </p>
            <p className="mt-1 text-xs text-ink-muted">Host Campus</p>
          </div>

          {/* Parul University Baroda */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-alt bg-white p-8 tablet:p-10 text-center transition-all hover:border-accent hover:shadow-lg relative overflow-hidden">
            <img
              src="/logo.png"
              alt="Parul University Baroda"
              className="h-16 w-auto object-contain"
            />
            <div className="mt-6 flex flex-col items-center">
              <p className="text-sm font-bold text-ink">
                Parul University Baroda
              </p>
              
              {/* NIRF Top 50 Badge Re-creation */}
              <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#f8f9fa] border border-[#e9ecef]">
                <Award className="text-[#0a2351] w-4 h-4" strokeWidth={2.5} />
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-1">
                     <span className="font-black text-sm tracking-tighter text-[#0a2351] leading-none">nirf</span>
                     <div className="flex items-center gap-0.5 bg-[#0a2351] pl-1 pr-0.5 py-[2px] rounded-sm">
                       <span className="text-white text-[8px] font-bold leading-none">TOP</span>
                       <span className="bg-[#e31e24] text-white text-[9px] font-black px-1 rounded-[2px] leading-none">50</span>
                     </div>
                   </div>
                   <span className="text-[7px] font-bold tracking-[0.1em] text-[#0a2351] mt-0.5">INNOVATIONS RANKING</span>
                </div>
                <Award className="text-[#0a2351] w-4 h-4" strokeWidth={2.5} />
              </div>

              <p className="mt-3 text-xs text-ink-muted">Parent University</p>
            </div>
          </div>

          {/* PRCE (PIERC) */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-surface-alt bg-white p-8 tablet:p-10 text-center transition-all hover:border-accent hover:shadow-lg">
            <img
              src="/logo.png"
              alt="PRCE - Parul Research Centre for Entrepreneurship"
              className="h-16 w-auto object-contain"
            />
            <p className="mt-6 text-sm font-bold text-ink">PRCE</p>
            <p className="mt-1 text-xs text-ink-muted">Research &amp; Innovation</p>
          </div>
        </div>
      </div>
    </section>
  );
}
