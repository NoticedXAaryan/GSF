import Link from "next/link";

const HIGHLIGHTS = [
  {
    title: "Startup Nivesh 2.0",
    description:
      "Startup Nivesh is a premier event tailored to connect ambitious entrepreneurs with top-tier investors, offering funding opportunities up to ₹10 Crores.",
    image: "/startup_nivesh.png",
    link: "/signup",
  },
  {
    title: "STARTUP INDUSTRY CONNECT",
    description:
      "Bridge the gap between emerging startups and established industry leaders. Network, collaborate, and find your next big partnership.",
    image: "/industry_connect.png",
    link: "/signup",
  },
];

export function LandingHighlights() {
  return (
    <section className="bg-canvas py-16 tablet:py-24" id="highlights">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink tablet:text-4xl">
            Featured Events
          </h2>
          <div
            aria-hidden="true"
            className="brand-rule mt-4 w-16 text-primary/40"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 lg:gap-8">
          {HIGHLIGHTS.map((highlight, index) => (
            <div
              key={index}
              className="group relative flex h-[480px] w-full flex-col justify-end overflow-hidden rounded-2xl bg-surface shadow-md transition-shadow hover:shadow-xl"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={highlight.image}
                  alt={highlight.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Content */}
              <div className="relative z-20 p-8 tablet:p-10 text-center flex flex-col items-center">
                <h3 className="text-2xl font-bold tracking-tight text-white mb-4 tablet:text-3xl">
                  {highlight.title}
                </h3>
                <p className="text-white/90 text-sm tablet:text-base leading-relaxed max-w-md mx-auto mb-8 font-medium">
                  {highlight.description}
                </p>
                
                <Link
                  href={highlight.link}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 font-semibold text-primary shadow-sm transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Register Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
