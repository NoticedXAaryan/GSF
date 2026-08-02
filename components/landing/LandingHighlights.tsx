import Link from "next/link";

const FEATURED_EVENTS = [
  {
    /* IMAGE PROMPT: A professional photo of young entrepreneurs presenting their startup pitch 
       on a modern stage with dramatic lighting, audience visible, startup competition atmosphere,
       warm gold and red tones, 16:9 landscape format */
    title: "Startup Nivesh 2.0",
    description:
      "Connect with top-tier investors for funding opportunities up to ₹10 Crores. Pitch your idea to a panel of VCs and angel investors.",
    image: "/startup_nivesh.png",
  },
  {
    /* IMAGE PROMPT: A wide-angle shot of a corporate networking event with startup founders 
       meeting industry leaders, handshakes, branded lanyards, professional setting, 
       warm lighting, 16:9 landscape format */
    title: "Startup Industry Connect",
    description:
      "Bridge the gap between emerging startups and established industry leaders. Network, collaborate, and find your next big partnership.",
    image: "/industry_connect.png",
  },
  {
    /* IMAGE PROMPT: A vibrant hackathon scene with students coding at desks, multiple monitors,
       sticky notes on walls, team collaboration, energetic atmosphere, neon accent lighting,
       16:9 landscape format */
    title: "48-Hour Hackathon",
    description:
      "Build, ship, and demo a working product in 48 hours. Teams compete across tracks including AI, FinTech, and HealthTech.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  },
  {
    /* IMAGE PROMPT: A masterclass workshop setting with a mentor speaking to a small group,
       whiteboard with business models drawn, intimate learning environment, warm tones,
       16:9 landscape format */
    title: "Founder Masterclasses",
    description:
      "Intensive workshops led by successful founders covering product-market fit, fundraising, and scaling operations.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
  },
  {
    /* IMAGE PROMPT: A showcase exhibition with startup booths displaying tech products,
       attendees exploring demos, modern expo-style setup with clean branding,
       bright professional lighting, 16:9 landscape format */
    title: "Innovation Showcase",
    description:
      "Demo your product to 600+ attendees, potential customers, and press. Get real feedback and generate early traction.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  },
  {
    /* IMAGE PROMPT: A panel discussion with diverse speakers on stage, modern conference setup,
       large screen behind them, audience engaged, professional corporate event photography,
       16:9 landscape format */
    title: "Investor Panel Talks",
    description:
      "Hear directly from VCs and angels about what they look for, deal structures, and the state of Indian startup funding.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
  },
  {
    /* IMAGE PROMPT: Students and young professionals networking outdoors in a tropical Goan 
       setting, palm trees, casual professional attire, golden hour lighting, community vibes,
       16:9 landscape format */
    title: "Community Mixer",
    description:
      "Relaxed networking sessions connecting students, faculty, alumni, and ecosystem players in a vibrant Goan setting.",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
  },
];

export function LandingHighlights() {
  return (
    <section className="bg-canvas py-16 tablet:py-24" id="featured-events">
      <div className="site-container">
        <header className="mb-12">
          <p className="mb-2 font-semibold uppercase tracking-widest text-accent">
            What&apos;s Happening
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink tablet:text-4xl">
            Featured Events
          </h2>
          <div aria-hidden="true" className="brand-rule mt-4 w-16 text-accent/40" />
          <p className="mt-4 text-lg text-ink-muted max-w-2xl">
            Seven flagship experiences across two days — from pitch competitions to hackathons.
          </p>
        </header>

        {/* Top 2 large cards */}
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 mb-4">
          {FEATURED_EVENTS.slice(0, 2).map((event) => (
            <EventCard key={event.title} event={event} size="large" />
          ))}
        </div>

        {/* Bottom 5 in a scrollable row on mobile, 5-col grid on desktop */}
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-5">
          {FEATURED_EVENTS.slice(2).map((event) => (
            <EventCard key={event.title} event={event} size="small" />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCard({ event, size }: { event: typeof FEATURED_EVENTS[0]; size: 'large' | 'small' }) {
  const heightClass = size === 'large' ? 'h-[420px] tablet:h-[480px]' : 'h-[280px] tablet:h-[320px]';

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl ${heightClass}`}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Dark overlay — stronger on hover to make text readable */}
      <div className="absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/75" />

      {/* Content — name always visible, description appears on hover */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 tablet:p-6">
        <h3 className={`font-bold text-white ${size === 'large' ? 'text-2xl tablet:text-3xl' : 'text-base tablet:text-lg'}`}>
          {event.title}
        </h3>
        <p className="mt-2 text-sm text-white/80 leading-relaxed max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-24 opacity-0 group-hover:opacity-100">
          {event.description}
        </p>
      </div>
    </article>
  );
}
