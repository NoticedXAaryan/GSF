'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'How do I register for the festival?',
    a: 'Create an account, complete your profile, then register on your dashboard to get your digital pass.',
  },
  {
    q: 'What is the festival schedule?',
    a: 'Two days (2–3 Sept 2026). Day 1: Inaugural, Signature Talks, Ecosystem Connect, Fireside Chat, Masterclasses, Startup Expo. Day 2: Signature Talks, Startup Idea Competition, Masterclasses, Fireside Chat, Valedictory.',
  },
  {
    q: 'Where is the venue?',
    a: 'Parul University Goa Campus, Betul, South Goa.',
  },
  {
    q: 'Who can participate?',
    a: 'All students of Parul University Goa. Some events require separate registration (Idea Pitching, Startup Expo, Masterclass, ReelPitch).',
  },
  {
    q: 'Do I need to register for individual events?',
    a: 'Yes, events like Masterclass, Idea Pitching Competition, Startup Expo, and ReelPitch require separate registration through your dashboard.',
  },
  {
    q: 'What should I bring?',
    a: 'Your phone (with the digital pass QR code), a notebook, and enthusiasm!',
  },
  {
    q: 'Are there prizes?',
    a: 'Yes! The Startup Idea Competition has cash prizes: 1st ₹7,000, 2nd ₹5,000, 3rd ₹3,000.',
  },
];

function FAQItem({
  faq,
  isOpen,
  onClick,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`border transition-colors duration-300 ${
        isOpen
          ? 'bg-ink-deep border-accent-pink/30'
          : 'bg-transparent border-white/[0.06] hover:border-white/15'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-expanded={isOpen}
        className="w-full flex justify-between items-center p-6 md:p-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink"
      >
        <span
          className={`font-display text-lg md:text-xl font-bold pr-4 transition-colors ${
            isOpen ? 'text-accent-pink' : 'text-white'
          }`}
        >
          {faq.q}
        </span>
        <div className="relative w-4 h-4 shrink-0" aria-hidden="true">
          <div
            className={`absolute top-1/2 left-0 w-full h-0.5 bg-current -translate-y-1/2 transition-colors ${
              isOpen ? 'text-accent-pink' : 'text-white'
            }`}
          />
          <div
            className={`absolute top-0 left-1/2 w-0.5 h-full bg-current -translate-x-1/2 transition-transform duration-300 ${
              isOpen ? 'rotate-90 text-accent-pink' : 'text-white'
            }`}
          />
        </div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-6 md:px-8 pb-6 md:pb-8 text-white/50 text-base leading-relaxed">
            {faq.a}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-40 bg-ink-navy">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-white text-center mb-16">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-3">
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
