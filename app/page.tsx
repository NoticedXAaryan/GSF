'use client';

import Hero from '@/components/Hero';
import About from '@/components/About';
import Masterclasses from '@/components/Masterclasses';
import Schedule from '@/components/Schedule';
import Sponsors from '@/components/Sponsors';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-blue-500 selection:text-white">
      <Hero />
      <About />
      <Masterclasses />
      <Schedule />
      <Sponsors />
      <FAQ />

      {/* CTA */}
      <section className="py-32 relative overflow-hidden flex flex-col items-center text-center px-6 border-t border-white/10">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Ready to shape the future?
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl">
            Join hundreds of founders, investors, and innovators at the Goa Startup Festival 2026.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            Register Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
