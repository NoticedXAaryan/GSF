import {
  ABOUT_DESCRIPTION,
  FESTIVAL_ORGANIZERS,
} from "@/lib/landing/content";

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative bg-blue-950 section-padding overflow-hidden">
      {/* Texture and ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-800/40 via-blue-950 to-slate-950"></div>
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

      <div className="site-container relative z-10">
        <header className="max-w-3xl">
          <p className="mb-2 font-semibold uppercase tracking-widest text-amber-300">
            Our purpose
          </p>
          <h2 id="about-title" className="text-3xl font-extrabold text-white tablet:text-4xl">About the Festival</h2>
          <div aria-hidden="true" className="brand-rule mt-6 w-20 text-amber-300/50" />
          <p className="mt-6 text-lg text-blue-100/80 leading-relaxed">{ABOUT_DESCRIPTION}</p>
        </header>

        {/* Organizers */}
        <div className="mt-16 grid grid-cols-1 gap-6 desktop:grid-cols-3">
          {FESTIVAL_ORGANIZERS.map((organizer) => (
            <article
              key={organizer.name}
              className="group relative flex flex-col rounded-2xl border border-[#E5D3B3] bg-gradient-to-b from-[#FDFBF7] to-[#F4EBD3] p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-[#D4AF37]"
            >
              <div className="mb-8 flex h-16 items-center">
                {organizer.logoUrl ? (
                  <img src={organizer.logoUrl} alt={`${organizer.name} logo`} className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <h3 className="font-bold text-slate-900 text-xl">{organizer.name}</h3>
                )}
              </div>
              {organizer.logoUrl && <h3 className="sr-only">{organizer.name}</h3>}
              <p className="text-slate-700 font-medium leading-relaxed flex-1">{organizer.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
