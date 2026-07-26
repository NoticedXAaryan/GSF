'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-text', {
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out'
      });

      gsap.from('.stat-card', {
        scrollTrigger: {
          trigger: '.stats-grid',
          start: 'top 80%',
        },
        scale: 0.95,
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.5)'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="about" className="about-section py-32 md:py-48 relative bg-ink-navy border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        <div className="space-y-8">
          <h2 className="about-text font-display text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Transform Ideas <br/>
            <span className="text-hyper-cyan">Into Ventures.</span>
          </h2>
          <p className="about-text text-xl md:text-2xl text-white/60 leading-relaxed font-body">
            Organized by the Parul Innovation and Entrepreneurship Research Centre (PIERC), the Goa Startup Festival 2026 is designed to inspire entrepreneurial thinking and strengthen the regional startup ecosystem.
          </p>
          <p className="about-text text-xl md:text-2xl text-white/60 leading-relaxed font-body">
            It serves as a bridge between academia, industry, government, and the startup community, enabling participants to transform innovative ideas into sustainable businesses.
          </p>
        </div>

        <div className="stats-grid grid grid-cols-2 gap-4 md:gap-6 lg:pl-12">
          <div className="stat-card p-8 bg-ink-deep border border-white/5 flex flex-col justify-end min-h-[200px]">
            <h3 className="font-display text-5xl font-bold text-hyper-cyan mb-2">300+</h3>
            <p className="text-white/60 font-mono text-sm uppercase tracking-wider">Startups Incubated</p>
          </div>
          <div className="stat-card p-8 bg-ink-deep border border-white/5 flex flex-col justify-end min-h-[200px] lg:translate-y-12">
            <h3 className="font-display text-5xl font-bold text-hyper-cyan mb-2">₹40Cr</h3>
            <p className="text-white/60 font-mono text-sm uppercase tracking-wider">Secured Investments</p>
          </div>
          <div className="stat-card p-8 bg-ink-deep border border-white/5 flex flex-col justify-end min-h-[200px]">
            <h3 className="font-display text-5xl font-bold text-hyper-cyan mb-2">7+</h3>
            <p className="text-white/60 font-mono text-sm uppercase tracking-wider">Major Event Tracks</p>
          </div>
          <div className="stat-card p-8 bg-ink-deep border border-white/5 flex flex-col justify-end min-h-[200px] lg:translate-y-12">
            <h3 className="font-display text-5xl font-bold text-hyper-cyan mb-2">2</h3>
            <p className="text-white/60 font-mono text-sm uppercase tracking-wider">Days of Innovation</p>
          </div>
        </div>
        
      </div>
    </section>
  );
}
