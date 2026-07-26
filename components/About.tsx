'use client';

import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-24 relative bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Transform Ideas Into Ventures.
          </h2>
          <p className="text-lg text-white/60 leading-relaxed">
            Organized by the Parul Innovation and Entrepreneurship Research Centre (PIERC), the Goa Startup Festival 2026 is designed to inspire entrepreneurial thinking and strengthen the regional startup ecosystem.
          </p>
          <p className="text-lg text-white/60 leading-relaxed">
            It serves as a bridge between academia, industry, government, and the startup community, enabling participants to transform innovative ideas into sustainable businesses.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="p-6 rounded-2xl card-glass border border-white/10">
            <h3 className="text-4xl font-bold text-blue-500 mb-2">300+</h3>
            <p className="text-white/60">Startups Incubated by PIERC</p>
          </div>
          <div className="p-6 rounded-2xl card-glass border border-white/10 mt-8">
            <h3 className="text-4xl font-bold text-blue-500 mb-2">₹40Cr</h3>
            <p className="text-white/60">Secured in Investments</p>
          </div>
          <div className="p-6 rounded-2xl card-glass border border-white/10">
            <h3 className="text-4xl font-bold text-blue-500 mb-2">7+</h3>
            <p className="text-white/60">Major Event Tracks</p>
          </div>
          <div className="p-6 rounded-2xl card-glass border border-white/10 mt-8">
            <h3 className="text-4xl font-bold text-blue-500 mb-2">2</h3>
            <p className="text-white/60">Days of Innovation</p>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
