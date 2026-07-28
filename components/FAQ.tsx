'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const faqs = [
  {
    q: "Who can attend the Goa Startup Festival?",
    a: "The festival is open to all students, aspiring founders, and ecosystem enablers. Some specific sessions like the Ecosystem Connect roundtable are restricted to invited participants (investors, government agencies, incubators). Masterclasses require separate registration due to capacity limits."
  },
  {
    q: "How does the digital pass work?",
    a: "When you register, you receive a unique digital Clearance Pass with a QR code. This QR code serves as your entry pass for all events you're registered for. Volunteers at each event will scan your QR to verify your access. Your pass status updates dynamically as you apply to and get accepted into specific sub-events."
  },
  {
    q: "Is there a registration or entry fee?",
    a: "The festival is 100% free to attend. There are no registration fees. However, seats for masterclasses are limited to 70 per session, so early registration is recommended to secure your spot."
  },
  {
    q: "How do I participate in the Startup Idea Competition?",
    a: "First, register for the festival to get your pass. Then apply specifically for the Startup Idea Competition through your dashboard. Teams will be reviewed, and the top 10–15 will be shortlisted for the final pitching round on Day 2. Prizes of up to ₹7,000 are available."
  },
  {
    q: "What is ReelPitch?",
    a: "ReelPitch is an asynchronous video pitch competition open to all registered students. Submit your startup pitch as a short video reel. The winner will be announced during the Valedictory & Prize Distribution session on Day 2."
  }
];

function FAQItem({ faq, isOpen, onClick }: { faq: { q: string, a: string }, isOpen: boolean, onClick: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        gsap.to(contentRef.current, {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
    }
  }, [isOpen]);

  return (
    <div className={`border transition-colors duration-300 ${isOpen ? 'bg-ink-deep border-accent-pink/30' : 'bg-transparent border-white/[0.06] hover:border-white/15'}`}>
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-6 md:p-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink"
      >
        <span className={`font-display text-lg md:text-xl font-bold pr-4 transition-colors ${isOpen ? 'text-accent-pink' : 'text-white'}`}>
          {faq.q}
        </span>
        <div className="relative w-4 h-4 shrink-0">
          <div className={`absolute top-1/2 left-0 w-full h-0.5 bg-current -translate-y-1/2 transition-colors ${isOpen ? 'text-accent-pink' : 'text-white'}`} />
          <div className={`absolute top-0 left-1/2 w-0.5 h-full bg-current -translate-x-1/2 transition-transform duration-300 ${isOpen ? 'rotate-90 text-accent-pink' : 'text-white'}`} />
        </div>
      </button>
      <div 
        ref={contentRef} 
        className="overflow-hidden h-0 opacity-0"
      >
        <div className="px-6 md:px-8 pb-6 md:pb-8 text-white/50 text-base leading-relaxed">
          {faq.a}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          headingRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
            }
          }
        );

        gsap.fromTo(
          listRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.2,
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
    <section id="faq" ref={sectionRef} className="py-24 md:py-40 bg-ink-navy">
      <div className="container mx-auto px-4">
        <h2 ref={headingRef} className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-white text-center mb-16">
          FREQUENTLY ASKED QUESTIONS
        </h2>

        <div ref={listRef} className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              faq={faq}
              isOpen={openIndex === idx}
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
