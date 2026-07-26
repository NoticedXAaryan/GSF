'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0A0A0A] to-[#0A0A0A] z-0" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-block"
        >
          <span className="bg-white/10 text-blue-400 font-medium px-4 py-1.5 rounded-full text-sm border border-white/10">
            September 2-3, 2026 • Parul University, Goa
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-white"
        >
          Goa Startup Festival
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-10"
        >
          Where ideas meet investors, founders, mentors, and opportunities. More than a festival, it's a startup launchpad.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            Claim Your Free Pass
          </Link>
          <a 
            href="#schedule" 
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors"
          >
            View Schedule
          </a>
        </motion.div>
      </div>
    </section>
  );
}
