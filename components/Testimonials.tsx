'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const testimonials = [
  {
    quote: "PIERC gave us the framework to turn our college project into a real business. The mentorship and investor connections were game-changing.",
    name: "Arjun Nair",
    role: "Founder, TechSprint (PIERC Incubatee 2024)"
  },
  {
    quote: "The masterclass on business model design fundamentally changed how I think about building products. Worth every minute.",
    name: "Priya Sharma",
    role: "Co-founder, GreenWave Solutions"
  }
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          cardsRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
            }
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-ink-navy">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-white mb-4">
            STORIES FROM FOUNDERS WE&apos;VE SUPPORTED
          </h2>
          <p className="font-mono text-xs text-accent-pink uppercase tracking-widest">
            Real Impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <div 
              key={idx}
              ref={el => {
                if (el) cardsRef.current[idx] = el;
              }}
              className="bg-ink-deep border border-white/[0.06] p-8 md:p-10 flex flex-col justify-between"
            >
              <div>
                <div className="font-display text-6xl text-accent-pink leading-none mb-4">“</div>
                <p className="text-white/70 text-lg leading-relaxed italic font-body mb-8">
                  {testimonial.quote}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-accent-pink/20 text-accent-pink font-display font-bold text-xl flex items-center justify-center">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-white/40 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
