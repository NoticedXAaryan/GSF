'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  {
    q: 'Who can attend the Goa Startup Festival?',
    a: 'The festival is open to all students, aspiring founders, and ecosystem enablers. Some specific sessions like the Ecosystem Connect roundtable are restricted to invited participants (investors, government agencies, incubators). Masterclasses require separate registration due to capacity limits.',
  },
  {
    q: 'How does the digital pass work?',
    a: 'When you register, you receive a unique digital Clearance Pass with a QR code. This QR code serves as your entry pass for all events you\'re registered for. Volunteers at each event will scan your QR to verify your access. Your pass status updates dynamically as you apply to and get accepted into specific sub-events.',
  },
  {
    q: 'Is there a registration or entry fee?',
    a: 'The festival is 100% free to attend. There are no registration fees. However, seats for masterclasses are limited to 70 per session, so early registration is recommended to secure your spot.',
  },
  {
    q: 'How do I participate in the Startup Idea Competition?',
    a: 'First, register for the festival to get your pass. Then apply specifically for the Startup Idea Competition through your dashboard. Teams will be reviewed, and the top 10–15 will be shortlisted for the final pitching round on Day 2. Prizes of up to ₹7,000 are available.',
  },
  {
    q: 'What is ReelPitch?',
    a: 'ReelPitch is an asynchronous video pitch competition open to all registered students. Submit your startup pitch as a short video reel. The winner will be announced during the Valedictory & Prize Distribution session on Day 2.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for accordion content to animate height
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.faq-header', {
        scrollTrigger: {
          trigger: '.faq-section',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from('.faq-item', {
        scrollTrigger: {
          trigger: '.faq-list',
          start: 'top 80%',
        },
        x: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const toggleAccordion = (idx: number) => {
    if (openIdx === idx) {
      // Close currently open
      gsap.to(contentRefs.current[idx], { height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut' });
      setOpenIdx(null);
    } else {
      // Close previous
      if (openIdx !== null) {
        gsap.to(contentRefs.current[openIdx], { height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut' });
      }
      // Open new
      setOpenIdx(idx);
      gsap.fromTo(contentRefs.current[idx], 
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  };

  return (
    <section ref={containerRef} id="faq" className="faq-section py-32 md:py-48 relative bg-ink-navy border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <span className="faq-header font-mono text-hyper-cyan font-bold uppercase tracking-widest text-sm mb-6 block">
            04 — Common Questions
          </span>
          <h2 className="faq-header font-display text-5xl md:text-7xl font-bold tracking-tight text-white">
            Logistics & Details
          </h2>
        </div>

        <div className="faq-list space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`faq-item border transition-colors duration-300 ${
                  isOpen
                    ? 'bg-ink-deep border-hyper-cyan/30'
                    : 'bg-transparent border-white/10 hover:border-white/30'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between p-8 text-left focus:outline-none group"
                  onClick={() => toggleAccordion(idx)}
                >
                  <span className={`font-display text-2xl font-bold transition-colors ${isOpen ? 'text-hyper-cyan' : 'text-white group-hover:text-white/80'}`}>
                    {faq.q}
                  </span>
                  <div className="relative w-6 h-6 flex items-center justify-center shrink-0 ml-6">
                    <span className="absolute w-full h-0.5 bg-white transition-transform duration-300" />
                    <span className={`absolute w-full h-0.5 bg-white transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-90'}`} />
                  </div>
                </button>

                <div 
                  ref={el => { contentRefs.current[idx] = el; }}
                  className="overflow-hidden"
                  style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-8 pb-8 pt-0 text-white/60 text-lg leading-relaxed font-body">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
