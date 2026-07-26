'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

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

  return (
    <section id="faq" className="py-24 md:py-32 relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-blue-500 font-medium tracking-wider uppercase text-sm mb-4 block">
            Common Questions
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            FAQ
          </h2>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`rounded-xl border transition-all duration-200 ${
                  isOpen
                    ? 'bg-white/[0.04] border-white/20'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                >
                  <span className="font-semibold text-lg text-white">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-white/60 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
