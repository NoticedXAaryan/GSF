'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PARTNERS = [
  { name: 'PIERC', full: 'Parul Innovation & Entrepreneurship Research Centre' },
  { name: 'Parul University', full: 'Parul University Goa Campus' },
  { name: 'Epic Club', full: 'Student Community Partners' },
];

export default function Sponsors() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sponsor-item', {
        scrollTrigger: {
          trigger: '.sponsor-section',
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="sponsor-section py-24 relative bg-ink-deep border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <p className="sponsor-item text-xs font-mono uppercase tracking-widest text-white/30 mb-12">
            Organized In Partnership With
          </p>

          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {PARTNERS.map((partner) => (
              <div key={partner.name} className="sponsor-item flex flex-col items-center gap-4 group">
                <div className="h-24 px-8 bg-ink-navy border border-white/5 flex items-center justify-center group-hover:border-hyper-cyan/30 transition-colors">
                  <span className="font-display font-bold text-2xl text-white/80 group-hover:text-hyper-cyan transition-colors">{partner.name}</span>
                </div>
                <span className="font-mono text-xs text-white/40 text-center max-w-[200px] uppercase tracking-wider">{partner.full}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
