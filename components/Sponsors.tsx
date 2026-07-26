'use client';

import { motion } from 'motion/react';

const PARTNERS = [
  { name: 'PIERC', full: 'Parul Innovation & Entrepreneurship Research Centre' },
  { name: 'Parul University', full: 'Parul University Goa Campus' },
];

export default function Sponsors() {
  return (
    <section className="py-20 relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-8 font-mono">
            Organized By
          </p>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {PARTNERS.map((partner) => (
              <div key={partner.name} className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <span className="font-bold text-lg text-white/60">{partner.name}</span>
                </div>
                <span className="text-xs text-white/30 text-center max-w-[180px]">{partner.full}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
