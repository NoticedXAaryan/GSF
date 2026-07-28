'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const partners = [
  {
    name: 'PIERC',
    description: 'Parul Innovation & Entrepreneurship Research Centre',
  },
  {
    name: 'PARUL UNIVERSITY',
    description: 'Parul University Goa Campus',
  },
  {
    name: 'EPIC CLUB',
    description: 'Student Community Partners',
  },
];

export default function Sponsors() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
            },
          }
        );

        if (partnersRef.current) {
          gsap.fromTo(
            partnersRef.current.children,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 75%',
              },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 bg-ink-deep border-t border-white/[0.06] overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <h2 
          ref={titleRef}
          className="font-mono text-xs text-white/30 uppercase tracking-widest mb-12 text-center"
        >
          Organized in partnership with
        </h2>

        <div 
          ref={partnersRef}
          className="flex flex-wrap justify-center items-start gap-12 md:gap-24"
        >
          {partners.map((partner, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-20 md:h-24 px-8 md:px-12 bg-ink-navy border border-white/[0.06] flex items-center justify-center group hover:border-accent-pink/30 transition-colors duration-300">
                <span className="font-display font-bold text-2xl text-white/60 group-hover:text-accent-pink uppercase transition-colors duration-300">
                  {partner.name}
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/30 text-center mt-3 max-w-[200px] uppercase tracking-wider">
                {partner.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
