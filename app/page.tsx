'use client';

import { useEffect, useRef } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Masterclasses from '@/components/Masterclasses';
import Schedule from '@/components/Schedule';
import Sponsors from '@/components/Sponsors';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Thesis Reveal
      gsap.from('.thesis-text', {
        scrollTrigger: {
          trigger: '.thesis-section',
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
      });

      // Lineup Reveal
      gsap.from('.lineup-card', {
        scrollTrigger: {
          trigger: '.lineup-section',
          start: 'top 60%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.2)'
      });
      
      // CTA Reveal
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 75%',
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'expo.out'
      });
      
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-ink-navy text-cloud-white">
      <Hero />
      <About />
      <Masterclasses />
      <Schedule />
      <Sponsors />
      <FAQ />

      {/* The Thesis */}
      <section className="thesis-section py-32 md:py-48 border-t border-white/5 relative overflow-hidden bg-ink-deep">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4 thesis-text">
              <h2 className="text-xs font-mono tracking-widest text-white/40 uppercase mb-4 sticky top-32">
                01 — The Thesis
              </h2>
            </div>
            <div className="md:col-span-8">
              <h3 className="thesis-text font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
                Ideas are cheap. <br/>
                <span className="text-white/40">Execution is everything.</span>
              </h3>
              <p className="thesis-text text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl font-body">
                Organized by PIERC, this two-day festival strips away the fluff. No generic motivational talks. Just pure, tactical masterclasses, direct investor access, and a high-stakes pitching arena designed to push you from concept to reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Lineup */}
      <section className="lineup-section py-32 md:py-48 border-t border-white/5 bg-ink-navy relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-3">
              <h2 className="text-xs font-mono tracking-widest text-white/40 uppercase mb-4 sticky top-32">
                02 — The Lineup
              </h2>
            </div>
            
            <div className="md:col-span-9">
              <div className="mb-16">
                <h3 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight">Seven tracks. <br/>One ecosystem.</h3>
                <p className="text-xl md:text-2xl text-white/60 max-w-2xl leading-relaxed">
                  We&apos;ve curated a diverse lineup of interactive sessions, high-stakes competitions, and unfiltered discussions. The Goa Startup Festival is designed to serve every facet of the entrepreneurial journey.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* 1. Masterclasses */}
                <div className="lineup-card p-8 md:p-10 bg-ink-deep border border-white/5 flex flex-col h-full sm:col-span-2 group hover:border-hyper-cyan/30 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-hyper-cyan">Startup Masterclass Series</h3>
                    <span className="font-mono text-xs text-hyper-cyan uppercase border border-hyper-cyan/20 px-3 py-1 bg-hyper-cyan/5">4 Sessions • 1.5 Hours Each</span>
                  </div>
                  <p className="text-white/60 mb-8 max-w-3xl text-lg md:text-xl">
                    Tactical, intensive sessions capped at 70 participants. Learn directly from industry operators on how to validate ideas, discover opportunities, apply design thinking, and build scalable business models.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto pt-8 border-t border-white/10">
                    <div className="font-mono text-xs text-white/50 uppercase group-hover:text-white transition-colors">1. Idea to Startup</div>
                    <div className="font-mono text-xs text-white/50 uppercase group-hover:text-white transition-colors">2. Opportunities</div>
                    <div className="font-mono text-xs text-white/50 uppercase group-hover:text-white transition-colors">3. Design Thinking</div>
                    <div className="font-mono text-xs text-white/50 uppercase group-hover:text-white transition-colors">4. Business Model</div>
                  </div>
                </div>

                {/* 2. Signature Talks */}
                <div className="lineup-card p-8 md:p-10 bg-ink-deep border border-white/5 flex flex-col h-full group hover:border-hyper-cyan/30 transition-colors">
                  <h3 className="font-display text-3xl font-bold mb-4">Signature Talks</h3>
                  <p className="text-white/60 mb-8 flex-1 text-lg">
                    Unfiltered keynotes from successful entrepreneurs, investors, and policymakers sharing their journeys, lessons, and emerging market trends.
                  </p>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40 uppercase">Format</span>
                    <span className="text-white text-sm font-bold">Expert Keynotes</span>
                  </div>
                </div>

                {/* 3. Startup Idea Competition */}
                <div className="lineup-card p-8 md:p-10 bg-ink-deep border border-white/5 flex flex-col h-full group hover:border-hyper-cyan/30 transition-colors">
                  <h3 className="font-display text-3xl font-bold mb-4">Idea Competition</h3>
                  <p className="text-white/60 mb-8 flex-1 text-lg">
                    Pitch live to a panel of active operators and angels. Validate your business idea and compete for the top prize pool.
                  </p>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40 uppercase">Prize</span>
                    <span className="font-mono text-hyper-cyan text-sm font-bold">₹7,000 Top Prize</span>
                  </div>
                </div>

                {/* 4. Fireside Chat */}
                <div className="lineup-card p-8 md:p-10 bg-ink-deep border border-white/5 flex flex-col h-full group hover:border-hyper-cyan/30 transition-colors">
                  <h3 className="font-display text-3xl font-bold mb-4">Fireside Chat</h3>
                  <p className="text-white/60 mb-8 flex-1 text-lg">
                    An interactive panel discussion bringing together investors and industry experts to dissect funding, growth, and investment-readiness.
                  </p>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40 uppercase">Focus</span>
                    <span className="text-white text-sm font-bold">Investors & Industry</span>
                  </div>
                </div>

                {/* 5. Ecosystem Connect */}
                <div className="lineup-card p-8 md:p-10 bg-ink-deep border border-white/5 flex flex-col h-full group hover:border-hyper-cyan/30 transition-colors">
                  <h3 className="font-display text-3xl font-bold mb-4">Ecosystem Connect</h3>
                  <p className="text-white/60 mb-8 flex-1 text-lg">
                    A strategic roundtable uniting government agencies, incubators, and investors to build partnerships and strengthen the Goa startup network.
                  </p>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40 uppercase">Format</span>
                    <span className="text-white text-sm font-bold">Roundtable</span>
                  </div>
                </div>

                {/* 6. Startup Expo */}
                <div className="lineup-card p-8 md:p-10 bg-ink-deep border border-white/5 flex flex-col h-full group hover:border-hyper-cyan/30 transition-colors">
                  <h3 className="font-display text-3xl font-bold mb-4">Startup Expo</h3>
                  <p className="text-white/60 mb-8 flex-1 text-lg">
                    A one-day, free-of-cost exhibition for shortlisted startups to showcase products, gather feedback, and attract potential partners.
                  </p>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40 uppercase">Venue</span>
                    <span className="text-white text-sm font-bold">Exhibition Area</span>
                  </div>
                </div>

                {/* 7. ReelPitch */}
                <div className="lineup-card p-8 md:p-10 bg-ink-deep border border-white/5 flex flex-col h-full group hover:border-hyper-cyan/30 transition-colors">
                  <h3 className="font-display text-3xl font-bold mb-4">ReelPitch</h3>
                  <p className="text-white/60 mb-8 flex-1 text-lg">
                    Can&apos;t pitch live? Submit a high-impact, asynchronous video reel. Stand out digitally and win recognition during the Valedictory.
                  </p>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="font-mono text-xs text-white/40 uppercase">Format</span>
                    <span className="text-white text-sm font-bold">Video Submission</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-32 md:py-48 relative overflow-hidden flex flex-col items-center text-center px-6 border-t border-white/5">
        <div className="absolute inset-0 bg-hyper-cyan/5" />
        
        <div className="cta-content relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tighter leading-[0.8] text-white">
            SECURE YOUR <br/>
            <span className="text-hyper-cyan">DIGITAL PASS.</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl font-body">
            Attendance is free, but space is highly constrained. Build your custom schedule and lock in your masterclass seats before they hit the cap.
          </p>
          <Link 
            href="/register" 
            className="group relative inline-flex items-center justify-center gap-4 bg-white text-ink-navy px-12 py-6 font-bold text-xl overflow-hidden transition-transform hover:scale-105"
          >
            <span className="relative z-10">Create Your Account</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
