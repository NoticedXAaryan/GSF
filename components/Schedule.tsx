'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const scheduleData = {
  day1: [
    { time: '09:00 AM', title: 'Registration', venue: 'Seminar Hall', desc: 'Arrive early to collect your badges and welcome kit.', registerable: false },
    { time: '10:00 AM', title: 'Inaugural Ceremony', venue: 'Seminar Hall', desc: 'Kickoff and welcome address by university officials.', registerable: false },
    { time: '11:00 AM', title: 'Signature Talk 1', venue: 'Seminar Hall', desc: 'Chief Guest Address on the startup ecosystem.', registerable: false },
    { time: '11:45 AM', title: 'Ecosystem Connect', venue: 'VC Office', desc: 'Invite-only roundtable discussion with industry leaders.', registerable: false },
    { time: '11:45 AM', title: 'Masterclass Session 1', venue: 'Classroom 120', desc: 'From Idea to Startup - Understanding the Startup Lifecycle.', registerable: true },
    { time: '01:15 PM', title: 'Lunch Break', venue: 'Campus', desc: 'Networking lunch.', registerable: false },
    { time: '02:15 PM', title: 'Fireside Chat', venue: 'Seminar Hall', desc: 'Interactive panel with Investors and Industry.', registerable: false },
    { time: '02:15 PM', title: 'Masterclass Session 2', venue: 'Classroom 120', desc: 'Discover Opportunities - The Art of Idea Generation.', registerable: true },
  ],
  day2: [
    { time: '09:30 AM', title: 'Startup Expo', venue: 'Exhibition Area', desc: 'Showcase of innovative products and technologies. (All Day)', registerable: false },
    { time: '10:00 AM', title: 'Signature Talk 2', venue: 'Seminar Hall', desc: 'Expert keynote on startup growth.', registerable: false },
    { time: '10:00 AM', title: 'Masterclass Session 3', venue: 'Classroom 120', desc: 'Think Like an Innovator - Design Thinking for Startups.', registerable: true },
    { time: '10:45 AM', title: 'Signature Talk 3', venue: 'Seminar Hall', desc: 'Emerging industry trends and opportunities.', registerable: false },
    { time: '11:30 AM', title: 'Idea Competition', venue: 'Seminar Hall', desc: 'Top 10-15 shortlisted teams pitch for the prize pool.', registerable: true },
    { time: '11:30 AM', title: 'Masterclass Session 4', venue: 'Classroom 120', desc: 'Build a Winning Business Model.', registerable: true },
    { time: '01:15 PM', title: 'Lunch Break', venue: 'Campus', desc: 'Networking lunch.', registerable: false },
    { time: '02:00 PM', title: 'Fireside Chat', venue: 'Seminar Hall', desc: 'Panel with investors and industry veterans.', registerable: false },
    { time: '02:45 PM', title: 'Signature Talk 4', venue: 'Seminar Hall', desc: 'Guest of Honor keynote address.', registerable: false },
    { time: '03:30 PM', title: 'Valedictory', venue: 'Seminar Hall', desc: 'Prize distribution for Idea Competition and ReelPitch.', registerable: false },
  ],
};

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      const ctx = gsap.context(() => {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  const currentSchedule = scheduleData[activeDay];

  return (
    <section id="schedule" ref={sectionRef} className="py-24 md:py-40 bg-ink-deep relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-white/5" />
      <div className="absolute inset-0 bg-accent-pink-muted opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div ref={headerRef} className="max-w-4xl mx-auto mb-16 md:mb-24 text-center md:text-left">
          <p className="font-mono text-xs text-accent-pink uppercase tracking-widest mb-4">
            Plan Your Experience
          </p>
          <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-white">
            EVENT SCHEDULE
          </h2>
          
          <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
            <button
              onClick={() => setActiveDay('day1')}
              className={`font-display text-sm uppercase tracking-wider px-8 py-3 border transition-colors duration-300 ${
                activeDay === 'day1'
                  ? 'bg-accent-pink text-white border-accent-pink'
                  : 'bg-transparent text-white/50 border-white/10 hover:border-accent-pink/50 hover:text-white'
              }`}
            >
              Day 1 - March 15
            </button>
            <button
              onClick={() => setActiveDay('day2')}
              className={`font-display text-sm uppercase tracking-wider px-8 py-3 border transition-colors duration-300 ${
                activeDay === 'day2'
                  ? 'bg-accent-pink text-white border-accent-pink'
                  : 'bg-transparent text-white/50 border-white/10 hover:border-accent-pink/50 hover:text-white'
              }`}
            >
              Day 2 - March 16
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Timeline Line */}
          <div className="absolute top-0 bottom-0 left-[20px] md:left-[120px] w-px bg-white/10 z-0" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative z-10"
            >
              {currentSchedule.map((item, index) => (
                <div key={index} className="group relative flex gap-6 md:gap-12 mb-8 md:mb-12 last:mb-0">
                  
                  {/* Desktop Time Column */}
                  <div className="hidden md:block w-24 flex-shrink-0 text-right pt-6">
                    <span className="font-mono text-sm text-accent-pink">
                      {item.time}
                    </span>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-[16px] md:left-[116px] top-[32px] w-[9px] h-[9px] rounded-full bg-accent-pink/50 group-hover:bg-accent-pink group-hover:shadow-[0_0_10px_rgba(233,30,143,0.8)] transition-all duration-300 z-10" />

                  {/* Card Content */}
                  <div className="flex-1 ml-10 md:ml-0">
                    <div className="bg-ink-card border border-white/[0.06] p-6 md:p-8 transition-colors duration-300 group-hover:border-accent-pink/30 flex flex-col items-start gap-4">
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-3 md:gap-0">
                        <div className="flex flex-col gap-2">
                          <span className="md:hidden font-mono text-sm text-accent-pink">
                            {item.time}
                          </span>
                          <h3 className="font-display text-xl md:text-2xl font-bold uppercase text-white">
                            {item.title}
                          </h3>
                        </div>
                        <span className="font-mono text-xs uppercase text-white/40 border border-white/10 px-3 py-1 bg-white/5 self-start md:self-center whitespace-nowrap">
                          {item.venue}
                        </span>
                      </div>
                      
                      <p className="text-white/50 text-base max-w-2xl">
                        {item.desc}
                      </p>

                      {item.registerable && (
                        <div className="mt-2">
                          <Link href="/register" className="inline-block bg-accent-pink hover:bg-accent-pink/90 text-white font-display text-xs uppercase tracking-wider px-4 py-2 transition-colors">
                            Register
                          </Link>
                        </div>
                      )}
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
