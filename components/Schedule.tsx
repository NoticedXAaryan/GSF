'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SCHEDULE = {
  day1: [
    { time: '09:00 AM', title: 'Registration', venue: 'Seminar Hall', desc: 'Arrive early to collect your badges and welcome kit.' },
    { time: '10:00 AM', title: 'Inaugural Ceremony', venue: 'Seminar Hall', desc: 'Kickoff and welcome address by university officials.' },
    { time: '11:00 AM', title: 'Signature Talk 1', venue: 'Seminar Hall', desc: 'Chief Guest Address on the startup ecosystem.' },
    { time: '11:45 AM', title: 'Ecosystem Connect', venue: 'VC Office', desc: 'Invite-only roundtable discussion with industry leaders.' },
    { time: '11:45 AM', title: 'Masterclass Session 1', venue: 'Classroom 120', desc: 'From Idea to Startup - Understanding the Startup Lifecycle.' },
    { time: '01:15 PM', title: 'Lunch Break', venue: 'Campus', desc: 'Networking lunch.' },
    { time: '02:15 PM', title: 'Fireside Chat', venue: 'Seminar Hall', desc: 'Interactive panel with Investors and Industry.' },
    { time: '02:15 PM', title: 'Masterclass Session 2', venue: 'Classroom 120', desc: 'Discover Opportunities - The Art of Idea Generation.' },
  ],
  day2: [
    { time: '09:30 AM', title: 'Startup Expo', venue: 'Exhibition Area', desc: 'Showcase of innovative products and technologies. (All Day)' },
    { time: '10:00 AM', title: 'Signature Talk 2', venue: 'Seminar Hall', desc: 'Expert keynote on startup growth.' },
    { time: '10:00 AM', title: 'Masterclass Session 3', venue: 'Classroom 120', desc: 'Think Like an Innovator - Design Thinking for Startups.' },
    { time: '10:45 AM', title: 'Signature Talk 3', venue: 'Seminar Hall', desc: 'Emerging industry trends and opportunities.' },
    { time: '11:30 AM', title: 'Idea Competition', venue: 'Seminar Hall', desc: 'Top 10-15 shortlisted teams pitch for the prize pool.' },
    { time: '11:30 AM', title: 'Masterclass Session 4', venue: 'Classroom 120', desc: 'Build a Winning Business Model.' },
    { time: '01:15 PM', title: 'Lunch Break', venue: 'Campus', desc: 'Networking lunch.' },
    { time: '02:00 PM', title: 'Fireside Chat', venue: 'Seminar Hall', desc: 'Panel with investors and industry veterans.' },
    { time: '02:45 PM', title: 'Signature Talk 4', venue: 'Seminar Hall', desc: 'Guest of Honor keynote address.' },
    { time: '03:30 PM', title: 'Valedictory', venue: 'Seminar Hall', desc: 'Prize distribution for Idea Competition and ReelPitch.' },
  ],
};

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We recreate ScrollTriggers when the activeDay changes because the DOM changes
    const ctx = gsap.context(() => {
      gsap.from('.sched-header', {
        scrollTrigger: {
          trigger: '.sched-section',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
      });

      const items = gsap.utils.toArray('.sched-item');
      items.forEach((item: any) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          },
          x: -30,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
      
    }, containerRef);
    
    return () => ctx.revert();
  }, [activeDay]);

  return (
    <section ref={containerRef} id="schedule" className="sched-section py-32 md:py-48 relative bg-ink-navy">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="mb-20">
          <span className="sched-header text-xs font-mono tracking-widest text-white/40 uppercase mb-4 block">
            03 — The Agenda
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="sched-header font-display text-5xl md:text-7xl font-bold tracking-tight text-white">
              Event Schedule
            </h2>
            
            <div className="sched-header flex gap-4">
              <button
                onClick={() => setActiveDay('day1')}
                className={`px-8 py-3 font-mono text-sm uppercase tracking-wider transition-colors border ${
                  activeDay === 'day1' 
                    ? 'bg-hyper-cyan text-ink-navy border-hyper-cyan font-bold' 
                    : 'bg-ink-deep text-white/60 border-white/10 hover:border-hyper-cyan/50 hover:text-white'
                }`}
              >
                Day 1
              </button>
              <button
                onClick={() => setActiveDay('day2')}
                className={`px-8 py-3 font-mono text-sm uppercase tracking-wider transition-colors border ${
                  activeDay === 'day2' 
                    ? 'bg-hyper-cyan text-ink-navy border-hyper-cyan font-bold' 
                    : 'bg-ink-deep text-white/60 border-white/10 hover:border-hyper-cyan/50 hover:text-white'
                }`}
              >
                Day 2
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Vertical Track */}
          <div className="absolute left-[8px] md:left-[120px] top-0 bottom-0 w-px bg-white/10" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {SCHEDULE[activeDay].map((item, idx) => (
                <div key={idx} className="sched-item relative flex items-start gap-8 md:gap-16 group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[4px] md:left-[116px] mt-6 w-[9px] h-[9px] rounded-full bg-hyper-cyan/50 group-hover:bg-hyper-cyan group-hover:shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all z-10" />

                  {/* Time */}
                  <div className="hidden md:block w-24 shrink-0 pt-4 text-right">
                    <span className="font-mono text-sm text-hyper-cyan">{item.time}</span>
                  </div>

                  {/* Content Card */}
                  <div className="ml-8 md:ml-0 flex-1">
                    <div className="p-8 bg-ink-deep border border-white/5 group-hover:border-hyper-cyan/30 transition-colors">
                      <div className="flex md:hidden items-center gap-3 mb-4">
                        <span className="text-hyper-cyan font-mono text-sm font-bold">{item.time}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className="font-display text-2xl font-bold text-white">{item.title}</h3>
                        <span className="font-mono text-xs uppercase tracking-wider text-white/40 border border-white/10 px-3 py-1 bg-white/5 inline-block w-fit">
                          {item.venue}
                        </span>
                      </div>
                      <p className="text-white/60 text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
