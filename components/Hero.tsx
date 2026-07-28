'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);
  const bottomRef = useRef<HTMLDivElement[]>([]);

  const addLine = (el: HTMLDivElement | null) => {
    if (el && !linesRef.current.includes(el)) linesRef.current.push(el);
  };
  const addBottom = (el: HTMLDivElement | null) => {
    if (el && !bottomRef.current.includes(el)) bottomRef.current.push(el);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        linesRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'power3.out' }
      );

      tl.fromTo(
        bottomRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
        '-=0.4'
      );
    }, containerRef);

    const onMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      gsap.to(bgRef.current, { x: -x, y: -y, duration: 1.2, ease: 'power2.out' });
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => { ctx.revert(); window.removeEventListener('mousemove', onMouseMove); };
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with parallax */}
      <div ref={bgRef} className="absolute inset-[-30px] z-0">
        <Image
          src="/hero-bg.png"
          alt="Goa Startup Festival crowd"
          fill
          priority
          className="object-cover"
        />
        {/* Gradient overlays matching reference — dark top and bottom, transparent middle */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
      </div>

      {/* Pink decorative dots — scattered, matching reference */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {/* Dot cluster top-right */}
        <div className="absolute top-[15%] right-[8%] w-[140px] h-[140px] opacity-50" style={{
          backgroundImage: 'radial-gradient(circle, #E91E8F 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px'
        }} />
        {/* Scattered individual dots */}
        <div className="absolute top-[30%] left-[12%] w-3 h-3 rounded-full bg-accent-pink/50" />
        <div className="absolute top-[55%] right-[25%] w-4 h-4 rounded-full bg-accent-pink/40 blur-[1px]" />
        <div className="absolute top-[20%] right-[35%] w-2.5 h-2.5 rounded-full bg-accent-pink/60" />
        <div className="absolute bottom-[30%] left-[8%] w-5 h-5 rounded-full bg-accent-pink/30 blur-[2px]" />
      </div>

      {/* Main headline — matching reference: left-aligned, massive condensed uppercase */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col">
          {/* Line 1 — white */}
          <div className="overflow-hidden">
            <div ref={addLine} className="font-display font-bold uppercase leading-[0.9] tracking-[-0.02em] text-white text-[clamp(2.5rem,10vw,11rem)]">
              WE DON&apos;T JUST PLAN
            </div>
          </div>
          {/* Line 2 — white */}
          <div className="overflow-hidden">
            <div ref={addLine} className="font-display font-bold uppercase leading-[0.9] tracking-[-0.02em] text-white text-[clamp(2.5rem,10vw,11rem)]">
              EVENTS
            </div>
          </div>
          {/* Line 3 — pink */}
          <div className="overflow-hidden">
            <div ref={addLine} className="font-display font-bold uppercase leading-[0.9] tracking-[-0.02em] text-accent-pink text-[clamp(2.5rem,10vw,11rem)]">
              WE LAUNCH
            </div>
          </div>
          {/* Line 4 — pink */}
          <div className="overflow-hidden">
            <div ref={addLine} className="font-display font-bold uppercase leading-[0.9] tracking-[-0.02em] text-accent-pink text-[clamp(2.5rem,10vw,11rem)]">
              STARTUPS
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — date badge left, CTA + scroll right */}
      <div className="absolute bottom-10 left-0 right-0 z-20 max-w-[1400px] mx-auto px-6 md:px-10 flex items-end justify-between">
        {/* Date badge */}
        <div ref={addBottom} className="font-mono text-[11px] tracking-[0.25em] text-white/70 uppercase">
          SEPT 2–3, 2026 &bull; GOA
        </div>

        {/* CTA + scroll indicator */}
        <div className="flex items-center gap-8">
          <div ref={addBottom}>
            <Link
              href="/register"
              className="inline-block bg-accent-pink text-white px-8 py-3.5 font-display font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(233,30,143,0.4)] transition-all duration-300"
            >
              Register Now
            </Link>
          </div>
          <div ref={addBottom} className="hidden md:flex flex-col items-center gap-2">
            <span className="font-mono text-[9px] tracking-[0.3em] text-white/40 uppercase [writing-mode:vertical-rl] rotate-180">
              Scroll
            </span>
            <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center animate-bounce">
              <ArrowDown className="w-3.5 h-3.5 text-accent-pink" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
