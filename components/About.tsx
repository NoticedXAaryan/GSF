'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STATS = [
  { value: '300+', label: 'Startups Incubated' },
  { value: '₹40Cr', label: 'Secured Investments' },
  { value: '7+', label: 'Major Event Tracks' },
  { value: '2', label: 'Days of Innovation' },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Heading lines stagger
      gsap.fromTo('.about-heading-line', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-heading', start: 'top 78%' },
      });

      // Body text
      gsap.fromTo('.about-body', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-heading', start: 'top 78%' },
      });

      // Images slide in from right
      gsap.fromTo('.about-images', { x: 60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-images', start: 'top 80%' },
      });

      // Stats
      gsap.fromTo('.stat-item', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.stats-row', start: 'top 88%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="bg-[#0a0a0a] py-28 md:py-44 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">

        {/* ── Two-Column: Text + Image Collage ── */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">

          {/* LEFT — Heading + Body */}
          <div className="relative">
            {/* Decorative dot grid */}
            <div className="absolute -top-8 -left-6 w-[100px] h-[100px] opacity-30 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #E91E8F 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px'
            }} />

            <div className="about-heading">
              <h2 className="font-display font-bold uppercase tracking-[-0.02em] leading-[0.92] text-[clamp(2.8rem,7vw,7.5rem)]">
                <span className="about-heading-line block text-white">CRAFTING</span>
                <span className="about-heading-line block text-white">UNFORGETTABLE</span>
                <span className="about-heading-line block text-accent-pink">EXPERIENCES</span>
                <span className="about-heading-line block text-accent-pink">WITH PRECISION</span>
              </h2>
            </div>

            <p className="about-body mt-8 text-white/45 text-lg leading-relaxed max-w-lg font-body">
              Organized by PIERC, the Goa Startup Festival 2026 is a two-day
              startup launchpad bridging academia, industry, and the startup
              ecosystem at Parul University, Goa.
            </p>
          </div>

          {/* RIGHT — Image Collage (two images overlapping) */}
          <div className="about-images relative h-[420px] sm:h-[520px] lg:h-[600px]">
            {/* Top image — larger */}
            <div className="absolute top-0 left-0 w-[78%] h-[72%] overflow-hidden z-10">
              <Image
                src="/about-event.png"
                alt="Startup Festival keynote"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Bottom image — offset right, overlapping */}
            <div className="absolute bottom-0 right-0 w-[72%] h-[58%] overflow-hidden z-20 border-l-2 border-t-2 border-accent-pink/40">
              <Image
                src="/gallery-workshop.png"
                alt="Masterclass workshop session"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="stats-row mt-24 md:mt-32 pt-12 border-t border-white/[0.06]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold text-accent-pink leading-none tracking-tight">
                  {s.value}
                </div>
                <div className="mt-2 font-mono text-[10px] text-white/35 uppercase tracking-[0.2em]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
