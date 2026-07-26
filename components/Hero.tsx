'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2 }
      )
        .fromTo(
          headlineRef.current?.children as HTMLCollection,
          { opacity: 0, y: 40, rotateX: -20 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.1 },
          '-=0.8'
        )
        .fromTo(
          sublineRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1 },
          '-=0.6'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1 },
          '-=0.8'
        );

      // Subtle parallax effect on mouse move
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;

        gsap.to(bgRef.current, {
          x: xPos,
          y: yPos,
          duration: 1,
          ease: 'power2.out',
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-ink-navy pt-20"
    >
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-hyper-cyan/10 via-ink-navy to-ink-navy scale-110 z-0" 
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-12">
        <div className="flex-1 max-w-3xl">
          <div ref={badgeRef} className="mb-8 inline-block">
            <span className="font-mono bg-hyper-cyan/10 text-hyper-cyan font-bold px-4 py-2 text-xs uppercase tracking-widest border border-hyper-cyan/20">
              Sept 2-3, 2026 • Goa
            </span>
          </div>

          <h1 
            ref={headlineRef}
            className="font-display text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] text-white mb-8"
            style={{ perspective: '1000px' }}
          >
            <div className="inline-block transform-gpu">Goa</div><br/>
            <div className="inline-block transform-gpu text-hyper-cyan">Startup</div><br/>
            <div className="inline-block transform-gpu">Festival.</div>
          </h1>
        </div>

        <div className="md:w-1/3 flex flex-col md:items-end md:text-right pb-4">
          <p 
            ref={sublineRef}
            className="text-xl md:text-2xl text-white/60 mb-10 font-body text-balance"
          >
            Where ideas meet investors, founders, and opportunities. The ultimate launchpad.
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-4 w-full md:justify-end">
            <Link 
              href="/register" 
              className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 bg-white text-ink-navy px-8 py-4 font-bold text-lg overflow-hidden transition-transform hover:scale-[1.02]"
            >
              <span className="relative z-10">Get Your Pass</span>
              <ArrowUpRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
