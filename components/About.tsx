import { Card, CardBody } from "@/components/ui/Card";

const ORGANIZERS = [
  {
    name: "Parul University Goa",
    description:
      "Goa's first State Private University, established in 2025 and located in Betul, South Goa. Committed to fostering innovation and academic excellence on the western coast.",
  },
  {
    name: "PIERC",
    description:
      "The flagship startup incubator of Parul University, recognized under MSME, Government of India. PIERC empowers student entrepreneurs with mentorship, funding access, and industry connections.",
  },
];

const STATS = [
  { value: "300+", label: "Startups Incubated" },
  { value: "₹200 Cr+", label: "Revenue Generated" },
  { value: "₹40 Cr+", label: "Investments Facilitated" },
  { value: "1,600+", label: "Employment Opportunities Created" },
];

export default function About() {
  return (
    <section id="about" className="bg-[#0a0a0a] py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Section heading */}
        <h2 className="font-display font-bold text-white text-3xl md:text-4xl lg:text-5xl tracking-tight">
          About the Festival
        </h2>
        <p className="mt-4 text-white/60 text-lg leading-relaxed max-w-2xl">
          Goa Startup Festival 2026 is a two-day entrepreneurship and innovation
          festival jointly organized by PIERC, Parul University, and PU Goa
          Campus — bringing together students, mentors, and industry leaders to
          ignite the next wave of startups.
        </p>

        {/* Organizer cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {ORGANIZERS.map((org) => (
            <Card
              key={org.name}
              className="border-white/10 bg-white/[0.03] backdrop-blur-sm"
            >
              <CardBody>
                <h3 className="text-xl font-bold text-white">{org.name}</h3>
                <p className="mt-2 text-white/50 leading-relaxed">
                  {org.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-16 pt-12 border-t border-white/[0.08]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="font-display text-3xl md:text-4xl font-bold text-accent-pink leading-none">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-white/40 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
