'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SCHEDULE = {
  day1: [
    { time: '09:00 AM', title: 'Registration', venue: 'Seminar Hall', desc: 'Arrive early to collect your badges and welcome kit.' },
    { time: '10:00 AM', title: 'Inaugural Ceremony', venue: 'Seminar Hall', desc: 'Kickoff and welcome address by university officials.' },
    { time: '11:00 AM', title: 'Signature Talk 1', venue: 'Seminar Hall', desc: 'Chief Guest Address on the startup ecosystem.' },
    { time: '11:45 AM', title: 'Startup Ecosystem Connect', venue: 'VC Office', desc: 'Invite-only roundtable discussion with industry leaders.' },
    { time: '11:45 AM', title: 'Masterclass Session 1', venue: 'Classroom 120', desc: 'From Idea to Startup - Understanding the Startup Lifecycle.' },
    { time: '01:15 PM', title: 'Lunch Break', venue: 'Campus', desc: 'Networking lunch.' },
    { time: '02:15 PM', title: 'Fireside Chat', venue: 'Seminar Hall', desc: 'Interactive panel with Investors and Industry.' },
    { time: '02:15 PM', title: 'Masterclass Session 2', venue: 'Classroom 120', desc: 'Discover Opportunities - The Art of Idea Generation.' },
  ],
  day2: [
    { time: '09:30 AM', title: 'Startup Expo (All Day)', venue: 'Exhibition Area', desc: 'Showcase of innovative products and technologies.' },
    { time: '10:00 AM', title: 'Signature Talk 2', venue: 'Seminar Hall', desc: 'Expert keynote on startup growth.' },
    { time: '10:00 AM', title: 'Masterclass Session 3', venue: 'Classroom 120', desc: 'Think Like an Innovator - Design Thinking for Startups.' },
    { time: '10:45 AM', title: 'Signature Talk 3', venue: 'Seminar Hall', desc: 'Emerging industry trends and opportunities.' },
    { time: '11:30 AM', title: 'Idea Competition Finals', venue: 'Seminar Hall', desc: 'Top 10-15 shortlisted teams pitch for the prize pool.' },
    { time: '11:30 AM', title: 'Masterclass Session 4', venue: 'Classroom 120', desc: 'Build a Winning Business Model.' },
    { time: '01:15 PM', title: 'Lunch Break', venue: 'Campus', desc: 'Networking lunch.' },
    { time: '02:00 PM', title: 'Fireside Chat', venue: 'Seminar Hall', desc: 'Panel with investors and industry veterans.' },
    { time: '02:45 PM', title: 'Signature Talk 4', venue: 'Seminar Hall', desc: 'Guest of Honor keynote address.' },
    { time: '03:30 PM', title: 'Valedictory Ceremony', venue: 'Seminar Hall', desc: 'Prize distribution for Idea Competition and ReelPitch.' },
  ],
};

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');

  return (
    <section id="schedule" className="py-24 relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-blue-500 font-medium tracking-wider uppercase text-sm mb-4 block">
            The Agenda
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-8">
            Event Schedule
          </h2>
          
          <div className="inline-flex bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setActiveDay('day1')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeDay === 'day1' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Day 1 (Sept 2)
            </button>
            <button
              onClick={() => setActiveDay('day2')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeDay === 'day2' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Day 2 (Sept 3)
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-white/10" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {SCHEDULE[activeDay].map((item, idx) => (
                <div key={idx} className="relative flex items-center md:justify-between md:odd:flex-row-reverse group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[31px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full border-2 border-blue-500 bg-[#0A0A0A] z-10 group-hover:bg-blue-500 transition-colors" />

                  {/* Empty space for alternating layout on desktop */}
                  <div className="hidden md:block md:w-[45%]" />

                  {/* Content Card */}
                  <div className="ml-20 md:ml-0 md:w-[45%] w-full">
                    <div className="p-6 rounded-2xl card-glass border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-blue-400 font-mono text-sm font-medium">{item.time}</span>
                        <span className="text-xs px-2 py-1 rounded bg-white/5 text-white/50 border border-white/10">{item.venue}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-white/60 text-sm">{item.desc}</p>
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
